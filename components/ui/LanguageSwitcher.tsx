// components/ui/LanguageSwitcher.tsx
'use client';
import { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  // ✅ CHANGE: Default to 'zh' instead of 'en'
  const [locale, setLocale] = useState<'en' | 'zh'>('zh');

  // ✅ Read lang from URL query param on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const lang = params.get('lang') as 'en' | 'zh';
    if (lang === 'en' || lang === 'zh') {
      setLocale(lang);
    }
    // ✅ If no lang param, keep default 'zh' (no else needed)
  }, []);

  const toggle = () => {
    const next = locale === 'en' ? 'zh' : 'en';
    setLocale(next);
    
    // ✅ Reload page with new lang param
    const params = new URLSearchParams(window.location.search);
    params.set('lang', next);
    window.location.href = `?${params.toString()}`;
  };

  return (
    <div className="relative group">
      <button 
        onClick={toggle}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 hover:bg-gray-50 transition"
        aria-label={`Switch to ${locale === 'en' ? 'Chinese' : 'English'}`}
      >
        <Globe className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium">
          {locale === 'en' ? '🇬🇧 EN' : '🇨🇳 中文'}
        </span>
      </button>
      
      {/* Dropdown (optional, for accessibility) */}
      <div className="absolute right-0 mt-2 w-28 bg-white rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <button 
          onClick={() => { setLocale('en'); toggle(); }} 
          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 first:rounded-t-xl ${locale === 'en' ? 'text-violet-600 font-semibold' : ''}`}
        >
          🇬🇧 English
        </button>
        <button 
          onClick={() => { setLocale('zh'); toggle(); }} 
          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 last:rounded-b-xl ${locale === 'zh' ? 'text-violet-600 font-semibold' : ''}`}
        >
          🇨🇳 中文
        </button>
      </div>
    </div>
  );
}