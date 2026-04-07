import { useState } from 'react';
import { settingsApi } from '../../services/api';

const Icon = ({ d, className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
  </svg>
);

const ICONS = {
  brain: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
  message: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
  lightning: "M13 10V3L4 14h7v7l9-11h-7z",
  lightbulb: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
};

export default function AISettings({ aiSettings, onUpdate }) {
  const [formData, setFormData] = useState({
    feedbackLevel: aiSettings?.feedbackLevel || 'advanced',
    interviewStyle: aiSettings?.interviewStyle || 'professional',
    responseSpeed: aiSettings?.responseSpeed || 'normal',
    enableHints: aiSettings?.enableHints !== false
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setSuccess('');
  };

  const handleSave = async () => {
    setLoading(true);
    
    try {
      await settingsApi.updateSettings({
        aiSettings: formData
      });

      setSuccess('AI settings saved successfully');
      if (onUpdate) {
        onUpdate({ ...aiSettings, ...formData });
      }
    } catch (error) {
      console.error('Failed to save AI settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const feedbackLevels = [
    { 
      value: 'basic', 
      label: 'Basic', 
      description: 'Simple feedback with overall score and general suggestions',
      icon: ICONS.message
    },
    { 
      value: 'advanced', 
      label: 'Advanced', 
      description: 'Detailed feedback with specific areas for improvement',
      icon: ICONS.brain
    },
    { 
      value: 'expert', 
      label: 'Expert', 
      description: 'Comprehensive analysis with strategic recommendations',
      icon: ICONS.lightbulb
    }
  ];

  const interviewStyles = [
    { 
      value: 'friendly', 
      label: 'Friendly', 
      description: 'Conversational and encouraging interview style',
      color: 'emerald'
    },
    { 
      value: 'professional', 
      label: 'Professional', 
      description: 'Standard formal interview approach',
      color: 'blue'
    },
    { 
      value: 'strict', 
      label: 'Strict', 
      description: 'Challenging interview with high expectations',
      color: 'red'
    }
  ];

  const responseSpeeds = [
    { value: 'slow', label: 'Slow', description: 'More time to think, relaxed pace' },
    { value: 'normal', label: 'Normal', description: 'Standard response timing' },
    { value: 'fast', label: 'Fast', description: 'Quick responses, time-pressured' }
  ];

  return (
    <div className="space-y-6">
      {/* Feedback Level */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Icon d={ICONS.brain} className="w-5 h-5 text-violet-600" />
          <h3 className="text-lg font-semibold text-slate-800">AI Feedback Level</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {feedbackLevels.map((level) => (
            <label
              key={level.value}
              className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                formData.feedbackLevel === level.value
                  ? 'border-violet-500 bg-violet-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <input
                type="radio"
                name="feedbackLevel"
                value={level.value}
                checked={formData.feedbackLevel === level.value}
                onChange={handleInputChange}
                className="mt-1"
              />
              <div className="flex-1">
                <Icon d={level.icon} className="w-6 h-6 text-violet-600 mb-2" />
                <div className="font-medium text-slate-800">{level.label}</div>
                <div className="text-sm text-slate-500 mt-1">{level.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Interview Style */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Icon d={ICONS.message} className="w-5 h-5 text-brand-600" />
          <h3 className="text-lg font-semibold text-slate-800">Interview Style</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {interviewStyles.map((style) => (
            <label
              key={style.value}
              className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                formData.interviewStyle === style.value
                  ? `border-${style.color}-500 bg-${style.color}-50`
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <input
                type="radio"
                name="interviewStyle"
                value={style.value}
                checked={formData.interviewStyle === style.value}
                onChange={handleInputChange}
                className="mt-1"
              />
              <div className="flex-1">
                <div className={`font-medium text-slate-800`}>{style.label}</div>
                <div className="text-sm text-slate-500 mt-1">{style.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Response Speed */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Icon d={ICONS.lightning} className="w-5 h-5 text-amber-600" />
          <h3 className="text-lg font-semibold text-slate-800">Response Speed</h3>
        </div>
        
        <div className="space-y-3">
          {responseSpeeds.map((speed) => (
            <label
              key={speed.value}
              className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                formData.responseSpeed === speed.value
                  ? 'border-amber-500 bg-amber-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <input
                type="radio"
                name="responseSpeed"
                value={speed.value}
                checked={formData.responseSpeed === speed.value}
                onChange={handleInputChange}
              />
              <div className="flex-1">
                <div className="font-medium text-slate-800">{speed.label}</div>
                <div className="text-sm text-slate-500">{speed.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Additional Options */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Additional Options</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Icon d={ICONS.lightbulb} className="w-5 h-5 text-slate-600" />
              <div>
                <div className="font-medium text-slate-800">Enable Hints</div>
                <div className="text-sm text-slate-500">
                  Show helpful hints during interviews when you're stuck
                </div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="enableHints"
                checked={formData.enableHints}
                onChange={handleInputChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            'Save AI Settings'
          )}
        </button>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-center gap-3">
          <Icon d="M5 13l4 4L19 7" className="w-5 h-5 text-emerald-600" />
          <span className="text-emerald-700">{success}</span>
        </div>
      )}
    </div>
  );
}
