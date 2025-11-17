'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { apiClient } from '@/lib/api-client';
import { toast } from 'react-toastify';
import { Settings, Palette, Globe, Bell, FileText } from 'lucide-react';

interface SystemSettings {
  id: number;
  app_name: string;
  company_name: string;
  logo: File | null;
  logo_url: string | null;
  favicon: File | null;
  favicon_url: string | null;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  sidebar_color: string;
  timezone: string;
  language: string;
  date_format: string;
  items_per_page: number;
  enable_email_notifications: boolean;
  enable_data_export: boolean;
  max_file_upload_size_mb: number;
  support_email: string;
  support_phone: string;
  footer_text: string;
  show_powered_by: boolean;
  updated_at: string;
  updated_by: number | null;
  updated_by_username: string | null;
}

type TabType = 'branding' | 'theme' | 'localization' | 'preferences' | 'contact';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('branding');
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<SystemSettings>>({});
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await apiClient.getSystemSettings();
      setSettings(response.data);
      setFormData(response.data);
      setLogoPreview(response.data.logo_url);
      setFaviconPreview(response.data.favicon_url);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (field: 'logo' | 'favicon', file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (field === 'logo') {
          setLogoPreview(reader.result as string);
        } else {
          setFaviconPreview(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
      handleInputChange(field, file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const submitData = new FormData();
      
      // Add all fields to FormData
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined && key !== 'logo_url' && key !== 'favicon_url') {
          if (value instanceof File) {
            submitData.append(key, value);
          } else if (typeof value === 'boolean') {
            submitData.append(key, value.toString());
          } else {
            submitData.append(key, value.toString());
          }
        }
      });

      const response = await apiClient.updateSystemSettings(submitData);
      setSettings(response.data);
      setFormData(response.data);
      toast.success('Settings updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'branding' as TabType, label: 'Branding', icon: FileText },
    { id: 'theme' as TabType, label: 'Theme', icon: Palette },
    { id: 'localization' as TabType, label: 'Localization', icon: Globe },
    { id: 'preferences' as TabType, label: 'Preferences', icon: Settings },
    { id: 'contact' as TabType, label: 'Contact', icon: Bell },
  ];

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading settings...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600 mt-2">Configure global system settings and preferences</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
          {/* Branding Tab */}
          {activeTab === 'branding' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Branding Settings</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Application Name
                  </label>
                  <input
                    type="text"
                    value={formData.app_name || ''}
                    onChange={(e) => handleInputChange('app_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={formData.company_name || ''}
                    onChange={(e) => handleInputChange('company_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Logo
                  </label>
                  {logoPreview && (
                    <div className="mb-2">
                      <img src={logoPreview} alt="Logo preview" className="h-20 object-contain" />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml"
                    onChange={(e) => handleFileChange('logo', e.target.files?.[0] || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG, or SVG</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Favicon
                  </label>
                  {faviconPreview && (
                    <div className="mb-2">
                      <img src={faviconPreview} alt="Favicon preview" className="h-8 object-contain" />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/x-icon,image/png"
                    onChange={(e) => handleFileChange('favicon', e.target.files?.[0] || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <p className="text-xs text-gray-500 mt-1">ICO or PNG</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Footer Text
                </label>
                <input
                  type="text"
                  value={formData.footer_text || ''}
                  onChange={(e) => handleInputChange('footer_text', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="© 2025 Your Company. All rights reserved."
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="show_powered_by"
                  checked={formData.show_powered_by || false}
                  onChange={(e) => handleInputChange('show_powered_by', e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label htmlFor="show_powered_by" className="ml-2 text-sm text-gray-700">
                  Show &quot;Powered by&quot; text in footer
                </label>
              </div>
            </div>
          )}

          {/* Theme Tab */}
          {activeTab === 'theme' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Theme Colors</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={formData.primary_color || '#3B82F6'}
                      onChange={(e) => handleInputChange('primary_color', e.target.value)}
                      className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.primary_color || '#3B82F6'}
                      onChange={(e) => handleInputChange('primary_color', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="#3B82F6"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Secondary Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={formData.secondary_color || '#10B981'}
                      onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                      className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.secondary_color || '#10B981'}
                      onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="#10B981"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Accent Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={formData.accent_color || '#F59E0B'}
                      onChange={(e) => handleInputChange('accent_color', e.target.value)}
                      className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.accent_color || '#F59E0B'}
                      onChange={(e) => handleInputChange('accent_color', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="#F59E0B"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sidebar Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={formData.sidebar_color || '#1F2937'}
                      onChange={(e) => handleInputChange('sidebar_color', e.target.value)}
                      className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.sidebar_color || '#1F2937'}
                      onChange={(e) => handleInputChange('sidebar_color', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="#1F2937"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Theme colors will be applied after saving and refreshing the page.
                </p>
              </div>
            </div>
          )}

          {/* Localization Tab */}
          {activeTab === 'localization' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Localization Settings</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timezone
                  </label>
                  <select
                    value={formData.timezone || 'UTC'}
                    onChange={(e) => handleInputChange('timezone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="UTC">UTC</option>
                    <option value="Africa/Nairobi">East Africa Time (EAT)</option>
                    <option value="Africa/Lagos">West Africa Time (WAT)</option>
                    <option value="Africa/Johannesburg">South Africa Time (SAST)</option>
                    <option value="Africa/Cairo">Egypt Time (EET)</option>
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    <option value="Europe/London">Greenwich Mean Time (GMT)</option>
                    <option value="Europe/Paris">Central European Time (CET)</option>
                    <option value="Asia/Dubai">Gulf Standard Time (GST)</option>
                    <option value="Asia/Kolkata">India Standard Time (IST)</option>
                    <option value="Asia/Shanghai">China Standard Time (CST)</option>
                    <option value="Asia/Tokyo">Japan Standard Time (JST)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language
                  </label>
                  <select
                    value={formData.language || 'en'}
                    onChange={(e) => handleInputChange('language', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="en">English</option>
                    <option value="fr">French</option>
                    <option value="es">Spanish</option>
                    <option value="pt">Portuguese</option>
                    <option value="ar">Arabic</option>
                    <option value="sw">Swahili</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Format
                  </label>
                  <select
                    value={formData.date_format || 'YYYY-MM-DD'}
                    onChange={(e) => handleInputChange('date_format', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="YYYY-MM-DD">YYYY-MM-DD (2025-01-15)</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY (15/01/2025)</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY (01/15/2025)</option>
                    <option value="DD-MM-YYYY">DD-MM-YYYY (15-01-2025)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">System Preferences</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Items Per Page
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="100"
                    value={formData.items_per_page || 10}
                    onChange={(e) => handleInputChange('items_per_page', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max File Upload Size (MB)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={formData.max_file_upload_size_mb || 50}
                    onChange={(e) => handleInputChange('max_file_upload_size_mb', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enable_email_notifications"
                    checked={formData.enable_email_notifications || false}
                    onChange={(e) => handleInputChange('enable_email_notifications', e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <label htmlFor="enable_email_notifications" className="ml-2 text-sm text-gray-700">
                    Enable email notifications system-wide
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enable_data_export"
                    checked={formData.enable_data_export || false}
                    onChange={(e) => handleInputChange('enable_data_export', e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <label htmlFor="enable_data_export" className="ml-2 text-sm text-gray-700">
                    Allow users to export data
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Contact Tab */}
          {activeTab === 'contact' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Contact Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Support Email
                  </label>
                  <input
                    type="email"
                    value={formData.support_email || ''}
                    onChange={(e) => handleInputChange('support_email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="support@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Support Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.support_phone || ''}
                    onChange={(e) => handleInputChange('support_phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end pt-6 border-t border-gray-200 mt-6">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

