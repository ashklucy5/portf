'use client';

import { useState } from 'react';
import { 
  Save, RotateCcw, CheckCircle, AlertCircle, Globe, Mail, 
  Search, BarChart3, Shield, Wrench, Loader2 
} from 'lucide-react';

type SettingTab = 'general' | 'contact' | 'seo' | 'analytics' | 'maintenance' | 'security';

interface Settings {
  general: {
    siteName: string;
    tagline: string;
    logoUrl: string;
    faviconUrl: string;
  };
  contact: {
    email: string;
    phone: string;
    address: string;
    whatsapp: string;
    youtube: string;
    linkedin: string;
    twitter: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    ogImage: string;
    keywords: string;
    robots: 'index' | 'noindex';
  };
  analytics: {
    ga4Id: string;
    facebookPixel: string;
    customHeadScript: string;
    customBodyScript: string;
  };
  maintenance: {
    enabled: boolean;
    message: string;
    password: string;
  };
  security: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  };
}

// Static initial state to prevent hydration mismatches
const INITIAL_SETTINGS: Settings = {
  general: {
    siteName: 'GoSarwar',
    tagline: 'Digital Business Growth',
    logoUrl: '/logo.png',
    faviconUrl: '/favicon.ico'
  },
  contact: {
    email: 'info@gosarwar.com',
    phone: '+1 234 567 890',
    address: 'New York, USA',
    whatsapp: 'https://wa.me/1234567890',
    youtube: 'https://youtube.com/@gosarwar',
    linkedin: 'https://linkedin.com/company/gosarwar',
    twitter: 'https://twitter.com/gosarwar'
  },
  seo: {
    metaTitle: 'GoSarwar | Digital Business Growth',
    metaDescription: 'We blend creativity and data to help your business grow exponentially.',
    ogImage: 'https://pub-xxxx.r2.dev/og-image.jpg',
    keywords: 'digital marketing, web design, SEO, business growth',
    robots: 'index'
  },
  analytics: {
    ga4Id: 'G-XXXXXXXXXX',
    facebookPixel: '',
    customHeadScript: '',
    customBodyScript: ''
  },
  maintenance: {
    enabled: false,
    message: 'We are currently performing scheduled maintenance. Please check back soon.',
    password: ''
  },
  security: {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
};

const TABS: { id: SettingTab; label: string; icon: any; description: string }[] = [
  { id: 'general', label: 'General', icon: Globe, description: 'Site name, logo & tagline' },
  { id: 'contact', label: 'Contact & Socials', icon: Mail, description: 'Email, phone & social links' },
  { id: 'seo', label: 'SEO & Metadata', icon: Search, description: 'Page titles, descriptions & OG tags' },
  { id: 'analytics', label: 'Analytics & Scripts', icon: BarChart3, description: 'GA4, pixels & custom code' },
  { id: 'maintenance', label: 'Maintenance', icon: Wrench, description: 'Coming soon mode & access control' },
  { id: 'security', label: 'Security', icon: Shield, description: 'Admin password & session management' },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingTab>('general');
  const [settings, setSettings] = useState<Settings>(INITIAL_SETTINGS);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const updateField = <T extends keyof Settings>(
    section: T,
    field: keyof Settings[T],
    value: any
  ) => {
    setSettings(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setStatus('idle');

    try {
      // 🪄 PRODUCTION: Replace with actual API call
      // await fetch('/api/admin/settings', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(settings)
      // });
      
      await new Promise(r => setTimeout(r, 1000));
      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    } catch {
      setStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSettings(INITIAL_SETTINGS);
    setStatus('idle');
  };

  return (
    <div className="flex h-[calc(100vh-65px)]">
      
      {/* ── LEFT SIDEBAR ── */}
      <div className="w-64 border-r border-gray-200 bg-white p-4 space-y-1 overflow-y-auto shrink-0">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-3">
          Settings
        </h3>
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all text-left ${
                isActive
                  ? 'bg-violet-50 text-violet-700 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-violet-600' : 'text-gray-400'}`} />
              <div className="flex-1 min-w-0">
                <p className="truncate">{tab.label}</p>
                <p className="text-[10px] text-gray-400 truncate">{tab.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── RIGHT: Editor Area ── */}
      <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
        
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {TABS.find(t => t.id === activeTab)?.label}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {TABS.find(t => t.id === activeTab)?.description}
            </p>
          </div>
          {status === 'success' && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium">
              <CheckCircle className="w-4 h-4" /> Settings saved
            </div>
          )}
          {status === 'error' && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-700 rounded-full text-sm font-medium">
              <AlertCircle className="w-4 h-4" /> Failed to save
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto space-y-6">
            
            {/* ── GENERAL ─ */}
            {activeTab === 'general' && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-5">
                <Field label="Site Name" value={settings.general.siteName} onChange={v => updateField('general', 'siteName', v)} />
                <Field label="Tagline" value={settings.general.tagline} onChange={v => updateField('general', 'tagline', v)} />
                <Field label="Logo URL" value={settings.general.logoUrl} onChange={v => updateField('general', 'logoUrl', v)} />
                <Field label="Favicon URL" value={settings.general.faviconUrl} onChange={v => updateField('general', 'faviconUrl', v)} />
              </div>
            )}

            {/* ── CONTACT & SOCIALS ── */}
            {activeTab === 'contact' && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field label="Email" type="email" value={settings.contact.email} onChange={v => updateField('contact', 'email', v)} />
                  <Field label="Phone" type="tel" value={settings.contact.phone} onChange={v => updateField('contact', 'phone', v)} />
                </div>
                <Field label="Address" value={settings.contact.address} onChange={v => updateField('contact', 'address', v)} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field label="WhatsApp Link" type="url" value={settings.contact.whatsapp} onChange={v => updateField('contact', 'whatsapp', v)} />
                  <Field label="YouTube Link" type="url" value={settings.contact.youtube} onChange={v => updateField('contact', 'youtube', v)} />
                  <Field label="LinkedIn Link" type="url" value={settings.contact.linkedin} onChange={v => updateField('contact', 'linkedin', v)} />
                  <Field label="Twitter/X Link" type="url" value={settings.contact.twitter} onChange={v => updateField('contact', 'twitter', v)} />
                </div>
              </div>
            )}

            {/* ── SEO & METADATA ── */}
            {activeTab === 'seo' && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-5">
                <Field label="Meta Title" value={settings.seo.metaTitle} onChange={v => updateField('seo', 'metaTitle', v)} />
                <Field label="Meta Description" multiline value={settings.seo.metaDescription} onChange={v => updateField('seo', 'metaDescription', v)} />
                <Field label="Open Graph Image URL" type="url" value={settings.seo.ogImage} onChange={v => updateField('seo', 'ogImage', v)} />
                <Field label="Keywords (comma separated)" value={settings.seo.keywords} onChange={v => updateField('seo', 'keywords', v)} />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Robots Directive</label>
                  <select
                    value={settings.seo.robots}
                    onChange={e => updateField('seo', 'robots', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm bg-white"
                  >
                    <option value="index">Index (Allow search engines)</option>
                    <option value="noindex">No-Index (Hide from search engines)</option>
                  </select>
                </div>
              </div>
            )}

            {/* ── ANALYTICS & SCRIPTS ── */}
            {activeTab === 'analytics' && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-5">
                <Field label="Google Analytics 4 ID" placeholder="G-XXXXXXXXXX" value={settings.analytics.ga4Id} onChange={v => updateField('analytics', 'ga4Id', v)} />
                <Field label="Facebook Pixel ID" placeholder="123456789012345" value={settings.analytics.facebookPixel} onChange={v => updateField('analytics', 'facebookPixel', v)} />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Custom &lt;head&gt; Scripts</label>
                  <textarea
                    value={settings.analytics.customHeadScript}
                    onChange={e => updateField('analytics', 'customHeadScript', e.target.value)}
                    placeholder="<script>...</script>"
                    rows={4}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm font-mono resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">Injected before &lt;/head&gt;</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Custom &lt;body&gt; Scripts</label>
                  <textarea
                    value={settings.analytics.customBodyScript}
                    onChange={e => updateField('analytics', 'customBodyScript', e.target.value)}
                    placeholder="<script>...</script>"
                    rows={4}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm font-mono resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">Injected before &lt;/body&gt;</p>
                </div>
              </div>
            )}

            {/* ── MAINTENANCE ── */}
            {activeTab === 'maintenance' && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-5">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div>
                    <p className="font-medium text-gray-900">Maintenance Mode</p>
                    <p className="text-sm text-gray-500">Show a "Coming Soon" page to visitors</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.maintenance.enabled}
                      onChange={e => updateField('maintenance', 'enabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-violet-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                  </label>
                </div>

                {settings.maintenance.enabled && (
                  <>
                    <Field label="Maintenance Message" multiline value={settings.maintenance.message} onChange={v => updateField('maintenance', 'message', v)} />
                    <Field label="Access Password (optional)" type="password" placeholder="Leave empty to block all visitors" value={settings.maintenance.password} onChange={v => updateField('maintenance', 'password', v)} />
                  </>
                )}
              </div>
            )}

            {/* ── SECURITY ─ */}
            {activeTab === 'security' && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-5">
                <Field label="Current Password" type="password" value={settings.security.currentPassword} onChange={v => updateField('security', 'currentPassword', v)} />
                <Field label="New Password" type="password" value={settings.security.newPassword} onChange={v => updateField('security', 'newPassword', v)} />
                <Field label="Confirm New Password" type="password" value={settings.security.confirmPassword} onChange={v => updateField('security', 'confirmPassword', v)} />
                
                <div className="pt-4 border-t border-gray-100">
                  <button className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Log out all other sessions
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Sticky Footer */}
        <div className="shrink-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition text-sm"
          >
            <RotateCcw className="w-4 h-4" /> Reset to Defaults
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-violet-600 text-white font-medium rounded-xl shadow-md shadow-violet-500/20 hover:bg-violet-700 disabled:opacity-70 disabled:cursor-not-allowed transition text-sm"
          >
            {saving
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
              : <><Save className="w-4 h-4" /> Save Settings</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}

// Reusable Field Component
function Field({ 
  label, 
  value, 
  onChange, 
  type = 'text', 
  placeholder, 
  multiline = false 
}: { 
  label: string; 
  value: string | number | readonly string[] | undefined; 
  onChange: (val: string) => void; 
  type?: string; 
  placeholder?: string;
  multiline?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {multiline ? (
        <textarea
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm resize-none"
        />
      ) : (
        <input
          type={type || 'text'}
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
        />
      )}
    </div>
  );
}