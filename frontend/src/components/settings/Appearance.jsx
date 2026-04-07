import { useState, useEffect } from 'react';
import { settingsApi } from '../../services/api';

const Icon = ({ d, className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
  </svg>
);

const ICONS = {
  sun: "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z",
  moon: "M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z",
  monitor: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  globe: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9",
  compress: "M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4",
  sparkles: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z",
};

export default function Appearance({ appearance, onUpdate }) {
  const [formData, setFormData] = useState({
    theme: appearance?.theme || 'light',
    language: appearance?.language || 'en',
    compactMode: appearance?.compactMode || false,
    animationsEnabled: appearance?.animationsEnabled !== false
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    
    if (formData.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Save to localStorage for immediate effect
    localStorage.setItem('theme', formData.theme);
  }, [formData.theme]);

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
        appearance: formData
      });

      setSuccess('Appearance settings saved successfully');
      if (onUpdate) {
        onUpdate({ ...appearance, ...formData });
      }
    } catch (error) {
      console.error('Failed to save appearance settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const themes = [
    { 
      value: 'light', 
      label: 'Light', 
      description: 'Clean and bright interface',
      icon: ICONS.sun,
      preview: 'bg-white border-slate-200'
    },
    { 
      value: 'dark', 
      label: 'Dark', 
      description: 'Easy on the eyes in low light',
      icon: ICONS.moon,
      preview: 'bg-slate-900 border-slate-700'
    },
    { 
      value: 'system', 
      label: 'System', 
      description: 'Follow your device preference',
      icon: ICONS.monitor,
      preview: 'bg-slate-100 border-slate-300'
    }
  ];

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Español' },
    { value: 'fr', label: 'Français' },
    { value: 'de', label: 'Deutsch' },
    { value: 'zh', label: 'Chinese' }
  ];

  return (
    <div className="space-y-6">
      {/* Theme Selection */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Icon d={ICONS.sun} className="w-5 h-5 text-amber-600" />
          <h3 className="text-lg font-semibold text-slate-800">Theme</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {themes.map((theme) => (
            <label
              key={theme.value}
              className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                formData.theme === theme.value
                  ? 'border-amber-500 bg-amber-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <input
                type="radio"
                name="theme"
                value={theme.value}
                checked={formData.theme === theme.value}
                onChange={handleInputChange}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Icon d={theme.icon} className="w-5 h-5 text-amber-600" />
                  <div className="font-medium text-slate-800">{theme.label}</div>
                </div>
                <div className="text-sm text-slate-500 mb-2">{theme.description}</div>
                <div className={`w-full h-8 rounded border-2 ${theme.preview}`}></div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Language */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Icon d={ICONS.globe} className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-slate-800">Language</h3>
        </div>
        
        <select
          name="language"
          value={formData.language}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        >
          {languages.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>
        
        <p className="text-sm text-slate-500 mt-2">
          Note: Translation support is coming soon
        </p>
      </div>

      {/* Interface Options */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Interface Options</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Icon d={ICONS.compress} className="w-5 h-5 text-slate-600" />
              <div>
                <div className="font-medium text-slate-800">Compact Mode</div>
                <div className="text-sm text-slate-500">
                  Reduce spacing and show more content
                </div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="compactMode"
                checked={formData.compactMode}
                onChange={handleInputChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Icon d={ICONS.sparkles} className="w-5 h-5 text-slate-600" />
              <div>
                <div className="font-medium text-slate-800">Animations</div>
                <div className="text-sm text-slate-500">
                  Enable smooth transitions and micro-interactions
                </div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="animationsEnabled"
                checked={formData.animationsEnabled}
                onChange={handleInputChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Preview</h3>
        
        <div className="p-4 border border-slate-200 rounded-lg">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center">
                <Icon d={ICONS.sun} className="w-4 h-4 text-brand-600" />
              </div>
              <div>
                <div className="font-medium text-slate-800">Sample Card</div>
                <div className="text-sm text-slate-500">
                  This is how your interface will look
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-brand-600 text-white text-sm rounded-lg">
                Primary Action
              </button>
              <button className="px-3 py-1 border border-slate-300 text-slate-700 text-sm rounded-lg">
                Secondary Action
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            'Save Appearance'
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
