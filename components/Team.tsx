// components/Team.tsx
'use client';
import { useState, useCallback, useEffect } from 'react';
import { motion, useMotionValue, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { supabase } from '@/lib/supabase'; // ✅ Import Supabase

// ── TYPES ────────────────────────────────────────────────────────────────
export interface CollaborationPhoto {
  _id: string;
  title: string;
  titleZh: string;
  description: string;
  descriptionZh: string;
  imageUrl: string;
  location?: string;
  locationZh?: string;
  date?: string;
}

// We remove the `data` prop because page.tsx blocks it. We only need `locale`.
interface TeamProps {
  data?: CollaborationPhoto[] | string;
  locale?: 'en' | 'zh';
}

// ── ICONS ───────────────────────────────────────────────────────────────
const ChevronLeft = () => (
  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
);
const ChevronRight = () => (
  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
);

// ── FALLBACK DATA ──────────────────────────────────────────────────────
const FALLBACK_TEAM: CollaborationPhoto[] = [
  { _id: '1', title: 'Tech Company Visit', titleZh: '科技公司访问', description: 'Meeting with the development team', descriptionZh: '与开发团队会面', location: 'Shanghai', locationZh: '上海', imageUrl: 'https://picsum.photos/seed/1/1200/700' },
  { _id: '2', title: 'Partnership Signing', titleZh: '合作签约', description: 'Official partnership agreement', descriptionZh: '正式合作协议', location: 'Beijing', locationZh: '北京', imageUrl: 'https://picsum.photos/seed/2/1200/700' },
  { _id: '3', title: 'Team Collaboration', titleZh: '团队协作', description: 'Working session with marketing', descriptionZh: '与市场团队会议', location: 'Guangzhou', locationZh: '广州', imageUrl: 'https://picsum.photos/seed/3/1200/700' },
  { _id: '4', title: 'Product Launch', titleZh: '产品发布', description: 'Joint product launch event', descriptionZh: '联合产品发布会', location: 'Shenzhen', locationZh: '深圳', imageUrl: 'https://picsum.photos/seed/4/1200/700' },
];

// ── FETCH & PARSE RAW SUPABASE DATA ────────────────────────────────────
const fetchAndParseTeam = async (): Promise<CollaborationPhoto[]> => {
  try {
    // Fetch ALL collaboration rows (both en and zh)
    const { data: rows, error } = await supabase
      .from('content')
      .select('locale, key_path, value')
      .eq('section', 'collaborations');

    if (error || !rows) return FALLBACK_TEAM;

    const itemMap: Record<string, any> = {};

    for (const row of rows) {
      const parts = row.key_path.split('.');
      
      // We only care about keys starting with "items."
      if (parts[0] === 'items' && parts[1]) {
        const index = parts[1]; // '1', '2', '3', etc.
        
        if (!itemMap[index]) {
          itemMap[index] = { _id: index };
        }

        // Parse JSON strings if necessary
        let value = row.value;
        if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
          try { value = JSON.parse(value); } catch (e) {}
        }

        if (row.locale === 'en') {
  if (parts.length === 2 && typeof value === 'object') {
    // imageUrl: always take from blob (source of truth)
    itemMap[index].imageUrl = value.imageUrl || itemMap[index].imageUrl;
    // text fields: never overwrite if already set by a flat key
    if (!itemMap[index].title)       itemMap[index].title       = value.title       || '';
    if (!itemMap[index].description) itemMap[index].description = value.description || '';
    if (!itemMap[index].location)    itemMap[index].location    = value.location    || '';
    // capture zh fields from blob if present
    if (!itemMap[index].titleZh)       itemMap[index].titleZh       = value.titleZh       || '';
    if (!itemMap[index].descriptionZh) itemMap[index].descriptionZh = value.descriptionZh || '';
    if (!itemMap[index].locationZh)    itemMap[index].locationZh    = value.locationZh    || '';
  }
} else if (row.locale === 'zh') {
          if (parts.length === 2 && typeof value === 'object') {
            // Chinese JSON blob
            itemMap[index].titleZh = value.title || itemMap[index].titleZh;
            itemMap[index].descriptionZh = value.description || itemMap[index].descriptionZh;
            itemMap[index].locationZh = value.location || itemMap[index].locationZh;
            if (value.imageUrl && !itemMap[index].imageUrl) itemMap[index].imageUrl = value.imageUrl;
          } else if (parts.length === 3) {
            // Chinese flat key: items.1.title = "..." (maps to titleZh)
            const field = parts[2];
            itemMap[index][field + 'Zh'] = value;
          }
        }
      }
    }

    // Convert the map to a sorted array
    const parsedArray = Object.keys(itemMap)
      .sort((a, b) => Number(a) - Number(b))
      .map(key => itemMap[key])
      .filter(item => item.imageUrl || item.title); // Filter out empty items

    return parsedArray.length > 0 ? parsedArray : FALLBACK_TEAM;
  } catch (error) {
    console.error('Failed to fetch team data:', error);
    return FALLBACK_TEAM;
  }
};

// ── COMPONENT ──────────────────────────────────────────────────────────
export default function Team({ locale = 'zh' }: TeamProps) {
  // ── ALL HOOKS FIRST — no returns before this block ──
  const [photos, setPhotos] = useState<CollaborationPhoto[]>(FALLBACK_TEAM);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [isHovering, setIsHovering] = useState(false);
  const dragX = useMotionValue(0);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(Math.max(0, Math.min(index, photos.length - 1)));
    dragX.set(0);
  }, [photos.length, dragX]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
    dragX.set(0);
  }, [photos.length, dragX]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
    dragX.set(0);
  }, [photos.length, dragX]);

  // Fetch effect
  useEffect(() => {
    const load = async () => {
      try {
        const { data: rows, error } = await supabase
          .from('content')
          .select('locale, key_path, value')
          .eq('section', 'collaborations');

        if (error || !rows) return;

        const itemMap: Record<string, any> = {};

        for (const row of rows) {
  const parts = row.key_path.split('.');
  if (parts[0] !== 'items' || !parts[1] || parts.length !== 3) continue;
  
  const index = parts[1];
  const field = parts[2];
  if (!itemMap[index]) itemMap[index] = { _id: index };

  if (row.locale === 'en') {
    itemMap[index][field] = row.value;
  } else if (row.locale === 'zh') {
    itemMap[index][field + 'Zh'] = row.value;
  }
}

// ── PASS 2: JSON blobs (items.1, items.2, etc.) — only fill missing fields
for (const row of rows) {
  const parts = row.key_path.split('.');
  if (parts[0] !== 'items' || !parts[1] || parts.length !== 2) continue;

  const index = parts[1];
  if (!itemMap[index]) itemMap[index] = { _id: index };

  let value: any = row.value;
  if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
    try { value = JSON.parse(value); } catch {}
  }
  if (typeof value !== 'object' || !value) continue;

  if (row.locale === 'en') {
    // imageUrl always from en blob
    itemMap[index].imageUrl = value.imageUrl || itemMap[index].imageUrl;
    // text: only fill if flat key didn't already set it
    if (!itemMap[index].title)       itemMap[index].title       = value.title       || '';
    if (!itemMap[index].description) itemMap[index].description = value.description || '';
    if (!itemMap[index].location)    itemMap[index].location    = value.location    || '';
  } else if (row.locale === 'zh') {
    if (value.imageUrl && !itemMap[index].imageUrl) itemMap[index].imageUrl = value.imageUrl;
    if (!itemMap[index].titleZh)       itemMap[index].titleZh       = value.titleZh || value.title || '';
    if (!itemMap[index].descriptionZh) itemMap[index].descriptionZh = value.descriptionZh || value.description || '';
    if (!itemMap[index].locationZh)    itemMap[index].locationZh    = value.locationZh || value.location || '';
  }
}

        const result = Object.keys(itemMap)
          .sort((a, b) => Number(a) - Number(b))
          .map(key => itemMap[key])
          .filter(item => item.imageUrl || item.title);

        if (result.length > 0) {
  setPhotos(result);
  
  // 🔍 DEBUG — remove after fixing
  if (result.length > 0) setPhotos(result);
}
      } catch (err) {
        console.error('Failed to fetch team data:', err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [locale]);

  // Auto-scroll effect
  useEffect(() => {
    if (isHovering || photos.length <= 1) return;
    const interval = setInterval(goToNext, 5000);
    return () => clearInterval(interval);
  }, [isHovering, photos.length, goToNext]);

  const getText = (en: string, zh?: string) => {
  if (locale === 'zh' && zh) return zh;
  return en || zh || ''; // ← fall back to zh if en is empty
};

  const CARD_SPACING = typeof window !== 'undefined' && window.innerWidth < 640 ? 340 : 520;

  // ── EARLY RETURNS AFTER ALL HOOKS ──
  if (loading) {
    return (
      <section id="team" className="py-12 sm:py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
          <p className="mt-4 text-gray-500">Loading collaborations...</p>
        </div>
      </section>
    );
  }

  if (!photos || photos.length === 0) return null;

  // const CARD_SPACING = typeof window !== 'undefined' && window.innerWidth < 640 ? 340 : 520;

  // const goToSlide = useCallback((index: number) => {
  //   setCurrentIndex(Math.max(0, Math.min(index, photos.length - 1)));
  //   dragX.set(0);
  // }, [photos.length, dragX]);

  // const goToPrevious = useCallback(() => {
  //   setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  //   dragX.set(0);
  // }, [photos.length, dragX]);

  // const goToNext = useCallback(() => {
  //   setCurrentIndex((prev) => (prev + 1) % photos.length);
  //   dragX.set(0);
  // }, [photos.length, dragX]);

  // // Auto-scroll
  // useEffect(() => {
  //   if (isHovering || photos.length <= 1) return;
  //   const interval = setInterval(() => { goToNext(); }, 5000);
  //   return () => clearInterval(interval);
  // }, [isHovering, photos.length, goToNext]);

  // // Helper to get text based on locale
  // const getText = (en: string, zh?: string) => locale === 'zh' && zh ? zh : en;

  return (
    <section id="team" className="py-12 sm:py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        {/* Title */}
        <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-8 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-2 sm:mb-3 px-2">
            {getText('Collaborations', '合作')}
          </h2>
          <p className="text-gray-500 text-sm sm:text-lg max-w-2xl mx-auto px-4">
            {getText('Building partnerships and creating memories together', '建立合作伙伴关系，共同创造美好回忆')}
          </p>
        </motion.div>

        {/* Carousel Container */}
        <div className="relative h-[420px] sm:h-[500px] lg:h-[600px] flex items-center justify-center overflow-hidden px-2" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
          <button onClick={goToPrevious} className="absolute left-0 sm:left-4 lg:left-8 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 flex items-center justify-center rounded-full bg-white/95 backdrop-blur-sm shadow-xl sm:shadow-2xl border-2 border-violet-200 text-violet-600 hover:bg-violet-600 hover:text-white hover:border-violet-600 transition-all duration-300 active:scale-95" aria-label={getText('Previous', '上一个')}>
            <ChevronLeft />
          </button>
          <button onClick={goToNext} className="absolute right-0 sm:right-4 lg:right-8 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 flex items-center justify-center rounded-full bg-white/95 backdrop-blur-sm shadow-xl sm:shadow-2xl border-2 border-violet-200 text-violet-600 hover:bg-violet-600 hover:text-white hover:border-violet-600 transition-all duration-300 active:scale-95" aria-label={getText('Next', '下一个')}>
            <ChevronRight />
          </button>

          <motion.div className="relative w-full h-full flex items-center justify-center" style={{ x: dragX }} drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.1}>
            <AnimatePresence mode="popLayout">
              {photos.map((photo, index) => {
                const offset = index - currentIndex;
                const isActive = offset === 0;
                const isAdjacent = Math.abs(offset) === 1;
                
                const imageUrl = imageErrors[photo._id] ? `https://picsum.photos/seed/${photo._id}/1200/700` : (photo.imageUrl || `https://picsum.photos/seed/${photo._id}/1200/700`);
                const displayTitle = getText(photo.title, photo.titleZh);
                const displayDesc = getText(photo.description, photo.descriptionZh);
                const displayLocation = getText(photo.location || '', photo.locationZh);

                return (
                  <motion.div key={photo._id || index} className="absolute left-1/2 -translate-x-1/2 cursor-pointer touch-pan-x" style={{ width: typeof window !== 'undefined' && window.innerWidth < 640 ? '280px' : '480px' }} initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: isActive ? 1 : isAdjacent ? 0.5 : 0.2, scale: isActive ? 1 : isAdjacent ? 0.9 : 0.8, x: offset * CARD_SPACING, zIndex: 10 - Math.abs(offset), filter: isActive ? 'none' : 'brightness(0.7) blur(2px)' }} exit={{ opacity: 0, scale: 0.9, y: -20 }} transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }} onClick={() => goToSlide(index)}>
                    <div className={`relative bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl sm:shadow-2xl border-2 ${isActive ? 'border-violet-300 shadow-violet-500/40' : 'border-gray-200'} transition-all duration-500`}>
                      {isActive && (<div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-linear-to-br from-violet-500/30 via-purple-500/30 to-fuchsia-500/30 blur-2xl -z-10 animate-pulse" />)}
                      <div className="relative h-48 sm:h-56 lg:h-80 bg-gray-100">
                        <Image src={imageUrl} alt={displayTitle || getText('Collaboration', '合作')} fill className="object-cover" sizes={typeof window !== 'undefined' && window.innerWidth < 640 ? '280px' : '480px'} priority={isActive} onError={() => setImageErrors(prev => ({ ...prev, [photo._id]: true }))} />
                        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent" />
                        <div className="absolute top-2 sm:top-4 left-2 sm:left-4">
                          <span className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white/95 backdrop-blur-sm text-violet-700 text-xs sm:text-sm font-bold rounded-full shadow-lg">
                            {displayLocation || getText('Collaboration', '合作')}
                          </span>
                        </div>
                      </div>
                      <div className="p-4 sm:p-6 bg-white">
                        <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2 leading-tight">{displayTitle}</h3>
                        <p className="text-gray-600 text-xs sm:text-sm leading-relaxed line-clamp-3">{displayDesc}</p>
                        {photo.date && (<p className="text-gray-400 text-[10px] sm:text-xs mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-100">{photo.date}</p>)}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center gap-2 sm:gap-3 mt-6 sm:mt-8">
          {photos.map((_, i) => (
            <button key={i} onClick={() => goToSlide(i)} className={`h-2 sm:h-3 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-8 sm:w-12 bg-violet-600' : 'w-2 sm:w-3 bg-gray-300 hover:bg-gray-400'}`} aria-label={`${getText('View photo', '查看照片')} ${i + 1}`} />
          ))}
        </div>

        <p className="text-center text-xs text-gray-400 mt-4 sm:hidden">
          ← {getText('Swipe or use buttons to navigate', '滑动或使用按钮浏览')} →
        </p>
      </div>
      <div className="h-[15px]" />
    </section>
  );
}