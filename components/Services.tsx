// components/Services.tsx
'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { 
  Search, Palette, Megaphone, ShoppingCart, BarChart3, Headset,
  MessageCircle, Target 
} from 'lucide-react';
import Link from 'next/link';

// ── TYPES ────────────────────────────────────────────────────────────────
export interface ServiceItem {
  title: string;
  titleZh: string;
  desc: string;
  descZh: string;
  imageUrl?: string;
  icon?: string;
}

export interface ServicesItems {
  seo: ServiceItem;
  design: ServiceItem;
  marketing: ServiceItem;
  ecommerce: ServiceItem;
  analytics: ServiceItem;
  support: ServiceItem;
}

export interface ServicesData {
  title: string;
  titleZh: string;
  subtitle: string;
  subtitleZh: string;
  items: ServicesItems;
}

// ── ICONS ───────────────────────────────────────────────────────────────
const icons: Record<string, any> = {
  seo: Search,
  design: Palette,
  marketing: Megaphone,
  ecommerce: ShoppingCart,
  analytics: BarChart3,
  support: Headset,
};

// ── FALLBACK DATA ──────────────────────────────────────────────────────
const FALLBACK_SERVICES: ServicesData = {
  title: 'Business Services',
  titleZh: '企业服务',
  subtitle: 'We provide a wide range of digital services to help your business grow.',
  subtitleZh: '我们提供广泛的数字服务，帮助您的业务增长。',
  items: {
    seo: { 
      title: 'SEO Optimization',
      titleZh: 'SEO优化',
      desc: 'Improve your search rankings and drive organic traffic.',
      descZh: '提高您的搜索排名并带来有机流量。',
      imageUrl: 'https://picsum.photos/seed/seo/600/400'
    },
    design: { 
      title: 'UI/UX Design',
      titleZh: 'UI/UX设计',
      desc: 'Beautiful interfaces designed for maximum user engagement.',
      descZh: '为最大化用户参与度而设计的美观界面。',
      imageUrl: 'https://picsum.photos/seed/design/600/400'
    },
    marketing: { 
      title: 'Digital Marketing',
      titleZh: '数字营销',
      desc: 'Strategic campaigns that convert visitors into customers.',
      descZh: '将访客转化为客户的战略活动。',
      imageUrl: 'https://picsum.photos/seed/marketing/600/400'
    },
    ecommerce: { 
      title: 'E-Commerce',
      titleZh: '电子商务',
      desc: 'Robust online stores built to maximize sales.',
      descZh: '为最大化销售而构建的强大在线商店。',
      imageUrl: 'https://picsum.photos/seed/ecommerce/600/400'
    },
    analytics: { 
      title: 'Analytics',
      titleZh: '数据分析',
      desc: 'Data-driven insights to help you make better decisions.',
      descZh: '数据驱动的洞察，帮助您做出更好的决策。',
      imageUrl: 'https://picsum.photos/seed/analytics/600/400'
    },
    support: { 
      title: '24/7 Support',
      titleZh: '全天候支持',
      desc: 'Dedicated team ready to help you whenever you need.',
      descZh: '专属团队随时准备在您需要时提供帮助。',
      imageUrl: 'https://picsum.photos/seed/support/600/400'
    },
  }
};

// ── HELPER: Parse Supabase values ──────────────────────────────────────
const parseServicesItems = (value: any): ServicesItems => {
  if (typeof value === 'string' && value.startsWith('{')) {
    try {
      const parsed = JSON.parse(value);
      if (parsed.seo && parsed.design) return parsed as ServicesItems;
    } catch {}
  }
  if (value && typeof value === 'object' && value.seo && value.design) {
    return value as ServicesItems;
  }
  return FALLBACK_SERVICES.items;
};

// ── COMPONENT ─────────────────────────────────────────────────────────
export default function Services({ data, locale = 'zh' }: { 
  data?: ServicesData;
  locale?: 'en' | 'zh';
}) {
  const items = parseServicesItems(data?.items);
  
  const services = {
    ...FALLBACK_SERVICES,
    ...data,
    items
  };
  
  // ✅ Updated keys to match your database
  const serviceKeys = ['seo', 'design', 'marketing', 'ecommerce', 'analytics', 'support'] as const;

  // Helper to get text based on locale
  const getText = (en: string, zh: string) => locale === 'zh' ? zh : en;

  return (
    <section id="services" className="py-10 sm:py-16 bg-gradient-to-b from-white to-violet-50/30">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        
        {/* Header - Mobile Friendly */}
        <div className="text-center mb-8 sm:mb-12 px-2">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-violet-100 text-violet-700 rounded-full text-xs sm:text-sm font-semibold mb-3"
          >
            <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            {getText('Services', '服务')}
          </motion.span>
          
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-3"
          >
            {getText(services.title, services.titleZh)}
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xs sm:text-sm text-gray-600 max-w-xl mx-auto"
          >
            {getText(services.subtitle, services.subtitleZh)}
          </motion.p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {serviceKeys.map((key, i) => {
            const IconComponent = icons[key];
            const item = items[key];
            const title = getText(item?.title || '', item?.titleZh || '');
            const desc = getText(item?.desc || '', item?.descZh || '');
            
            return (
              <Link key={key} href={`/services?service=${key}`} className="block">
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ y: -3 }}
                  className="bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:border-violet-200 transition-all duration-300 group cursor-pointer"
                >
                  {/* Image */}
                  <div className="relative h-28 sm:h-36 overflow-hidden">
                    <Image
                      src={item?.imageUrl || `https://picsum.photos/seed/${key}/600/400`}
                      alt={title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />
                    
                    {/* Icon Badge */}
                    <div className="absolute bottom-2 left-2 w-8 h-8 sm:w-10 sm:h-10 bg-white/95 backdrop-blur-sm rounded-lg flex items-center justify-center text-violet-600 shadow">
                      {IconComponent && <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />}
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-3 sm:p-4">
                    <h3 className="text-xs sm:text-sm font-bold text-gray-900 mb-1.5 leading-tight line-clamp-2">
                      {title}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-gray-600 leading-relaxed line-clamp-3">
                      {desc}
                    </p>
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </div>

        {/* CTA Section */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-8 sm:mt-12 p-4 sm:p-6 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-2xl text-white"
        >
          <h3 className="text-sm sm:text-lg font-bold mb-2">
            {locale === 'zh' ? '准备合作了吗？' : 'Ready to Collaborate?'}
          </h3>
          <p className="text-violet-100 mb-4 text-xs sm:text-sm">
            {locale === 'zh' 
              ? '让我们一起创造精彩。联系我开始您的项目。' 
              : "Let's create something amazing together."}
          </p>
          <a 
            href="#contact" 
            className="inline-flex items-center gap-1.5 px-4 py-2 sm:px-6 sm:py-3 bg-white text-violet-700 font-semibold rounded-lg hover:bg-violet-50 transition text-xs sm:text-sm"
          >
            <MessageCircle className="w-4 h-4" />
            {locale === 'zh' ? '联系我们' : 'Get in Touch'}
          </a>
        </motion.div>
      </div>
    </section>
  );
}