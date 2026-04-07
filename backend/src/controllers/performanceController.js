"use strict";

const Interview = require("../models/Interview");
const { analyzePerformance } = require("../services/performanceAI");

const AI_FEED_LIMIT = 20;
const RECENT_WINDOW = 7;

const clamp = (n, lo, hi) => Math.min(Math.max(n, lo), hi);
const round1 = (n) => Math.round(n * 10) / 10;
const avg = (arr) =>
  arr.length ? round1(arr.reduce((s, v) => s + v, 0) / arr.length) : 0;

const computeTrust = (flagged, total) => {
  if (!total) return 100;
  return clamp(Math.round(100 - (flagged / total) * 60 - flagged * 3), 10, 100);
};

const computeSlope = (arr) => {
  if (arr.length < 2) return 0;
  const n = arr.length,
    xMean = (n - 1) / 2,
    yMean = avg(arr);
  let num = 0,
    den = 0;
  arr.forEach((y, x) => {
    num += (x - xMean) * (y - yMean);
    den += (x - xMean) ** 2;
  });
  return den ? round1(num / den) : 0;
};

// GET /api/performance/summary
const getPerformanceSummary = async (req, res) => {
  try {
    const interviews = await Interview.find({
      userId: req.user._id,
      status: "evaluated",
    }).sort({ createdAt: 1 });

    if (!interviews.length) {
      return res.status(200).json({
        success: true,
        hasData: false,
        message: "No completed interviews yet.",
        summary: null,
        history: [],
        aiInsights: null,
      });
    }

    const scored = interviews.filter((iv) => iv.score !== null);
    const scores = scored.map((iv) => iv.score);
    const flagged = interviews.filter((iv) => iv.isCheatingSuspected).length;
    const total = interviews.length;

    const averageScore = avg(scores);
    const bestScore = scores.length ? Math.max(...scores) : 0;
    const worstScore = scores.length ? Math.min(...scores) : 0;
    const recentScores = scores.slice(-RECENT_WINDOW);
    const recentAverage = avg(recentScores);
    const slope = computeSlope(scores);
    const trustScore = computeTrust(flagged, total);

    const totalQA = interviews.reduce((s, iv) => s + (iv.qa?.length || 0), 0);
    const answeredQA = interviews.reduce(
      (s, iv) => s + (iv.qa?.filter((q) => q.answer?.trim()).length || 0),
      0
    );
    const completionRate = totalQA
      ? Math.round((answeredQA / totalQA) * 100)
      : 0;

    const byType = {};
    interviews.forEach((iv) => {
      if (!byType[iv.type])
        byType[iv.type] = { count: 0, scores: [], bestScore: 0 };
      byType[iv.type].count++;
      if (iv.score !== null) {
        byType[iv.type].scores.push(iv.score);
        byType[iv.type].bestScore = Math.max(
          byType[iv.type].bestScore,
          iv.score
        );
      }
    });

    const typeBreakdown = Object.entries(byType)
      .map(([type, d]) => ({
        type,
        count: d.count,
        averageScore: avg(d.scores),
        bestScore: d.bestScore,
        trend: d.scores,
        slope: computeSlope(d.scores),
      }))
      .sort((a, b) => b.averageScore - a.averageScore);

    const summary = {
      totalInterviews: total,
      averageScore,
      bestScore,
      worstScore,
      recentAverage,
      scoreTrend: scores,
      recentTrend: recentScores,
      slope,
      trustScore,
      suspectedCheatingCount: flagged,
      completionRate,
      typeBreakdown,
    };

    const history = [...interviews].reverse().map((iv) => ({
      id: iv._id,
      type: iv.type,
      title: iv.title || iv.type,
      score: iv.score,
      isCheatingSuspected: iv.isCheatingSuspected,
      integrity: iv.integrity,
      durationSeconds: iv.durationSeconds,
      evaluatedAt: iv.evaluatedAt,
      createdAt: iv.createdAt,
      overallFeedback: iv.feedback?.overallFeedback || "",
      strengths: (iv.feedback?.strengths || []).slice(0, 3),
      weaknesses: (iv.feedback?.weaknesses || []).slice(0, 3),
    }));

    const feedSet = scored.slice(-AI_FEED_LIMIT);
    const allStrengths = feedSet.flatMap((iv) => iv.feedback?.strengths || []);
    const allWeaknesses = feedSet.flatMap(
      (iv) => iv.feedback?.weaknesses || []
    );

    const digest = {
      totalInterviews: total,
      averageScore,
      bestScore,
      worstScore,
      scoreTrend: scores.slice(-30),
      interviewTypes: [...new Set(interviews.map((iv) => iv.type))],
      allStrengths: allStrengths.slice(0, 20),
      allWeaknesses: allWeaknesses.slice(0, 20),
      suspectedCheatingCount: flagged,
    };

    let aiInsights = null;
    try {
      aiInsights = await analyzePerformance(digest);
    } catch (aiErr) {
      console.error("Performance AI error:", aiErr.message);
    }

    console.log(
      `✅ Performance summary — user: ${req.user._id}, sessions: ${total}`
    );

    return res
      .status(200)
      .json({ success: true, hasData: true, summary, history, aiInsights });
  } catch (err) {
    console.error("getPerformanceSummary error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to generate performance summary.",
    });
  }
};

// GET /api/performance/type-breakdown
const getTypeBreakdown = async (req, res) => {
  try {
    const interviews = await Interview.find({
      userId: req.user._id,
      status: "evaluated",
      score: { $ne: null },
    })
      .select("type score createdAt")
      .sort({ createdAt: 1 });

    const byType = {};
    interviews.forEach((iv) => {
      if (!byType[iv.type]) byType[iv.type] = [];
      byType[iv.type].push(iv.score);
    });

    const breakdown = Object.entries(byType).map(([type, sc]) => ({
      type,
      count: sc.length,
      averageScore: avg(sc),
      bestScore: Math.max(...sc),
      worstScore: Math.min(...sc),
      trend: sc,
      slope: computeSlope(sc),
    }));

    return res.status(200).json({ success: true, breakdown });
  } catch (err) {
    console.error("getTypeBreakdown error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch type breakdown." });
  }
};

module.exports = { getPerformanceSummary, getTypeBreakdown };
