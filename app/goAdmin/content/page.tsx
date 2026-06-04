// app/goAdmin/content/page.tsx
'use client';
import { useState, useEffect, useCallback } from 'react';
import { 
  Save, RotateCcw, CheckCircle, AlertCircle, FileText, Info, Layers, 
  Users, Layout, Globe, Menu, X, Upload, Loader2, Languages,
  TrendingUp
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

type SectionKey = 'hero' | 'about' | 'services' | 'team' | 'footer' | 'collaborations';

interface BilingualContent {
  en: Record<SectionKey, any>;
  zh: Record<SectionKey, any>;
}

// ✅ Fallback only — used if Supabase fetch fails or DB is empty
const FALLBACK_DATA: BilingualContent = {
  en: {
    hero: {
      tagline: 'Increase your sales',
      titleStart: 'Grow your',
      titleHighlight: 'digital business',
      titleMiddle: 'with us & make',
      titleEnd: 'Success',
      cta: 'Get Start a Project',
      teamCard: { title: 'The most experienced team we have for you.' },
      servicesList: ['SEO', 'Graphic Design', 'PPC', 'Virtual Assistant', 'Social Media Marketing', 'Content Marketing', 'Web Design'],
      trust: { text: 'Trusted by 50,000+ teams to communicate easily' },
      heroImage: ''
    },
    about: {
      badge: 'About Us', title: 'Who We Are',
      subtitle: '', heading: '', description: '', aboutImage: '',
      features: {
        strategy: { title: 'Creative Strategy', desc: '' },
        growth: { title: 'Data Driven', desc: '' },
        team: { title: 'Expert Team', desc: '' },
        secure: { title: 'Secure & Reliable', desc: '' }
      }
    },
    services: {
      title: 'Business Services', subtitle: '',
      items: {
        seo: { title: 'SEO Optimization', desc: '' },
        design: { title: 'UI/UX Design', desc: '' },
        marketing: { title: 'Digital Marketing', desc: '' },
        ecommerce: { title: 'E-Commerce', desc: '' },
        analytics: { title: 'Analytics', desc: '' },
        support: { title: '24/7 Support', desc: '' }
      }
    },
    team: {
      title: 'Meet Our Team', subtitle: '',
      members: { CEO: '', CTO: '', Designer: '', DevLead: '' }
    },
    collaborations: {
      title: 'Collaborations',
      subtitle: 'Building partnerships and creating memories together',
      items: {
        '1': { title: 'Tech Company Visit', description: 'Meeting with the development team', location: 'Shanghai, China' },
        '2': { title: 'Partnership Signing', description: 'Official partnership agreement', location: 'Beijing, China' },
        '3': { title: 'Team Collaboration', description: 'Working session with marketing team', location: 'Guangzhou, China' },
        '4': { title: 'Product Launch', description: 'Joint product launch event', location: 'Shenzhen, China' },
      }
    },
    footer: { title: 'Contact Us', subtitle: '', phone: '', whatsapp: '', email: '', youtube: '' }
  },
  zh: {
    hero: {
      tagline: '提升您的销售额',
      titleStart: '与我们一起发展',
      titleHighlight: '数字业务',
      titleMiddle: '共创',
      titleEnd: '成功',
      cta: '开始项目',
      teamCard: { title: '我们为您提供经验最丰富的团队。' },
      servicesList: ['SEO优化', '平面设计', 'PPC广告', '虚拟助理', '社交媒体营销', '内容营销', '网页设计'],
      trust: { text: '全球50,000+团队信赖的沟通平台' },
      heroImage: ''
    },
    about: {
      badge: '关于我们', title: '我们是谁',
      subtitle: '', heading: '', description: '', aboutImage: '',
      features: {
        strategy: { title: '创意策略', desc: '' },
        growth: { title: '数据驱动', desc: '' },
        team: { title: '专业团队', desc: '' },
        secure: { title: '安全可靠', desc: '' }
      }
    },
    services: {
      title: '企业服务', subtitle: '',
      items: {
        seo: { title: 'SEO优化', desc: '' },
        design: { title: 'UI/UX设计', desc: '' },
        marketing: { title: '数字营销', desc: '' },
        ecommerce: { title: '电子商务', desc: '' },
        analytics: { title: '数据分析', desc: '' },
        support: { title: '全天候支持', desc: '' }
      }
    },
    team: {
      title: '认识我们的团队', subtitle: '',
      members: { CEO: '王经理', CTO: '李技术', Designer: '陈设计', DevLead: '刘开发' }
    },
    collaborations: {
      title: '合作',
      subtitle: '建立合作伙伴关系，共同创造美好回忆',
      items: {
        '1': { title: '科技公司访问', description: '与开发团队会面讨论项目合作', location: '中国上海' },
        '2': { title: '合作签约', description: '正式合作协议签约仪式', location: '中国北京' },
        '3': { title: '团队协作', description: '与市场团队工作会议', location: '中国广州' },
        '4': { title: '产品发布', description: '联合产品发布会', location: '中国深圳' },
      }
    },
    footer: { title: '联系我们', subtitle: '', phone: '', whatsapp: '', email: '', youtube: '' }
  }
};

const SECTIONS: { id: SectionKey; label: string; icon: any }[] = [
  { id: 'hero', label: 'Hero Section', icon: Layout },
  { id: 'about', label: 'About Section', icon: Info },
  { id: 'services', label: 'Services', icon: Layers },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'collaborations', label: 'Collaborations', icon: Users },
  { id: 'footer', label: 'Footer', icon: FileText },
];

export default function ContentEditor() {
  const [activeSection, setActiveSection] = useState<SectionKey>('hero');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // ✅ State starts as null to indicate "Loading..."
  const [content, setContent] = useState<BilingualContent | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);

  // ✅ 1. FETCH ACTUAL DATA FROM SUPABASE
  const fetchContent = useCallback(async () => {
    try {
      // Fetch raw flat rows from Supabase
      const { data: enRows, error: enError } = await supabase
        .from('content')
        .select('section, key_path, value')
        .eq('locale', 'en');

      const { data: zhRows, error: zhError } = await supabase
        .from('content')
        .select('section, key_path, value')
        .eq('locale', 'zh');

      if (enError || zhError) throw new Error('Failed to fetch from Supabase');

      // Helper: Convert flat Supabase rows into nested object
      // This merges DB data on top of FALLBACK_DATA so you always have a complete structure
      const buildNestedStructure = (dbRows: any[] | null, fallback: Record<SectionKey, any>) => {
        // Start with a deep copy of fallbacks
        const result = JSON.parse(JSON.stringify(fallback));

        if (!dbRows) return result;

        dbRows.forEach((row: any) => {
          const { section, key_path, value } = row;
          
          // Only proceed if section exists in our known structure
          if (result[section] !== undefined) {
            const keys = key_path.split('.');
            let target: any = result[section];
            
            // Navigate to the nested property
            for (let i = 0; i < keys.length - 1; i++) {
              const key = keys[i];
              if (target[key] === undefined) target[key] = {};
              target = target[key];
            }
            
            // Set the value
            const finalKey = keys[keys.length - 1];
            let parsedValue = value;
if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
  try { parsedValue = JSON.parse(value); } catch { parsedValue = value; }
}
target[finalKey] = parsedValue;
          }
        });
        return result;
      };

      const enContent = buildNestedStructure(enRows, FALLBACK_DATA.en);
      const zhContent = buildNestedStructure(zhRows, FALLBACK_DATA.zh);

      setContent({ en: enContent, zh: zhContent });
      setLoadError(false);
    } catch (error) {
      console.error('Fetch failed:', error);
      setLoadError(true);
      // Fallback to local defaults if DB fails
      setContent(FALLBACK_DATA);
    }
  }, []);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  if (!content) {
    return (
      <div className="flex h-[calc(100vh-65px)] items-center justify-center bg-gray-50">
        <div className="flex items-center gap-3 text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading content from Database...</span>
        </div>
      </div>
    );
  }

  // ✅ 2. UPDATE STATE (Real-time UI updates)
  const updateBoth = (section: SectionKey, path: string[], enValue: any, zhValue: any) => {
    setContent(prev => {
      if (!prev) return prev;
      
      const updateLocale = (localeData: any, valueToSet: any) => {
        const newState = JSON.parse(JSON.stringify(localeData));
        let target = newState[section];
        for (let i = 0; i < path.length - 1; i++) target = target[path[i]];
        target[path[path.length - 1]] = valueToSet;
        return newState;
      };
      
      return {
        en: updateLocale(prev.en, enValue),
        zh: updateLocale(prev.zh, zhValue),
      };
    });
  };

  // ✅ 3. SAVE TO SUPABASE (Fixed TypeScript errors)
  const saveBothToSupabase = async (section: SectionKey, updates: { en: Record<string, any>, zh: Record<string, any> }) => {
    // Save English
    for (const [keyPath, value] of Object.entries(updates.en)) {
      const { error } = await supabase
        .from('content')
        .upsert({
          locale: 'en',
          section,
          key_path: keyPath,
          value: typeof value === 'object' ? JSON.stringify(value) : String(value),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'locale,section,key_path'
        });
      if (error) throw error;
    }
    
    // Save Chinese
    for (const [keyPath, value] of Object.entries(updates.zh)) {
      const { error } = await supabase
        .from('content')
        .upsert({
          locale: 'zh',
          section,
          key_path: keyPath,
          value: typeof value === 'object' ? JSON.stringify(value) : String(value),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'locale,section,key_path'
        });
      if (error) throw error;
    }
    
    return { success: true };
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Note: Image upload logic would go here using Aliyun OSS
  // For now, just a placeholder to prevent build errors
  const handleImageUpload = async () => {
    alert('Image upload logic for Aliyun OSS will be added here.');
  };

  const handleSave = async () => {
    setSaving(true);
    setStatus('idle');
    try {
      const section = activeSection;
      const enData = content.en[section];
      const zhData = content.zh[section];
      
      // Flatten both to key_path: value
      const flatten = (obj: any, prefix = '', result: Record<string, any> = {}) => {
        for (const [key, value] of Object.entries(obj)) {
          const path = prefix ? `${prefix}.${key}` : key;
          if (typeof value === 'string') result[path] = value;
          else if (Array.isArray(value)) result[path] = JSON.stringify(value);
          else if (typeof value === 'object' && value !== null) flatten(value, path, result);
        }
        return result;
      };
      
      const enUpdates = flatten(enData);
      const zhUpdates = flatten(zhData);
      
      await saveBothToSupabase(section, { en: enUpdates, zh: zhUpdates });
      
      setStatus('success');
    } catch (error) {
      console.error('Save failed:', error);
      setStatus('error');
    } finally {
      setSaving(false);
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const handleReset = () => {
    setContent(null);
    fetchContent();
    setStatus('idle');
    setSelectedImage(null);
    setImagePreview(null);
  };

  // ✅ Bilingual Field Component
  const BilingualField = ({ 
    label, 
    enValue, 
    zhValue, 
    path, 
    multiline = false,
    onChange 
  }: { 
    label: string; 
    enValue: string; 
    zhValue: string; 
    path: string[];
    multiline?: boolean;
    onChange: (enVal: string, zhVal: string) => void;
  }) => (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
        <Languages className="w-4 h-4 text-violet-500" />
        {label}
      </label>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* English */}
        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">English</span>
          {multiline ? (
            <textarea
              value={enValue || ''}
              onChange={(e) => onChange(e.target.value, zhValue)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none text-sm"
              rows={3}
              placeholder="Enter English text..."
            />
          ) : (
            <input
              type="text"
              value={enValue || ''}
              onChange={(e) => onChange(e.target.value, zhValue)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
              placeholder="Enter English text..."
            />
          )}
        </div>
        
        {/* Chinese */}
        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">中文</span>
          {multiline ? (
            <textarea
              value={zhValue || ''}
              onChange={(e) => onChange(enValue, e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none text-sm"
              rows={3}
              placeholder="输入中文内容..."
            />
          ) : (
            <input
              type="text"
              value={zhValue || ''}
              onChange={(e) => onChange(enValue, e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
              placeholder="输入中文内容..."
            />
          )}
        </div>
      </div>
    </div>
  );

  // Safe accessor helper to prevent crashes if data structure is partial
  const get = (obj: any, path: string) => {
    try {
      return path.split('.').reduce((o, i) => o[i], obj);
    } catch {
      return undefined;
    }
  };

  const renderFields = () => {
    // Use safe access or fallbacks
    const enData = content.en[activeSection];
    const zhData = content.zh[activeSection];

    switch (activeSection) {
      case 'hero':
  return (
    <div className="space-y-6">
      {/* Image Upload Placeholder */}
      <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl border border-gray-200">
        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
          <Upload className="w-6 h-6 text-gray-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">Hero Image URL</p>
          <input 
            type="text" 
            value={enData?.heroImage || ''} 
            onChange={(e) => updateBoth('hero', ['heroImage'], e.target.value, e.target.value)}
            className="mt-1 w-full text-xs px-2 py-1 border rounded"
            placeholder="https://..."
          />
        </div>
      </div>
      
      {/* Basic Text Fields */}
      <BilingualField 
        label="Tagline" 
        enValue={enData?.tagline} 
        zhValue={zhData?.tagline} 
        path={['tagline']}
        onChange={(enVal, zhVal) => updateBoth('hero', ['tagline'], enVal, zhVal)} 
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BilingualField label="Title Start" enValue={enData?.titleStart} zhValue={zhData?.titleStart} path={['titleStart']} onChange={(en, zh) => updateBoth('hero', ['titleStart'], en, zh)} />
        <BilingualField label="Title Highlight" enValue={enData?.titleHighlight} zhValue={zhData?.titleHighlight} path={['titleHighlight']} onChange={(en, zh) => updateBoth('hero', ['titleHighlight'], en, zh)} />
        <BilingualField label="Title Middle" enValue={enData?.titleMiddle} zhValue={zhData?.titleMiddle} path={['titleMiddle']} onChange={(en, zh) => updateBoth('hero', ['titleMiddle'], en, zh)} />
        <BilingualField label="Title End" enValue={enData?.titleEnd} zhValue={zhData?.titleEnd} path={['titleEnd']} onChange={(en, zh) => updateBoth('hero', ['titleEnd'], en, zh)} />
      </div>
      
      <BilingualField label="CTA Button Text" enValue={enData?.cta} zhValue={zhData?.cta} path={['cta']} onChange={(en, zh) => updateBoth('hero', ['cta'], en, zh)} />
      <BilingualField label="Team Card Title" enValue={enData?.teamCard?.title} zhValue={zhData?.teamCard?.title} path={['teamCard', 'title']} onChange={(en, zh) => updateBoth('hero', ['teamCard', 'title'], en, zh)} />
      <BilingualField label="Trust Text" enValue={enData?.trust?.text} zhValue={zhData?.trust?.text} path={['trust', 'text']} onChange={(en, zh) => updateBoth('hero', ['trust', 'text'], en, zh)} />

      {/* ✅ Hero Stats Section */}
      <div className="p-4 bg-gray-50 rounded-xl space-y-4 border border-gray-200">
        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-violet-500" />
          Statistics
        </h4>
        
        {/* Services Title */}
        <BilingualField 
          label="Services Title" 
          enValue={enData?.stats?.servicesTitle} 
          zhValue={zhData?.stats?.servicesTitleZh} 
          path={['stats', 'servicesTitle']}
          onChange={(en, zh) => updateBoth('hero', ['stats', 'servicesTitle'], en, zh)} 
        />
        
        {/* Services Badge */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Services Badge (EN)</label>
            <input
              type="text"
              value={enData?.stats?.servicesBadge || ''}
              onChange={(e) => updateBoth('hero', ['stats', 'servicesBadge'], e.target.value, zhData?.stats?.servicesBadge || '')}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
              placeholder="6+"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Services Badge (ZH)</label>
            <input
              type="text"
              value={zhData?.stats?.servicesBadge || ''}
              onChange={(e) => updateBoth('hero', ['stats', 'servicesBadge'], enData?.stats?.servicesBadge || '', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
              placeholder="6+"
            />
          </div>
        </div>
        
        {/* Revenue Title */}
        <BilingualField 
          label="Revenue Title" 
          enValue={enData?.stats?.revenueTitle} 
          zhValue={zhData?.stats?.revenueTitleZh} 
          path={['stats', 'revenueTitle']}
          onChange={(en, zh) => updateBoth('hero', ['stats', 'revenueTitle'], en, zh)} 
        />
        
        {/* Revenue Value */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Revenue Value</label>
            <input
              type="text"
              value={enData?.stats?.revenueValue || ''}
              onChange={(e) => updateBoth('hero', ['stats', 'revenueValue'], e.target.value, zhData?.stats?.revenueValue || '')}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
              placeholder="25,4780"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Revenue Value (ZH)</label>
            <input
              type="text"
              value={zhData?.stats?.revenueValue || ''}
              onChange={(e) => updateBoth('hero', ['stats', 'revenueValue'], enData?.stats?.revenueValue || '', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
              placeholder="25,4780"
            />
          </div>
        </div>
        
        {/* Revenue Growth */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Revenue Growth</label>
          <input
            type="text"
            value={enData?.stats?.revenueGrowth || ''}
            onChange={(e) => updateBoth('hero', ['stats', 'revenueGrowth'], e.target.value, zhData?.stats?.revenueGrowth || '')}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
            placeholder="↑ +25M $"
          />
        </div>
        
        {/* Clients Helped Title */}
        <BilingualField 
          label="Clients Helped Title" 
          enValue={enData?.stats?.helped} 
          zhValue={zhData?.stats?.helpedZh} 
          path={['stats', 'helped']}
          onChange={(en, zh) => updateBoth('hero', ['stats', 'helped'], en, zh)} 
        />
        
        {/* Clients Helped Value */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Clients Helped Value</label>
            <input
              type="text"
              value={enData?.stats?.helpedValue || ''}
              onChange={(e) => updateBoth('hero', ['stats', 'helpedValue'], e.target.value, zhData?.stats?.helpedValue || '')}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
              placeholder="12K+"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Clients Helped Value (ZH)</label>
            <input
              type="text"
              value={zhData?.stats?.helpedValue || ''}
              onChange={(e) => updateBoth('hero', ['stats', 'helpedValue'], enData?.stats?.helpedValue || '', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
              placeholder="12K+"
            />
          </div>
        </div>
      </div>

      {/* ✅ Services List - Array Editor */}
      <div className="p-4 bg-gray-50 rounded-xl space-y-4 border border-gray-200">
        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
          <Layers className="w-4 h-4 text-violet-500" />
          Services List
        </h4>
        
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Services (English) - Comma Separated</label>
            <textarea
              value={Array.isArray(enData?.servicesList) ? enData.servicesList.join(', ') : enData?.servicesList || ''}
              onChange={(e) => {
                const servicesArray = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                updateBoth('hero', ['servicesList'], servicesArray, Array.isArray(zhData?.servicesList) ? zhData.servicesList : []);
              }}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm resize-none"
              rows={3}
              placeholder="SEO, Graphic Design, PPC, Virtual Assistant..."
            />
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Services (Chinese) - Comma Separated</label>
            <textarea
              value={Array.isArray(zhData?.servicesList) ? zhData.servicesList.join(', ') : zhData?.servicesList || ''}
              onChange={(e) => {
                const servicesArray = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                updateBoth('hero', ['servicesList'], Array.isArray(enData?.servicesList) ? enData.servicesList : [], servicesArray);
              }}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm resize-none"
              rows={3}
              placeholder="SEO优化，平面设计，PPC广告，虚拟助理..."
            />
          </div>
        </div>
      </div>
    </div>
  );
      case 'about':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <BilingualField label="Badge" enValue={enData?.badge} zhValue={zhData?.badge} path={['badge']} onChange={(en, zh) => updateBoth('about', ['badge'], en, zh)} />
              <BilingualField label="Title" enValue={enData?.title} zhValue={zhData?.title} path={['title']} onChange={(en, zh) => updateBoth('about', ['title'], en, zh)} />
            </div>
            
            <BilingualField label="Subtitle" enValue={enData?.subtitle} zhValue={zhData?.subtitle} path={['subtitle']} onChange={(en, zh) => updateBoth('about', ['subtitle'], en, zh)} />
            <BilingualField label="Heading" enValue={enData?.heading} zhValue={zhData?.heading} path={['heading']} onChange={(en, zh) => updateBoth('about', ['heading'], en, zh)} />
            <BilingualField label="Description" enValue={enData?.description} zhValue={zhData?.description} path={['description']} multiline onChange={(en, zh) => updateBoth('about', ['description'], en, zh)} />
            
            <div className="p-4 bg-gray-50 rounded-xl space-y-4">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <Languages className="w-4 h-4 text-violet-500" />
                Features
              </h4>
              {Object.keys(enData?.features || {}).map((key) => (
                <div key={key} className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-3 bg-white rounded-xl border border-gray-100">
                  <BilingualField 
                    label={`${key.charAt(0).toUpperCase() + key.slice(1)} Title`} 
                    enValue={enData.features[key]?.title} 
                    zhValue={zhData.features?.[key]?.title} 
                    path={['features', key, 'title']} 
                    onChange={(en, zh) => updateBoth('about', ['features', key, 'title'], en, zh)} 
                  />
                  <BilingualField 
                    label={`${key.charAt(0).toUpperCase() + key.slice(1)} Description`} 
                    enValue={enData.features[key]?.desc} 
                    zhValue={zhData.features?.[key]?.desc} 
                    path={['features', key, 'desc']} 
                    onChange={(en, zh) => updateBoth('about', ['features', key, 'desc'], en, zh)} 
                  />
                </div>
              ))}
            </div>
          </div>
        );

      case 'services':
        return (
          <div className="space-y-6">
            <BilingualField label="Section Title" enValue={enData?.title} zhValue={zhData?.title} path={['title']} onChange={(en, zh) => updateBoth('services', ['title'], en, zh)} />
            <BilingualField label="Subtitle" enValue={enData?.subtitle} zhValue={zhData?.subtitle} path={['subtitle']} onChange={(en, zh) => updateBoth('services', ['subtitle'], en, zh)} />
            
            <div className="p-4 bg-gray-50 rounded-xl space-y-4">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <Languages className="w-4 h-4 text-violet-500" />
                Service Items
              </h4>
              {Object.keys(enData?.items || {}).map((key) => (
                <div key={key} className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-3 bg-white rounded-xl border border-gray-100">
                  <BilingualField 
                    label={`${key.charAt(0).toUpperCase() + key.slice(1)} Title`} 
                    enValue={enData.items[key]?.title} 
                    zhValue={zhData.items?.[key]?.title} 
                    path={['items', key, 'title']} 
                    onChange={(en, zh) => updateBoth('services', ['items', key, 'title'], en, zh)} 
                  />
                  <BilingualField 
                    label={`${key.charAt(0).toUpperCase() + key.slice(1)} Description`} 
                    enValue={enData.items[key]?.desc} 
                    zhValue={zhData.items?.[key]?.desc} 
                    path={['items', key, 'desc']} 
                    onChange={(en, zh) => updateBoth('services', ['items', key, 'desc'], en, zh)} 
                  />
                </div>
              ))}
            </div>
          </div>
        );

      case 'team':
        return (
          <div className="space-y-6">
            <BilingualField label="Section Title" enValue={enData?.title} zhValue={zhData?.title} path={['title']} onChange={(en, zh) => updateBoth('team', ['title'], en, zh)} />
            <BilingualField label="Subtitle" enValue={enData?.subtitle} zhValue={zhData?.subtitle} path={['subtitle']} onChange={(en, zh) => updateBoth('team', ['subtitle'], en, zh)} />
            
            <div className="p-4 bg-gray-50 rounded-xl space-y-3">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <Languages className="w-4 h-4 text-violet-500" />
                Team Members
              </h4>
              {Object.keys(enData?.members || {}).map((role) => (
                <div key={role} className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start p-3 bg-white rounded-xl border border-gray-100">
                  <label className="text-sm font-medium text-gray-600 pt-2.5">{role}</label>
                  <input
                    type="text"
                    value={enData.members[role]}
                    onChange={(e) => updateBoth('team', ['members', role], e.target.value, zhData.members?.[role])}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
                    placeholder="English name..."
                  />
                  <input
                    type="text"
                    value={zhData.members?.[role]}
                    onChange={(e) => updateBoth('team', ['members', role], enData.members[role], e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
                    placeholder="中文名称..."
                  />
                </div>
              ))}
            </div>
          </div>
        );
        case 'collaborations':
  return (
    <div className="space-y-6">
      <BilingualField 
        label="Section Title" 
        enValue={enData?.title} 
        zhValue={zhData?.title} 
        path={['title']}
        onChange={(en, zh) => updateBoth('collaborations', ['title'], en, zh)} 
      />
      <BilingualField 
        label="Section Subtitle" 
        enValue={enData?.subtitle} 
        zhValue={zhData?.subtitle} 
        path={['subtitle']}
        onChange={(en, zh) => updateBoth('collaborations', ['subtitle'], en, zh)} 
      />
      
      <div className="p-4 bg-gray-50 rounded-xl space-y-4">
        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
          <Users className="w-4 h-4 text-violet-500" />
          Collaboration Details (4 items)
        </h4>
        {['1', '2', '3', '4'].map((key) => (
          <div key={key} className="p-3 bg-white rounded-xl border border-gray-100 space-y-3">
            <div className="font-medium text-sm text-gray-700">Collaboration {key}</div>
            <BilingualField 
              label="Title" 
              enValue={enData.items?.[key]?.title} 
              zhValue={zhData.items?.[key]?.title} 
              path={['items', key, 'title']} 
              onChange={(en, zh) => updateBoth('collaborations', ['items', key, 'title'], en, zh)} 
            />
            <BilingualField 
              label="Description" 
              enValue={enData.items?.[key]?.description} 
              zhValue={zhData.items?.[key]?.description} 
              path={['items', key, 'description']} 
              multiline
              onChange={(en, zh) => updateBoth('collaborations', ['items', key, 'description'], en, zh)} 
            />
            <BilingualField 
              label="Location" 
              enValue={enData.items?.[key]?.location} 
              zhValue={zhData.items?.[key]?.location} 
              path={['items', key, 'location']} 
              onChange={(en, zh) => updateBoth('collaborations', ['items', key, 'location'], en, zh)} 
            />
          </div>
        ))}
      </div>
    </div>
  );

      case 'footer':
        return (
          <div className="space-y-6">
            <BilingualField label="Title" enValue={enData?.title} zhValue={zhData?.title} path={['title']} onChange={(en, zh) => updateBoth('footer', ['title'], en, zh)} />
            <BilingualField label="Subtitle" enValue={enData?.subtitle} zhValue={zhData?.subtitle} path={['subtitle']} onChange={(en, zh) => updateBoth('footer', ['subtitle'], en, zh)} />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <BilingualField label="Phone" enValue={enData?.phone} zhValue={zhData?.phone} path={['phone']} onChange={(en, zh) => updateBoth('footer', ['phone'], en, zh)} />
              <BilingualField label="WhatsApp Link" enValue={enData?.whatsapp} zhValue={zhData?.whatsapp} path={['whatsapp']} onChange={(en, zh) => updateBoth('footer', ['whatsapp'], en, zh)} />
              <BilingualField label="Email" enValue={enData?.email} zhValue={zhData?.email} path={['email']} onChange={(en, zh) => updateBoth('footer', ['email'], en, zh)} />
              <BilingualField label="YouTube Link" enValue={enData?.youtube} zhValue={zhData?.youtube} path={['youtube']} onChange={(en, zh) => updateBoth('footer', ['youtube'], en, zh)} />
            </div>
          </div>
        );

      default: return null;
    }
  };

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="flex flex-col h-full">
      {isMobile && (
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <span className="font-semibold text-gray-900">Sections</span>
          <button onClick={() => setSidebarOpen(false)} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {!isMobile && <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-3">Sections</h3>}
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          return (
            <button
              key={section.id}
              onClick={() => { setActiveSection(section.id); if (isMobile) setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                isActive ? 'bg-violet-50 text-violet-700 shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-violet-600' : 'text-gray-400'}`} />
              <div className="flex-1 min-w-0">
                <p className="truncate">{section.label}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-65px)]">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent isMobile />
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden bg-gray-50 min-w-0">
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 capitalize truncate flex items-center gap-2">
                <Languages className="w-5 h-5 text-violet-500" />
                {activeSection === 'hero' ? 'Hero Section' : activeSection === 'about' ? 'About Section' : activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Edit English & Chinese together. Save both at once.</p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {loadError && (
            <div className="mb-4 flex items-center gap-2 px-3 py-2 bg-amber-50 text-amber-700 rounded-lg text-sm">
              <AlertCircle className="w-4 h-4" /> Could not connect to Database — showing defaults.
            </div>
          )}
          <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
            {status === 'success' && (
              <div className="mb-4 flex items-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium">
                <CheckCircle className="w-4 h-4" /> Saved both languages to Supabase
              </div>
            )}
            {status === 'error' && (
              <div className="mb-4 flex items-center gap-2 px-3 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-medium">
                <AlertCircle className="w-4 h-4" /> Error saving — check console
              </div>
            )}
            {renderFields()}
          </div>
        </main>

        <footer className="shrink-0 bg-white border-t border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between">
          <button onClick={handleReset} className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition text-sm">
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Reload from Database</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 text-white font-medium rounded-lg shadow-md shadow-violet-500/20 hover:bg-violet-700 disabled:opacity-70 disabled:cursor-not-allowed transition text-sm"
          >
            {saving ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Saving EN & ZH...</>
            ) : (
              <><Save className="w-4 h-4" /> <span className="hidden sm:inline">Save Both Languages</span><span className="sm:hidden">Save</span></>
            )}
          </button>
        </footer>
      </div>
    </div>
  );
}