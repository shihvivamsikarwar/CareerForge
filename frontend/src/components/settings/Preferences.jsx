import { useState } from 'react';
import { settingsApi } from '../../services/api';

const Icon = ({ d, className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
  </svg>
);

const ICONS = {
  briefcase: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  clock: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  chart: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  save: "M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V2",
};

export default function Preferences({ preferences, onUpdate }) {
  const [formData, setFormData] = useState({
    defaultInterviewType: preferences?.defaultInterviewType || 'technical',
    difficulty: preferences?.difficulty || 'medium',
    sessionDuration: preferences?.sessionDuration || 30,
    autoSaveProgress: preferences?.autoSaveProgress !== false
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
        preferences: formData
      });

      setSuccess('Preferences saved successfully');
      if (onUpdate) {
        onUpdate({ ...preferences, ...formData });
      }
    } catch (error) {
      console.error('Failed to save preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const interviewTypes = [
    { value: 'technical', label: 'Technical', description: 'Focus on coding and technical skills' },
    { value: 'hr', label: 'HR', description: 'Behavioral and situational questions' },
    { value: 'behavioral', label: 'Behavioral', description: 'Soft skills and personality assessment' },
    { value: 'mixed', label: 'Mixed', description: 'Combination of all interview types' }
  ];

  const difficultyLevels = [
    { value: 'easy', label: 'Easy', description: 'Basic questions, ideal for beginners' },
    { value: 'medium', label: 'Medium', description: 'Moderate difficulty, balanced challenge' },
    { value: 'hard', label: 'Hard', description: 'Advanced questions for experienced candidates' }
  ];

  return (
    <div className="space-y-6">
      {/* Interview Type */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Icon d={ICONS.briefcase} className="w-5 h-5 text-brand-600" />
          <h3 className="text-lg font-semibold text-slate-800">Default Interview Type</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {interviewTypes.map((type) => (
            <label
              key={type.value}
              className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                formData.defaultInterviewType === type.value
                  ? 'border-brand-500 bg-brand-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <input
                type="radio"
                name="defaultInterviewType"
                value={type.value}
                checked={formData.defaultInterviewType === type.value}
                onChange={handleInputChange}
                className="mt-1"
              />
              <div>
                <div className="font-medium text-slate-800">{type.label}</div>
                <div className="text-sm text-slate-500 mt-1">{type.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Difficulty Level */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Icon d={ICONS.chart} className="w-5 h-5 text-violet-600" />
          <h3 className="text-lg font-semibold text-slate-800">Difficulty Level</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {difficultyLevels.map((level) => (
            <label
              key={level.value}
              className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                formData.difficulty === level.value
                  ? 'border-violet-500 bg-violet-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <input
                type="radio"
                name="difficulty"
                value={level.value}
                checked={formData.difficulty === level.value}
                onChange={handleInputChange}
                className="mt-1"
              />
              <div>
                <div className="font-medium text-slate-800">{level.label}</div>
                <div className="text-sm text-slate-500 mt-1">{level.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Session Settings */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Icon d={ICONS.clock} className="w-5 h-5 text-emerald-600" />
          <h3 className="text-lg font-semibold text-slate-800">Session Settings</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Default Session Duration: {formData.sessionDuration} minutes
            </label>
            <input
              type="range"
              name="sessionDuration"
              min="15"
              max="120"
              step="5"
              value={formData.sessionDuration}
              onChange={handleInputChange}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>15 min</span>
              <span>60 min</span>
              <span>120 min</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Icon d={ICONS.save} className="w-5 h-5 text-slate-600" />
              <div>
                <div className="font-medium text-slate-800">Auto-save Progress</div>
                <div className="text-sm text-slate-500">
                  Automatically save interview progress every 30 seconds
                </div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="autoSaveProgress"
                checked={formData.autoSaveProgress}
                onChange={handleInputChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-6 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            'Save Preferences'
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
