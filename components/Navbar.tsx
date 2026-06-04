// components/Navbar.tsx
'use client';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import LanguageSwitcher from './ui/LanguageSwitcher';

// ── TYPES ────────────────────────────────────────────────────────────────
export interface NavData {
  home: string;
  services: string;
  works: string;
  about: string;
  team: string;
  contact: string;
}

// ── FALLBACK DATA ──────────────────────────────────────────────────────
const FALLBACK_NAV: Record<'en' | 'zh', NavData> = {
  en: {
    home: 'Home',
    services: 'Services',
    works: 'Works',
    about: 'About',
    team: 'Team',
    contact: 'Contact'
  },
  zh: {
    home: '首页',
    services: '服务',
    works: '作品',
    about: '关于我们',
    team: '团队',
    contact: '联系'
  }
};

// ── HELPER: Parse Supabase values ──────────────────────────────────────
const parseSupabaseValue = <T,>(value: T | string | null | undefined): T => {
  if (value === undefined || value === null) return value as T;
  if (typeof value === 'string' && value.startsWith('{')) {
    try { return JSON.parse(value) as T; } catch { return value as T; }
  }
  return value as T;
};

// ── COMPONENT ──────────────────────────────────────────────────────────
export default function Navbar({ data, locale = 'zh' }: { 
  data?: NavData | string; // ✅ Can be object or JSON string from Supabase
  locale?: 'en' | 'zh' 
}) {
  // ✅ Parse data if it's a JSON string from Supabase
  const parsedData = parseSupabaseValue<NavData>(data);
  
  // ✅ Merge with fallback to ensure we always have nav labels
  const nav = { ...FALLBACK_NAV[locale], ...parsedData };
  
  const [open, setOpen] = useState(false);
  const links: (keyof NavData)[] = ['home', 'services', 'works', 'about', 'team', 'contact'];

  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <a href="#home" className="text-2xl font-extrabold tracking-tight hover:scale-105 transition-transform duration-300">
            <span className="bg-linear-to-r from-violet-600 via-purple-500 to-fuchsia-500 
                           bg-[length:300%_100%] bg-clip-text text-transparent 
                           animate-gradient-shift">
              GoSarwar
            </span>
          </a>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            {links.map((key) => (
              <a 
                key={key} 
                href={`#${key}`} 
                className="relative px-3 py-1.5 text-sm font-medium text-gray-600 
                         rounded-full hover:bg-violet-50/80 hover:text-violet-600 
                         transition-all duration-300 hover:scale-105 hover:shadow-sm
                         active:scale-95"
              >
                {nav[key]}
              </a>
            ))}
            <LanguageSwitcher />
          </div>

          {/* Mobile Toggle */}
          <button 
            className="md:hidden p-2.5 text-gray-600 hover:text-violet-600 
                       hover:bg-violet-50 rounded-xl transition-all duration-300 
                       active:scale-95" 
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-gray-100 
                       p-5 space-y-2 shadow-2xl animate-in slide-in-from-top-3 duration-300">
          {links.map((key) => (
            <a 
              key={key} 
              href={`#${key}`} 
              className="block px-4 py-3 text-gray-700 hover:text-violet-600 
                        hover:bg-violet-50/70 rounded-xl font-medium transition-all 
                        duration-300 active:scale-98"
              onClick={() => setOpen(false)}
            >
              {nav[key]}
            </a>
          ))}
          <div className="pt-4 border-t border-gray-100 flex justify-center">
            <LanguageSwitcher />
          </div>
        </div>
      )}
    </nav>
  );
}