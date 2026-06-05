// components/Footer.tsx
'use client';
import { Phone, MessageCircle, Mail } from 'lucide-react';
import Image from 'next/image';

// ── TYPES ──────────────────────────────────────────────────────────────
export interface FooterData {
  title: string;
  subtitle: string;
  phone: string;
  whatsapp: string;
  email: string;
  youtube: string;
}

// ── ICONS ───────────────────────────────────────────────────────────────
const YoutubeIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

// ── FALLBACK DATA ──────────────────────────────────────────────────────
const FALLBACK_FOOTER: FooterData = {
  title: 'Contact Us',
  subtitle: "We'd love to hear from you",
  phone: '+86 197 1664 1084',
  whatsapp: 'https://wa.me/+880 1319-238346',
  email: 'go-sarwar@outlook.com',
  youtube: 'https://youtube.com/channel/UC123456'
};

// ── HELPER: Parse Supabase values ──────────────────────────────────────
const parseSupabaseValue = <T,>(value: T | string | null | undefined): T => {
  if (value === undefined || value === null) return value as T;
  if (typeof value === 'string' && value.startsWith('{')) {
    try { return JSON.parse(value) as T; } catch { return value as T; }
  }
  return value as T;
};

// ── COMPONENT ────────────────────────────────────────────────────────
export default function Footer({ data, locale = 'zh' }: { data?: FooterData | string; locale?: 'en' | 'zh' }) {
  const parsedData = parseSupabaseValue<FooterData>(data);
  
  const footer: FooterData = {
    title: parsedData?.title || FALLBACK_FOOTER.title,
    subtitle: parsedData?.subtitle || FALLBACK_FOOTER.subtitle,
    phone: parsedData?.phone || FALLBACK_FOOTER.phone,
    whatsapp: parsedData?.whatsapp || FALLBACK_FOOTER.whatsapp,
    email: parsedData?.email || FALLBACK_FOOTER.email,
    youtube: parsedData?.youtube || FALLBACK_FOOTER.youtube,
  };
  
  const contacts = [
    { icon: Phone,         label: 'Phone',   labelZh: '电话', value: footer.phone,   valueZh: footer.phone,  href: `tel:${footer.phone}` },
  { icon: MessageCircle, label: 'WhatsApp',labelZh: '微信', value: 'Chat Now',     valueZh: '立即聊天',     href: footer.whatsapp },
  { icon: Mail,          label: 'Email',   labelZh: '邮箱', value: footer.email,   valueZh: footer.email,  href: `mailto:${footer.email}` },
  { icon: YoutubeIcon,   label: 'YouTube', labelZh: '油管', value: 'Watch Us',     valueZh: '观看视频',     href: footer.youtube }
];

  return (
    <footer id="contact" className="relative py-12 sm:py-16 bg-linear-to-br from-gray-900 via-violet-950 to-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        
        {/* Mobile Layout - Optimized */}
        <div className="lg:hidden space-y-6">
          {/* Title + Subtitle */}
          <div className="text-center px-2">
            <h3 className="text-xl sm:text-2xl font-bold">{footer.title}</h3>
            <p className="text-gray-400 mt-1 text-xs sm:text-sm">{footer.subtitle}</p>
          </div>
          
          {/* QR Codes - Mobile Sized */}
          <div className="flex justify-center gap-4 px-4">
            {/* WeChat QR */}
            <div className="bg-white/10 p-3 rounded-xl flex flex-col items-center">
              <div className="relative" style={{ width: '100px', height: '100px' }}>
                <Image 
                  src="https://gosarwar.com/icons/wechatQR.jpg" 
                  alt="WeChat QR" 
                  fill
                  className="rounded-lg object-contain"
                  unoptimized
                />
              </div>
              <p className="text-xs text-gray-300 mt-2 font-medium">WeChat</p>
            </div>
            
            {/* QQ QR */}
            <div className="bg-white/10 p-3 rounded-xl flex flex-col items-center">
              <div className="relative" style={{ width: '100px', height: '100px' }}>
                <Image 
                  src="https://gosarwar.com/icons/QQqr.png" 
                  alt="QQ QR" 
                  fill
                  className="rounded-lg object-contain"
                  unoptimized
                />
              </div>
              <p className="text-xs text-gray-300 mt-2 font-medium">QQ</p>
            </div>
          </div>
          
          {/* Contact Links - Mobile Optimized */}
          <div className="space-y-2 px-2">
            {contacts.map((item, i) => (
              <a 
                key={i} 
                href={item.href} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition active:scale-[0.98]"
              >
                <div className="p-2.5 bg-violet-500/20 rounded-lg text-violet-300">
                  <item.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400">{locale === 'zh' ? item.labelZh : item.label}</p>
<p className="text-sm font-semibold text-white truncate">{locale === 'zh' ? item.valueZh : item.value}</p>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Desktop Layout - Unchanged */}
        <div className="hidden lg:grid lg:grid-cols-2 gap-12 items-start">
          <div className="space-y-8 text-left">
            <div>
              <h3 className="text-2xl font-bold">{footer.title}</h3>
              <p className="text-gray-400 mt-2">{footer.subtitle}</p>
            </div>
            <div className="flex gap-6">
              <div className="bg-white p-4 rounded-2xl shadow-lg flex-shrink-0">
                <div className="relative" style={{ width: '140px', height: '140px' }}>
                  <Image 
                    src="/icons/wechatQR.jpg" 
                    alt="WeChat QR" 
                    fill
                    className="rounded-lg object-contain"
                    unoptimized
                  />
                </div>
                <p className="text-xs text-gray-600 text-center mt-2 font-medium">WeChat</p>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-lg flex-shrink-0">
                <div className="relative" style={{ width: '140px', height: '140px' }}>
                  <Image 
                    src="/icons/QQqr.png" 
                    alt="QQ QR" 
                    fill
                    className="rounded-lg object-contain"
                    unoptimized
                  />
                </div>
                <p className="text-xs text-gray-600 text-center mt-2 font-medium">QQ</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 space-y-4">
            {contacts.map((item, i) => (
              <a 
                key={i} 
                href={item.href} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition group"
              >
                <div className="p-3 bg-violet-500/20 rounded-xl text-violet-300 group-hover:bg-violet-500 group-hover:text-white transition">
                  <item.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">{locale === 'zh' ? item.labelZh : item.label}</p>
<p className="text-sm font-semibold text-white truncate">{locale === 'zh' ? item.valueZh : item.value}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
        
        {/* Copyright - Mobile Friendly */}
        <div className="text-center py-6 border-t border-white/10 mt-8">
          <p className="text-xs text-gray-500">
            © 2026 GoSarwar. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}