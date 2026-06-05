// components/Hero.tsx
'use client';
import { useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { TrendingUp, Users, AlertTriangle } from 'lucide-react';
import Image from 'next/image';

// ── TYPES ────────────────────────────────────────────────────────────────
export interface HeroStats {
  servicesTitle: string;
  servicesTitleZh: string;  // ✅ Add Chinese
  servicesBadge: string;
  revenueTitle: string;
  revenueTitleZh: string;   // ✅ Add Chinese
  revenueValue: string;
  revenueGrowth: string;
  helped: string;
  helpedZh: string;         // ✅ Add Chinese
  helpedValue: string;
}

export interface HeroData {
  tagline: string;
  taglineZh: string;        // ✅ Add Chinese
  titleStart: string;
  titleStartZh: string;     // ✅ Add Chinese
  titleHighlight: string;
  titleHighlightZh: string; // ✅ Add Chinese
  titleMiddle: string;
  titleMiddleZh: string;    // ✅ Add Chinese
  titleEnd: string;
  titleEndZh: string;       // ✅ Add Chinese
  cta: string;
  ctaZh: string;            // ✅ Add Chinese
  teamCard: { 
    title: string; 
    titleZh: string;        // ✅ Add Chinese
  };
  servicesList: string[] | string;
  servicesListZh?: string[] | string;  // ✅ Add Chinese
  trust: { 
    text: string; 
    textZh: string;         // ✅ Add Chinese
  };
  heroImage: string;
  stats: HeroStats;
}

// ── FALLBACK DATA ──────────────────────────────────────────────────────
const FALLBACK_HERO: HeroData = {
  tagline: 'Increase your sales',
  taglineZh: '提升您的销售额',
  titleStart: 'Grow your',
  titleStartZh: '发展您的',
  titleHighlight: 'digital business',
  titleHighlightZh: '数字业务',
  titleMiddle: 'with us & make',
  titleMiddleZh: '与我们一起',
  titleEnd: 'Success',
  titleEndZh: '成功',
  cta: 'Get Start a Project',
  ctaZh: '开始项目',
  teamCard: { 
    title: 'The most experienced team we have for you.',
    titleZh: '我们为您提供经验最丰富的团队。'  // ✅ Added
  },
  servicesList: ['SEO', 'Graphic Design', 'PPC', 'Virtual Assistant', 'Social Media Marketing', 'Content Marketing', 'Web Design'],
  servicesListZh: ['SEO优化', '平面设计', 'PPC广告', '虚拟助理', '社交媒体营销', '内容营销', '网页设计'],  // ✅ Added
  trust: { 
    text: 'Trusted by 50,000+ teams to communicate easily',
    textZh: '全球50,000+团队信赖的沟通平台'  // ✅ Added
  },
  heroImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  stats: {
    servicesTitle: 'Services Offered',
    servicesTitleZh: '提供的服务',  // ✅ Added
    servicesBadge: '6+',
    revenueTitle: 'Annual Revenue',
    revenueTitleZh: '年收入',  // ✅ Added
    revenueValue: '25,4780',
    revenueGrowth: '↑ +25M $',
    helped: 'Clients helped',
    helpedZh: '服务客户',  // ✅ Added
    helpedValue: '12K+'
  }
};

// ── HELPER: Parse Supabase values (JSON strings → arrays/objects) ─────
// ✅ FIX: Accepts `undefined` to satisfy TypeScript
const parseSupabaseValue = <T,>(value: T | string | null | undefined): T => {
  if (value === undefined || value === null) return value as T;
  if (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{'))) {
    try { return JSON.parse(value) as T; } catch { return value as T; }
  }
  return value as T;
};

// ── BUBBLES COMPONENT ──────────────────────────────────────────────────
const Bubbles = () => {
  const bubbles = [
    { size: 'w-64 h-64 sm:w-80 sm:h-80', pos: 'top-[5%] right-[5%]',    color: 'bg-violet-400',  opacity: 'opacity-40', delay: 0,   duration: 12 },
    { size: 'w-48 h-48 sm:w-64 sm:h-64', pos: 'top-[25%] left-[10%]',   color: 'bg-purple-400',  opacity: 'opacity-30', delay: 1.2, duration: 14 },
    { size: 'w-56 h-56 sm:w-72 sm:h-72', pos: 'bottom-[10%] right-[15%]',color: 'bg-fuchsia-400', opacity: 'opacity-35', delay: 2.4, duration: 13 },
    { size: 'w-40 h-40 sm:w-56 sm:h-56', pos: 'top-[45%] right-[25%]',  color: 'bg-violet-300',  opacity: 'opacity-50', delay: 0.6, duration: 11 },
    { size: 'w-36 h-36 sm:w-48 sm:h-48', pos: 'bottom-[30%] left-[20%]',color: 'bg-purple-300',  opacity: 'opacity-45', delay: 1.8, duration: 15 },
    { size: 'w-32 h-32 sm:w-40 sm:h-40', pos: 'top-[15%] right-[40%]',  color: 'bg-fuchsia-300', opacity: 'opacity-55', delay: 3,   duration: 10 },
    { size: 'w-28 h-28 sm:w-36 sm:h-36', pos: 'bottom-[5%] left-[35%]', color: 'bg-violet-400',  opacity: 'opacity-40', delay: 3.6, duration: 12 },
    { size: 'w-24 h-24 sm:w-32 sm:h-32', pos: 'top-[60%] left-[5%]',    color: 'bg-purple-400',  opacity: 'opacity-50', delay: 0.3, duration: 9  },
  ];
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {bubbles.map((b, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full blur-2xl ${b.size} ${b.pos} ${b.color} ${b.opacity}`}
          animate={{ 
            y: [0, -55, 0, 40, 0], 
            x: [0, 35, 0, -28, 0], 
            scale: [1, 1.18, 1, 0.86, 1],
            opacity: [b.opacity.replace('opacity-', ''), '0.6', b.opacity.replace('opacity-', '')]
          }}
          transition={{ duration: b.duration, repeat: Infinity, ease: 'easeInOut', delay: b.delay }}
        />
      ))}
      <motion.div
        // ✅ Updated to canonical Tailwind v4 syntax
        className="absolute inset-0 bg-linear-to-br from-violet-100/20 via-transparent to-fuchsia-100/20"
        animate={{ opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
};

// ── MAIN COMPONENT ─────────────────────────────────────────────────────
export default function Hero({ 
  data, 
  locale = 'zh'  // ✅ ADD
}: { 
  data?: HeroData;
  locale?: 'en' | 'zh';  // ✅ ADD
}) {
  // ✅ Merge with fallback + handle OSS image errors
  const [imageError, setImageError] = useState(false);
  
  // ✅ Parse servicesList if it's a JSON string from Supabase
  const servicesList = parseSupabaseValue<string[]>(data?.servicesList) || FALLBACK_HERO.servicesList;
  
  const hero = { 
    ...FALLBACK_HERO, 
    ...data,
    servicesList,
    // ✅ Fallback to Unsplash if OSS image fails to load
    heroImage: imageError ? FALLBACK_HERO.heroImage : (data?.heroImage || FALLBACK_HERO.heroImage)
  };
  
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Parallax effect based on scroll
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 300], [0, 80]);
  const imageRotate = useTransform(scrollY, [0, 300], [0, 3]);
    // ✅ ADD: Helper for bilingual text
  const getText = (en: string, zh: string) => locale === 'zh' && zh ? zh : en;
  
  // ✅ ADD: Helper for services list
  const getServicesList = () => {
  if (locale === 'zh' && data?.servicesListZh) {
    const parsed = parseSupabaseValue<string[]>(data.servicesListZh);
    return Array.isArray(parsed) ? parsed : FALLBACK_HERO.servicesList as string[];  // ✅ Always returns string[]
  }
  return servicesList; 
};

  return (
    // ✅ Updated to canonical Tailwind v4 syntax
    <section
      id="home"
      ref={containerRef}
      className="relative w-full min-h-screen overflow-hidden bg-linear-to-br from-violet-50 via-purple-50/60 to-fuchsia-50 flex flex-col"
    >
      <Bubbles />

      <motion.div 
        style={{ y: heroY }}
        className="relative z-10 max-w-7xl mx-auto w-full pt-20 sm:pt-24 lg:pt-28 pb-0 px-4 sm:px-6 lg:px-12 flex flex-col flex-1"
      >

        {/* ── ROW 1 · Badge + Title ── */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-5 sm:mb-8"
        >
          <motion.div 
            className="inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 bg-violet-100 text-violet-700 rounded-full text-[10px] sm:text-xs font-semibold mb-3 sm:mb-4"
            whileHover={{ scale: 1.05, boxShadow: '0 8px 25px rgba(139, 92, 246, 0.3)' }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            {hero.tagline}
          </motion.div>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight max-w-3xl mx-auto mb-0">
            {hero.titleStart}
            <motion.span 
              className="bg-lime-300 px-1 sm:px-1.5 lg:px-2 rounded-md mx-0.5 sm:mx-1 inline-block"
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {hero.titleHighlight}
            </motion.span>
            {hero.titleMiddle}
            <span className="inline-flex items-center mx-1 sm:mx-2 align-middle gap-0.5">
              <motion.span 
                className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full bg-gray-900 inline-block" 
                style={{ clipPath: 'inset(0 50% 0 0)' }}
                animate={{ rotate: [0, 180, 360] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              />
              <motion.span 
                className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full bg-violet-500 inline-block" 
                style={{ clipPath: 'inset(0 0 0 50%)' }}
                animate={{ rotate: [360, 180, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              />
            </span>
            {hero.titleEnd}
          </h1>
        </motion.div>

        {/* ── ROW 2 · Image + Team card overlapping at bottom ── */}
        <div className="relative mb-0">

          {/* ── MOBILE version (hidden on lg+) ── */}
          <div className="lg:hidden flex flex-col items-center w-full">

            <div className="relative w-full flex justify-center" style={{ paddingBottom: '40px' }}>

              {/* Hero Image - Uses OSS URL with fallback + error handling */}
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.8, type: 'spring', stiffness: 100 }}
                className="relative w-full flex justify-center"
              >
                <Image
                  src={hero.heroImage}
                  alt="Professional"
                  width={480}
                  height={580}
                  className="object-contain drop-shadow-2xl select-none rounded-3xl"
                  style={{ 
                    maxHeight: '45vh', 
                    width: 'auto', 
                    maxWidth: '100%',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 60px rgba(139, 92, 246, 0.2)'
                  }}
                  priority
                  onError={() => setImageError(true)} // ✅ Fallback if OSS image fails
                />
                {/* ✅ Show warning if image fails */}
                {imageError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-3xl">
                    <div className="text-center p-4">
                      <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                      <p className="text-xs text-gray-500">Image unavailable</p>
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 rounded-3xl bg-linear-to-tr from-violet-500/10 via-transparent to-fuchsia-500/10 pointer-events-none" />
              </motion.div>

              {/* Team Card */}
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.6, type: 'spring' }}
                className="absolute bottom-0 left-4 right-4"
                whileHover={{ y: -4, scale: 1.01 }}
              >
                <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/90 p-4 w-full">
                  <p className="text-xs font-bold text-gray-900 leading-snug mb-3 text-center">
                    {hero.teamCard?.title || FALLBACK_HERO.teamCard.title}
                  </p>
                  <div className="flex justify-center -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <motion.div 
                        key={i} 
                        className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-gray-200 shadow-sm"
                        whileHover={{ scale: 1.15, zIndex: 10 }}
                        transition={{ type: 'spring', stiffness: 400 }}
                      >
                        <Image src={`https://i.pravatar.cc/150?u=${i + 20}`} alt="team" width={32} height={32} className="w-full h-full object-cover" />
                      </motion.div>
                    ))}
                    <motion.div 
                      className="w-8 h-8 rounded-full border-2 border-white bg-violet-600 flex items-center justify-center text-white text-[10px] font-bold shadow-sm z-10"
                      whileHover={{ scale: 1.15, rotate: 90 }}
                    >
                      +
                    </motion.div>
                  </div>
                  <svg className="absolute -right-2 -bottom-2 w-6 h-6 text-violet-400/50" viewBox="0 0 80 80" fill="none">
                    <path d="M10 65 C 10 20, 65 15, 60 55" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="5 4" />
                  </svg>
                </div>
              </motion.div>

            </div>
          </div>

          {/* ── DESKTOP version (hidden below lg) ── */}
          <div className="hidden lg:grid grid-cols-2 items-end gap-0">
            {/* Left: team card */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25, duration: 0.6 }}
              className="flex items-end pb-32 pl-2 z-20"
            >
              <div className="bg-white/92 backdrop-blur-md rounded-2xl shadow-2xl border border-white/80 p-6 w-75 relative">
                <p className="text-base font-bold text-gray-900 leading-snug mb-5">
                  {hero.teamCard?.title || FALLBACK_HERO.teamCard.title}
                </p>
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <motion.div 
                      key={i} 
                      className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-gray-200 shadow-sm"
                      whileHover={{ scale: 1.1, zIndex: 10 }}
                    >
                      <Image src={`https://i.pravatar.cc/150?u=${i + 20}`} alt="team" width={40} height={40} className="w-full h-full object-cover" />
                    </motion.div>
                  ))}
                  <motion.div 
                    className="w-10 h-10 rounded-full border-2 border-white bg-violet-600 flex items-center justify-center text-white text-xs font-bold shadow-sm z-10"
                    whileHover={{ scale: 1.1, rotate: 180 }}
                  >
                    +
                  </motion.div>
                </div>
                <svg className="absolute -right-6 -bottom-3 w-14 h-14 text-violet-400/60 rotate-12" viewBox="0 0 80 80" fill="none">
                  <path d="M10 65 C 10 20, 65 15, 60 55" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="6 5" />
                  <path d="M55 60 L60 55 L65 62" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </motion.div>

            {/* Right: hero image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35, duration: 0.7 }}
              className="flex justify-center items-end z-10"
              style={{ marginBottom: '-2px' }}
            >
              <Image
                src={hero.heroImage}
                alt="Professional"
                width={480}
                height={580}
                className="object-contain drop-shadow-2xl select-none"
                style={{ maxHeight: '52vh', width: 'auto' }}
                priority
                onError={() => setImageError(true)} // ✅ Fallback if OSS image fails
              />
              {/* ✅ Show warning if image fails */}
              {imageError && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-3xl">
                  <div className="text-center p-4">
                    <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">Image unavailable</p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* ── ROW 3 · Stat cards ── */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="relative z-30 px-0 mt-3 lg:mt-0"
        >
          {/* Mobile stat cards */}
          <div className="lg:hidden flex flex-col gap-3">
            {/* Purple services card */}
            <motion.div 
              className="bg-violet-600 p-4 rounded-2xl shadow-xl w-full"
              whileHover={{ y: -3, boxShadow: '0 20px 40px rgba(139, 92, 246, 0.3)' }}
            >
              <div className="flex justify-between items-center mb-2.5">
                <h4 className="font-bold text-white text-sm">
  {getText(hero.stats?.servicesTitle, hero.stats?.servicesTitleZh) || FALLBACK_HERO.stats.servicesTitle}
</h4>
                <span className="text-[9px] bg-white/20 text-white px-2 py-0.5 rounded-full font-medium border border-white/30">
                  {hero.stats?.servicesBadge || FALLBACK_HERO.stats.servicesBadge}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {getServicesList().slice(0, 6).map((s: string, i: number) => (
                  <motion.div 
                    key={i} 
                    className="text-[11px] text-violet-100 bg-white/15 rounded-full px-2.5 py-1 flex items-center gap-1.5 min-w-0"
                    whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.25)' }}
                  >
                    <span className="w-1 h-1 rounded-full bg-violet-200 shrink-0" />
                    <span className="truncate">{s}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Revenue card */}
            <motion.div 
              className="bg-gray-900 text-white p-4 rounded-2xl shadow-xl w-full"
              whileHover={{ y: -3, boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}
            >
              <p className="text-gray-400 text-[10px] font-medium mb-0.5">
  {getText(hero.stats?.revenueTitle, hero.stats?.revenueTitleZh) || FALLBACK_HERO.stats.revenueTitle}
</p>
              <p className="text-2xl font-extrabold mb-2 tracking-tight">{hero.stats?.revenueValue || FALLBACK_HERO.stats.revenueValue}</p>
              <div className="flex items-end gap-1 h-9 w-full">
                {[35, 60, 40, 85, 55, 75, 50].map((h: number, i: number) => (
                  <motion.div
                    key={i}
                    className="flex-1 rounded-t-sm"
                    style={{
                      height: `${h}%`,
                      background: i === 3 ? 'linear-gradient(to top,#7C3AED,#A78BFA)' : 'linear-gradient(to top,#4c1d95,#6d28d9)',
                      opacity: i === 3 ? 1 : 0.55,
                    }}
                    whileHover={{ scaleY: 1.1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  />
                ))}
              </div>
              <p className="text-[9px] text-emerald-400 font-semibold mt-1.5">{hero.stats?.revenueGrowth || FALLBACK_HERO.stats.revenueGrowth}</p>
            </motion.div>

            {/* Yellow 12K card */}
            <motion.div 
              className="bg-yellow-300 p-4 rounded-2xl shadow-xl w-full flex items-center justify-between"
              whileHover={{ y: -3, scale: 1.01 }}
            >
              <Users className="w-8 h-8 text-gray-800 shrink-0" />
              <div className="text-right">
                <p className="text-3xl font-extrabold text-gray-900 leading-none">{hero.stats?.helpedValue || FALLBACK_HERO.stats.helpedValue}</p>
                <p className="text-[10px] font-semibold text-gray-700 leading-tight mt-0.5">
  {getText(hero.stats?.helped, hero.stats?.helpedZh) || FALLBACK_HERO.stats.helped}
</p>
              </div>
            </motion.div>
          </div>

          {/* Desktop stat cards */}
          <div className="hidden lg:flex gap-4 px-1" style={{ marginTop: '-90px' }}>
            {/* Purple 45% */}
            <div className="bg-violet-600 p-5 rounded-2xl shadow-xl shrink-0" style={{ width: '45%' }}>
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold text-white text-base">
  {getText(hero.stats?.servicesTitle, hero.stats?.servicesTitleZh) || FALLBACK_HERO.stats.servicesTitle}
</h4>
                <span className="text-[10px] bg-white/20 text-white px-2.5 py-0.5 rounded-full font-medium border border-white/30">
                  {hero.stats?.servicesBadge || FALLBACK_HERO.stats.servicesBadge}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {getServicesList().slice(0, 6).map((s: string, i: number) => (
                  <div key={i} className="text-xs text-violet-100 bg-white/15 rounded-full px-3 py-1.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-200 shrink-0" />
                    {s}
                  </div>
                ))}
              </div>
            </div>

            {/* Dark 40% */}
            <div className="bg-gray-900 text-white p-5 rounded-2xl shadow-xl shrink-0" style={{ width: '40%' }}>
              <p className="text-gray-400 text-xs font-medium mb-0.5">
  {getText(hero.stats?.revenueTitle, hero.stats?.revenueTitleZh) || FALLBACK_HERO.stats.revenueTitle}
</p>
              <p className="text-3xl font-extrabold mb-3 tracking-tight">{hero.stats?.revenueValue || FALLBACK_HERO.stats.revenueValue}</p>
              <div className="flex items-end gap-1.5 h-12">
                {[35, 60, 40, 85, 55, 75, 50].map((h: number, i: number) => (
                  <div key={i} className="flex-1 rounded-t-sm" style={{
                    height: `${h}%`,
                    background: i === 3 ? 'linear-gradient(to top,#7C3AED,#A78BFA)' : 'linear-gradient(to top,#4c1d95,#6d28d9)',
                    opacity: i === 3 ? 1 : 0.55,
                  }} />
                ))}
              </div>
              <p className="text-[10px] text-emerald-400 font-semibold mt-2">{hero.stats?.revenueGrowth || FALLBACK_HERO.stats.revenueGrowth}</p>
            </div>

            {/* Yellow flex-1 (~15%) */}
            <div className="bg-yellow-300 p-5 rounded-2xl shadow-xl flex flex-col justify-between flex-1">
              <Users className="w-6 h-6 text-gray-800 mb-2" />
              <div>
                <p className="text-4xl font-extrabold text-gray-900 leading-none mb-1">{hero.stats?.helpedValue || FALLBACK_HERO.stats.helpedValue}</p>
                <p className="text-xs font-semibold text-gray-700 leading-tight">
  {getText(hero.stats?.helped, hero.stats?.helpedZh) || FALLBACK_HERO.stats.helped}
</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── ROW 4 · Trust marquee ── */}
        <motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.7 }}
  className="mt-6 sm:mt-10 pb-10 sm:pb-16 text-center"
>
  <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-5 font-medium tracking-wide">
    {hero.trust?.text || FALLBACK_HERO.trust.text}
  </p>
  <div className="relative w-full overflow-hidden py-2">
    <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-20 lg:w-24 bg-linear-to-r from-violet-50 to-transparent z-10 pointer-events-none" />
    <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-20 lg:w-24 bg-linear-to-l from-violet-50 to-transparent z-10 pointer-events-none" />
    <motion.div
      className="flex gap-5 sm:gap-8 lg:gap-10 whitespace-nowrap w-max"
      animate={{ x: [0, '-50%'] }}
      transition={{ duration: 20, repeat: Infinity, ease: 'linear', repeatType: 'loop' }}
    >
              {[...Array(2)].map((_, rep) =>
                ['Google', 'Meta', 'Amazon', 'Microsoft', 'Alibaba', 'Tencent', 'ByteDance'].map((l, i) => (
                  <motion.span
                    key={`${rep}-${i}`}
                    className="text-xs sm:text-sm lg:text-base font-extrabold tracking-widest text-gray-400/70 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-md bg-gray-200/40 whitespace-nowrap select-none"
                    whileHover={{ scale: 1.1, color: '#7C3AED' }}
                  >
                    {l}
                  </motion.span>
                ))
              )}
            </motion.div>
          </div>
        </motion.div>

      </motion.div>
    </section>
  );
}