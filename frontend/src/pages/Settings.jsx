import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { settingsApi } from '../services/api';

// Import settings components
import SettingsSidebar from '../components/settings/Sidebar';
import ProfileSettings from '../components/settings/ProfileSettings';
import SecuritySettings from '../components/settings/SecuritySettings';
import Preferences from '../components/settings/Preferences';
import AISettings from '../components/settings/AISettings';
import Appearance from '../components/settings/Appearance';

const Icon = ({ d, className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
  </svg>
);

const ICONS = {
  settings: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
  user: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  loading: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
};

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Fetch settings on component mount
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await settingsApi.getSettings();
      
      if (response.success) {
        setSettings(response.data);
      } else {
        setError('Failed to load settings');
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const handleSettingsUpdate = (updatedSection) => {
    setSettings(prev => ({
      ...prev,
      ...updatedSection
    }));
  };

  const renderActiveComponent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading settings...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Icon d={ICONS.settings} className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 mb-4">{error}</p>
            <button
              onClick={fetchSettings}
              className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    const commonProps = {
      onUpdate: handleSettingsUpdate,
      loading: false
    };

    switch (activeTab) {
      case 'profile':
        return (
          <ProfileSettings
            profile={{
              ...settings?.profile,
              email: settings?.email // Would come from user data
            }}
            {...commonProps}
          />
        );
      
      case 'security':
        return (
          <SecuritySettings
            security={settings?.security}
            {...commonProps}
          />
        );
      
      case 'preferences':
        return (
          <Preferences
            preferences={settings?.preferences}
            {...commonProps}
          />
        );
      
      case 'ai':
        return (
          <AISettings
            aiSettings={settings?.aiSettings}
            {...commonProps}
          />
        );
      
      case 'appearance':
        return (
          <Appearance
            appearance={settings?.appearance}
            {...commonProps}
          />
        );
      
      default:
        return (
          <div className="flex items-center justify-center h-64">
            <p className="text-slate-600">Select a settings category</p>
          </div>
        );
    }
  };

  return (
    <DashboardLayout
      pageTitle="Settings"
      pageSubtitle="Manage your account preferences and settings"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <SettingsSidebar
              activeTab={activeTab}
              onTabChange={handleTabChange}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1 min-h-[600px]">
            <div className="bg-white rounded-xl border border-slate-200">
              <div className="p-6">
                {renderActiveComponent()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
