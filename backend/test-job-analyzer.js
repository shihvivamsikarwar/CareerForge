/**
 * Test script for Job Analyzer functionality
 * Run with: node test-job-analyzer.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Resume = require('./src/models/Resume');
const User = require('./src/models/User');
const { analyzeJobMatch } = require('./src/services/jobAnalyzerAI');

async function testJobAnalyzer() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/careerforge');
    console.log('✅ Connected to MongoDB');

    // Find a test user with resume
    const user = await User.findOne();
    if (!user) {
      console.log('❌ No users found in database');
      return;
    }

    console.log(`✅ Found user: ${user.email}`);

    // Find user's resume
    const resume = await Resume.findOne({ userId: user._id }).sort({ createdAt: -1 });
    if (!resume) {
      console.log('❌ No resume found for user');
      return;
    }

    console.log(`✅ Found resume: ${resume.originalFileName}`);
    console.log(`📄 Resume text length: ${resume.extractedText?.length || 0} characters`);

    // Test job analysis
    const testJobDescription = `
    Senior Frontend Developer at TechCorp
    
    We are looking for an experienced Frontend Developer to join our team.
    
    Requirements:
    - 5+ years of experience with React and TypeScript
    - Strong knowledge of modern JavaScript (ES6+)
    - Experience with state management (Redux, Context API)
    - Familiarity with REST APIs and GraphQL
    - Knowledge of testing frameworks (Jest, React Testing Library)
    - Experience with CI/CD pipelines
    - Understanding of responsive design and accessibility
    
    Nice to have:
    - Next.js experience
    - Docker knowledge
    - Cloud platform experience (AWS/GCP)
    `;

    console.log('🔍 Analyzing job description...');
    const analysis = await analyzeJobMatch(testJobDescription, resume);
    
    console.log('✅ Analysis complete!');
    console.log('📊 Results:', JSON.stringify(analysis, null, 2));

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testJobAnalyzer();
