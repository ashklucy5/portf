// components/About.tsx
'use client';
import { useState } from 'react'; // ✅ FIX: Import useState
import { motion } from 'framer-motion';
import { Lightbulb, Rocket, Users, ShieldCheck } from 'lucide-react';
import Image from 'next/image';

// ── TYPES ────────────────────────────────────────────────────────────────
export interface FeatureItem {
  title: string;
  desc: string;
}

export interface AboutFeatures {
  strategy: FeatureItem;
  growth: FeatureItem;
  team: FeatureItem;
  secure: FeatureItem;
}

export interface AboutData {
  badge: string;
  title: string;
  subtitle: string;
  heading: string;
  description: string;
  aboutImage: string;
  features: AboutFeatures | string; // ✅ Can be object or JSON string from Supabase
}

// ── ICONS ───────────────────────────────────────────────────────────────
const icons: Record<string, any> = { 
  strategy: Lightbulb, 
  growth: Rocket, 
  team: Users, 
  secure: ShieldCheck 
};

// ── FALLBACK DATA ──────────────────────────────────────────────────────
const FALLBACK_ABOUT: AboutData = {
  badge: 'About Us',
  title: 'Who We Are',
  subtitle: 'We are a team of passionate creators, developers, and strategists dedicated to building digital experiences that matter.',
  heading: 'We blend creativity with data to help your business grow exponentially.',
  description: 'At GoSarwar, we believe that great design is more than just aesthetics. It\'s about solving problems, connecting with audiences, and delivering measurable results.',
  aboutImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  features: {
    strategy: { title: 'Creative Strategy', desc: 'Innovative approaches to stand out in the market.' },
    growth: { title: 'Data Driven', desc: 'Decisions backed by analytics and real user insights.' },
    team: { title: 'Expert Team', desc: 'Skilled professionals passionate about technology.' },
    secure: { title: 'Secure & Reliable', desc: 'Robust solutions you can trust with your data.' }
  }
};

// ── HELPER: Parse Supabase values ──────────────────────────────────────
const parseSupabaseValue = <T,>(value: T | string | null | undefined): T => {
  if (value === undefined || value === null) return value as T;
  if (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{'))) {
    try { return JSON.parse(value) as T; } catch { return value as T; }
  }
  return value as T;
};

// ── TYPE GUARD: Check if features is the proper object type ────────────
const isAboutFeatures = (features: any): features is AboutFeatures => {
  return (
    typeof features === 'object' &&
    features !== null &&
    'strategy' in features &&
    'growth' in features &&
    'team' in features &&
    'secure' in features
  );
};

// ── COMPONENT ──────────────────────────────────────────────────────────
export default function About({ data }: { data?: AboutData }) {
  // ✅ Parse features if it's a JSON string from Supabase
  const parsedFeatures = parseSupabaseValue<AboutFeatures | string>(data?.features);
  
  // ✅ Use type guard to safely access features
  const features = (isAboutFeatures(parsedFeatures) 
  ? parsedFeatures 
  : (typeof parsedFeatures === 'string' ? FALLBACK_ABOUT.features : parsedFeatures || FALLBACK_ABOUT.features)
) as AboutFeatures;
  
  // ✅ Merge with fallback to ensure we always have content
  const about = { 
    ...FALLBACK_ABOUT, 
    ...data,
    features
  };
  
  const [imageError, setImageError] = useState(false); // ✅ Now useState is defined
  const featureKeys = ['strategy', 'growth', 'team', 'secure'] as const;

  return (
    <section id="about" className="relative py-18 sm:py-26 bg-linear-to-b from-slate-50 to-white overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-fuchsia-200/30 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-5">
        
        {/* HEADER */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 sm:mb-20"
        >
          <motion.span 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-100/80 text-violet-700 rounded-full text-sm sm:text-base font-bold mb-6 backdrop-blur-sm border border-violet-200/50"
          >
            <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
            {about.badge}
          </motion.span>
          
          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-5 sm:mb-6 leading-tight tracking-tight"
          >
            {about.title}
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4 sm:px-0 text-center leading-relaxed"
          >
            {about.subtitle}
          </motion.p>
        </motion.div>

        {/* MAIN CONTENT */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          
          {/* LEFT: Text + Features */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-8 sm:space-y-10 text-center lg:text-left"
          >
            <motion.h3 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-snug"
            >
              {about.heading}
            </motion.h3>

            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="text-base text-gray-600 leading-relaxed text-justify lg:text-left hyphens-auto"
            >
              {about.description}
            </motion.p>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 pt-2">
              {featureKeys.map((key, index) => {
                const Icon = icons[key];
                // ✅ Type-safe access - features is always AboutFeatures after type guard
                const feature = features[key];
                
                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
                    whileHover={{ y: -4 }}
                    className="flex items-center gap-3 p-5 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-violet-200/50 transition-all duration-300"
                  >
                    <div className="shrink-0 w-11 h-11 sm:w-12 sm:h-12 bg-linear-to-br from-violet-500/10 to-fuchsia-500/10 rounded-xl flex items-center justify-center text-violet-600">
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="text-left min-w-0">
                      <p className="font-bold text-sm sm:text-base text-gray-900 leading-tight">
                        {feature?.title || (FALLBACK_ABOUT.features as AboutFeatures)[key].title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 leading-snug">
                        {feature?.desc || ''}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* RIGHT: Image */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative w-full mt-8 lg:mt-0"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gray-100 aspect-4/3 sm:aspect-square lg:aspect-4/3">
              <Image
                src={imageError ? FALLBACK_ABOUT.aboutImage : (about.aboutImage || FALLBACK_ABOUT.aboutImage)}
                alt={about.title}
                fill
                className="object-cover transition-transform duration-700 hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
                priority
                onError={() => setImageError(true)} // ✅ Fallback if OSS image fails
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent" />
            </div>
            
            {/* Floating badge */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="absolute -bottom-5 -right-5 sm:bottom-8 sm:-right-8 bg-white/95 backdrop-blur-md rounded-2xl p-4 sm:p-5 shadow-xl border border-gray-100"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-semibold text-gray-700">150+ Projects</span>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}