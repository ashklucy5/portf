// components/WorksCarousel.tsx
'use client';
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X, Play, Eye, Heart, Share2, MessageCircle } from 'lucide-react';

// ── TYPES ───────────────────────────────────────────────────────────────
export interface ShowcaseItem {
  id: string;
  image: string;
  title: string;
  titleZh?: string;  // ✅ Added Chinese title
}

export interface CaseStudy {
  id: string;
  image: string;
  title: string;
  titleZh?: string;   // ✅ Added Chinese title
  desc: string;
  descZh?: string;    // ✅ Added Chinese description
  videoUrl: string;
}

export interface WorksCarouselData {
  showcaseImages?: any;
  caseStudies?: any;
}

// ── HELPERS ─────────────────────────────────────────────────────────────
const generateFakeStats = (seed: string) => {
  const hash = seed.split('').reduce((acc, char, i) => {
    return ((acc << 5) - acc) + char.charCodeAt(0) + i;
  }, 0);
  
  const seededRandom = (min: number, max: number) => {
    const x = Math.sin(hash + min * 100) * 10000;
    return (x - Math.floor(x)) * (max - min) + min;
  };

  const formatNumber = (num: number) => {
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 100_000) return Math.round(num / 1000) + 'K';
    if (num >= 10_000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return Math.round(num).toLocaleString();
  };

  const views = Math.floor(seededRandom(30_000, 1_000_000));
  const likeRatio = seededRandom(0.03, 0.12);
  const shareRatio = seededRandom(0.005, 0.03);
  const commentRatio = seededRandom(0.01, 0.06);

  return {
    views: formatNumber(views),
    likes: formatNumber(views * likeRatio),
    shares: formatNumber(views * shareRatio),
    comments: formatNumber(views * commentRatio)
  };
};

// ✅ Smart Transformer for Supabase Data
const transformSupabaseData = (data: any): any[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  
  if (typeof data === 'object') {
    if (data.items) {
      return Object.entries(data.items).map(([key, value]: [string, any]) => ({
        ...value,
        id: key
      }));
    }
    return Object.entries(data).map(([key, value]: [string, any]) => ({
      ...value,
      id: key
    }));
  }
  return [];
};

// ── FALLBACK DATA ──────────────────────────────────────────────────────
const FALLBACK_DATA: WorksCarouselData = {
  showcaseImages: [
    { id: '1', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop', title: 'Project Alpha', titleZh: '项目阿尔法' },
    { id: '2', image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=600&fit=crop', title: 'Project Beta', titleZh: '项目贝塔' },
    { id: '3', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', title: 'Project Gamma', titleZh: '项目伽马' },
    { id: '4', image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=600&fit=crop', title: 'Project Delta', titleZh: '项目德尔塔' },
    { id: '5', image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&h=600&fit=crop', title: 'Project Epsilon', titleZh: '项目伊普西龙' },
    { id: '6', image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop', title: 'Project Zeta', titleZh: '项目泽塔' },
  ],
  caseStudies: [
    { id: 'cs1', image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=533&fit=crop', title: 'Growth Strategy', titleZh: '增长策略', desc: 'How we increased conversions by 300%', descZh: '如何将转化率提高300%', videoUrl: '#' },
    { id: 'cs2', image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=533&fit=crop', title: 'Brand Redesign', titleZh: '品牌重塑', desc: 'Complete visual identity overhaul', descZh: '完整的视觉形象改造', videoUrl: '#' },
    { id: 'cs3', image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=533&fit=crop', title: 'Marketing Campaign', titleZh: '营销活动', desc: 'Viral social media strategy', descZh: '病毒式社交媒体策略', videoUrl: '#' },
    { id: 'cs4', image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=533&fit=crop', title: 'Product Launch', titleZh: '产品发布', desc: 'Successful go-to-market plan', descZh: '成功的上市计划', videoUrl: '#' },
    { id: 'cs5', image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=533&fit=crop', title: 'UX Research', titleZh: '用户体验研究', desc: 'User-centered design approach', descZh: '以用户为中心的设计方法', videoUrl: '#' },
    { id: 'cs6', image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=533&fit=crop', title: 'SEO Optimization', titleZh: 'SEO优化', desc: 'Ranking #1 on Google', descZh: '谷歌排名第一', videoUrl: '#' },
    { id: 'cs7', image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=533&fit=crop', title: 'E-commerce', titleZh: '电子商务', desc: '300% sales increase', descZh: '销售额增长300%', videoUrl: '#' },
    { id: 'cs8', image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=533&fit=crop', title: 'Content Strategy', titleZh: '内容策略', desc: 'Engaging storytelling', descZh: '引人入胜的故事讲述', videoUrl: '#' },
    { id: 'cs9', image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=533&fit=crop', title: 'Analytics', titleZh: '数据分析', desc: 'Data-driven decisions', descZh: '数据驱动的决策', videoUrl: '#' },
  ]
};

// ── COMPONENT ──────────────────────────────────────────────────────────
export default function WorksCarousel({ data, locale = 'zh' }: { 
  data?: WorksCarouselData;
  locale?: 'en' | 'zh';  // ✅ Added locale prop
}) {
  const showcaseImages = transformSupabaseData(data?.showcaseImages) as ShowcaseItem[];
  const caseStudies = transformSupabaseData(data?.caseStudies) as CaseStudy[];

  const finalShowcase = showcaseImages.length > 0 ? showcaseImages : (FALLBACK_DATA.showcaseImages as ShowcaseItem[]);
  const finalCaseStudies = caseStudies.length > 0 ? caseStudies : (FALLBACK_DATA.caseStudies as CaseStudy[]);

  // ─── Row 1 State ─────────────────────────────────────────────────────
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  // ─── Row 2 State ─────────────────────────────────────────────────────
  const [caseIndex, setCaseIndex] = useState(0);
  const caseContainerRef = useRef<HTMLDivElement>(null);

  // Auto-advance Row 1
  useEffect(() => {
    if (isHovering || finalShowcase.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % finalShowcase.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isHovering, finalShowcase.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + finalShowcase.length) % finalShowcase.length);
  }, [finalShowcase.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % finalShowcase.length);
  }, [finalShowcase.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToPrevious, goToNext]);

  // Row 2 scroll handling
  const scrollToCase = useCallback((index: number) => {
    const container = caseContainerRef.current;
    if (!container) return;
    
    const card = container.querySelector('[data-case-card]') as HTMLElement;
    if (!card) return;
    
    const cardWidth = card.offsetWidth;
    const gap = 16;
    const scrollPosition = index * (cardWidth + gap);
    
    container.scrollTo({ left: scrollPosition, behavior: 'smooth' });
    setCaseIndex(index);
  }, []);

  const handleCaseScroll = useCallback(() => {
    const container = caseContainerRef.current;
    if (!container) return;
    
    const card = container.querySelector('[data-case-card]') as HTMLElement;
    if (!card) return;
    
    const cardWidth = card.offsetWidth;
    const gap = 16;
    const newIndex = Math.round(container.scrollLeft / (cardWidth + gap));
    
    setCaseIndex(Math.max(0, Math.min(newIndex, finalCaseStudies.length - 1)));
  }, [finalCaseStudies.length]);

  if (finalShowcase.length === 0 && finalCaseStudies.length === 0) return null;

  const getVisibleItems = () => {
    const items = [];
    for (let i = -1; i <= 1; i++) {
      const index = (currentIndex + i + finalShowcase.length) % finalShowcase.length;
      items.push({ ...finalShowcase[index], offset: i });
    }
    return items;
  };

  // ✅ Helper to get text based on locale
  const getText = (en: string, zh?: string) => locale === 'zh' && zh ? zh : en;

  return (
    <section id="works" className="w-full py-12 sm:py-20 bg-linear-to-b from-gray-50 to-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        
        {/* ROW 1: Showcase Carousel */}
        {finalShowcase.length > 0 && (
          <div className="mb-12 sm:mb-20">
            <div className="text-center mb-6 sm:mb-8 px-2">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">
                {getText('Our Works', '我们的作品')}
              </h2>
              <p className="text-gray-500 text-xs sm:text-sm">
                {finalShowcase.length} {getText('projects', '个项目')} • {getText('Trusted by 30K+ teams globally', '全球30,000+团队信赖')}
              </p>
            </div>

            <div 
              ref={containerRef}
              className="relative w-full max-w-full mx-auto px-2"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              {/* Navigation Arrows */}
              <button
                onClick={goToPrevious}
                className="absolute left-0 sm:-left-8 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-white/95 backdrop-blur-sm shadow-lg border border-gray-200 text-gray-600 hover:text-violet-600 hover:border-violet-300 transition-all duration-300 active:scale-95"
                aria-label={getText('Previous', '上一个')}
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-0 sm:-right-8 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-white/95 backdrop-blur-sm shadow-lg border border-gray-200 text-gray-600 hover:text-violet-600 hover:border-violet-300 transition-all duration-300 active:scale-95"
                aria-label={getText('Next', '下一个')}
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Carousel Track */}
              <div className="flex items-center justify-center gap-3 sm:gap-6 py-4 sm:py-10">
                <AnimatePresence mode="popLayout">
                  {getVisibleItems().map((item, index) => {
                    const isCenter = item.offset === 0;
                    
                    const imageUrl = imageErrors[item.id] 
                      ? 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=600&fit=crop' 
                      : (item.image || 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=600&fit=crop');
                    
                    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
                    const cardSize = isMobile ? 260 : (isCenter ? 320 : 240);
                    
                    // ✅ Use Chinese title if available and locale is zh
                    const displayTitle = getText(item.title, item.titleZh);
                    
                    return (
                      <motion.div
                        key={`${item.id}-${currentIndex}-${index}`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: isCenter ? (isMobile ? 1.05 : 1.15) : 0.9 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.4, ease: [0.25, 0.4, 0.25, 1], delay: index * 0.05 }}
                        className={`relative cursor-pointer touch-pan-x ${isCenter ? 'z-10' : 'z-0'}`}
                        onClick={() => setLightboxSrc(item.image)}
                        style={{ 
                          filter: isCenter ? 'none' : 'blur(2px) brightness(0.85)',
                          width: cardSize,
                          height: cardSize,
                        }}
                      >
                        <div 
                          className={`relative w-full h-full rounded-xl sm:rounded-2xl overflow-hidden bg-gray-200 ${isCenter ? 'shadow-xl sm:shadow-2xl' : 'shadow-lg'} transition-all duration-400`}
                          style={{ width: cardSize, height: cardSize }}
                        >
                          {isCenter && (
                            <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-linear-to-br from-violet-500/30 via-purple-500/30 to-fuchsia-500/30 blur-xl -z-10 animate-pulse" />
                          )}
                          <Image 
                            src={imageUrl}
                            alt={displayTitle || getText('Work', '作品')} 
                            fill
                            className="object-cover"
                            sizes={`${cardSize}px`}
                            priority={isCenter}
                            onError={() => {
                              console.error('Image failed to load:', imageUrl);
                              setImageErrors(prev => ({ ...prev, [item.id]: true }));
                            }}
                          />
                          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                          {isCenter && (
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }} 
                              whileInView={{ opacity: 1, y: 0 }} 
                              className="absolute bottom-0 left-0 right-0 p-3 sm:p-5 text-white"
                            >
                              <p className="text-xs sm:text-base font-bold text-center line-clamp-2">{displayTitle}</p>
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* Dots */}
              <div className="flex justify-center gap-1.5 sm:gap-2 mt-4 sm:mt-6">
                {finalShowcase.map((_, i) => (
                  <button 
                    key={i} 
                    onClick={() => setCurrentIndex(i)} 
                    className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-6 sm:w-8 bg-violet-600' : 'w-1.5 sm:w-2 bg-gray-300 hover:bg-gray-400'}`} 
                    aria-label={`${getText('Slide', '幻灯片')} ${i + 1}`} 
                  />
                ))}
              </div>
              
              {/* Counter */}
              <p className="text-center text-xs text-gray-400 mt-3">
                {currentIndex + 1} {getText('of', '共')} {finalShowcase.length}
              </p>
            </div>
          </div>
        )}

        {/* ROW 2: Case Studies */}
        {finalCaseStudies.length > 0 && (
          <div className="mt-8 sm:mt-16">
            <div className="text-center mb-6 sm:mb-10">
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                {getText('Case Studies', '案例研究')}
              </h3>
              <p className="text-gray-500 text-sm">
                {finalCaseStudies.length} {getText('videos', '个视频')} • {getText('Swipe to explore', '滑动浏览')} • {getText('Tap to watch', '点击观看')}
              </p>
            </div>

            <div className="relative px-2 sm:px-4">
              {/* Navigation Arrows */}
              <button
                onClick={() => scrollToCase(Math.max(0, caseIndex - 1))}
                disabled={caseIndex === 0}
                className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 items-center justify-center rounded-full bg-white shadow-md border border-gray-200 text-gray-600 hover:text-violet-600 hover:border-violet-300 transition disabled:opacity-30 disabled:cursor-default"
                aria-label={getText('Previous case study', '上一个案例')}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollToCase(Math.min(finalCaseStudies.length - 1, caseIndex + 1))}
                disabled={caseIndex === finalCaseStudies.length - 1}
                className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 items-center justify-center rounded-full bg-white shadow-md border border-gray-200 text-gray-600 hover:text-violet-600 hover:border-violet-300 transition disabled:opacity-30 disabled:cursor-default"
                aria-label={getText('Next case study', '下一个案例')}
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Draggable Track */}
              <div
                ref={caseContainerRef}
                className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide py-2 scroll-smooth"
                onScroll={handleCaseScroll}
              >
                <div className="shrink-0 w-[10%] sm:w-[15%]" />

                {finalCaseStudies.map((story, index) => {
                  const isActive = index === caseIndex;
                  const stats = useMemo(() => generateFakeStats(`${story.id || index}-${story.title}`), [story.id, index, story.title]);
                  
                  const highlightWord = story.title?.split(' ')[0] || getText('Video', '视频');
                  const restOfTitle = story.title?.replace(highlightWord, '').trim() || '';
                  
                  const imageUrl = imageErrors[story.id] 
                    ? `https://picsum.photos/seed/${story.id || index}/400/533` 
                    : (story.image || `https://picsum.photos/seed/${story.id || index}/400/533`);

                  // ✅ Use Chinese title/desc if available
                  const displayTitle = getText(story.title, story.titleZh);
                  const displayDesc = getText(story.desc, story.descZh);

                  return (
                    <motion.a
                      key={story.id || index}
                      href={story.videoUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-case-card
                      className="shrink-0 w-[85%] sm:w-70 md:w-75 snap-center"
                      initial={{ opacity: 0.7, scale: 0.95 }}
                      animate={{ opacity: isActive ? 1 : 0.5, scale: isActive ? 1 : 0.92 }}
                      transition={{ duration: 0.3 }}
                      whileHover={{ y: -4 }}
                    >
                      <div className="relative bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-2xl hover:border-violet-200/50 transition-all duration-300 group">
                        <div className="relative aspect-3/4 sm:aspect-4/5 bg-gray-100">
                          <Image
                            src={imageUrl}
                            alt={displayTitle || getText('Case study', '案例')}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            sizes="(max-width: 640px) 85vw, 280px"
                            onError={() => setImageErrors(prev => ({ ...prev, [story.id]: true }))}
                          />
                          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
                          <div className="absolute inset-0 flex items-center justify-center px-4 text-center">
                            <div className="max-w-[90%]">
                              <p className="text-white text-base sm:text-lg font-bold leading-snug drop-shadow-lg">
                                {highlightWord && (
                                  <span className="bg-black/60 text-yellow-300 px-1.5 py-0.5 rounded-sm mx-0.5">
                                    {highlightWord}
                                  </span>
                                )}
                                <span className="text-white/95">{restOfTitle}</span>
                              </p>
                            </div>
                          </div>
                          <div className="absolute bottom-4 right-4">
                            <div className="w-10 h-10 sm:w-11 sm:h-11 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                              <Play className="w-4 h-4 sm:w-5 sm:h-5 text-violet-600 ml-0.5" fill="currentColor" />
                            </div>
                          </div>
                        </div>
                        <div className="p-3 sm:p-4 bg-white border-t border-gray-100">
                          <div className="grid grid-cols-4 gap-1.5">
                            <div className="flex flex-col items-center gap-1 px-2 py-1.5 bg-gray-50 rounded-lg">
                              <Eye className="w-3.5 h-3.5 text-gray-400" />
                              <span className="text-[10px] sm:text-xs font-semibold text-gray-700">{stats.views}</span>
                              <span className="text-[9px] text-gray-400">{getText('Views', '观看')}</span>
                            </div>
                            <div className="flex flex-col items-center gap-1 px-2 py-1.5 bg-gray-50 rounded-lg">
                              <Heart className="w-3.5 h-3.5 text-gray-400" />
                              <span className="text-[10px] sm:text-xs font-semibold text-gray-700">{stats.likes}</span>
                              <span className="text-[9px] text-gray-400">{getText('Likes', '点赞')}</span>
                            </div>
                            <div className="flex flex-col items-center gap-1 px-2 py-1.5 bg-gray-50 rounded-lg">
                              <Share2 className="w-3.5 h-3.5 text-gray-400" />
                              <span className="text-[10px] sm:text-xs font-semibold text-gray-700">{stats.shares}</span>
                              <span className="text-[9px] text-gray-400">{getText('Shares', '分享')}</span>
                            </div>
                            <div className="flex flex-col items-center gap-1 px-2 py-1.5 bg-gray-50 rounded-lg">
                              <MessageCircle className="w-3.5 h-3.5 text-gray-400" />
                              <span className="text-[10px] sm:text-xs font-semibold text-gray-700">{stats.comments}</span>
                              <span className="text-[9px] text-gray-400">{getText('Comments', '评论')}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.a>
                  );
                })}

                <div className="shrink-0 w-[10%] sm:w-[15%]" />
              </div>

              {/* Progress Dots */}
              <div className="flex justify-center gap-1.5 mt-4">
                {finalCaseStudies.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => scrollToCase(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${i === caseIndex ? 'w-6 bg-violet-600' : 'w-1.5 bg-gray-300 hover:bg-gray-400'}`}
                    aria-label={`${getText('View case study', '查看案例')} ${i + 1}`}
                  />
                ))}
              </div>

              {/* Counter + Hint */}
              <p className="text-center text-xs text-gray-400 mt-2 sm:hidden">
                {caseIndex + 1} {getText('of', '共')} {finalCaseStudies.length}
              </p>
              <p className="text-center text-[10px] text-gray-400 mt-3 sm:hidden">
                ← {getText('Swipe to explore', '滑动浏览')} →
              </p>
            </div>
          </div>
        )}
      </div>

      {/* LIGHTBOX MODAL */}
      <AnimatePresence>
        {lightboxSrc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4"
            onClick={() => setLightboxSrc(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-full sm:max-w-4xl aspect-square sm:aspect-auto rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Image 
                src={imageErrors['lightbox'] ? 'https://picsum.photos/seed/lightbox/800/800' : lightboxSrc}
                alt={getText('Expanded', '放大查看')} 
                fill
                className="object-contain sm:object-cover"
                sizes="100vw"
                onError={() => setImageErrors(prev => ({ ...prev, lightbox: true }))}
              />
              <button 
                onClick={() => setLightboxSrc(null)} 
                className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition"
                aria-label={getText('Close', '关闭')}
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}