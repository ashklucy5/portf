// components/BlogPost.tsx
'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import Link from 'next/link';

export interface BlogPostData {
  id: string;
  serviceKey: string;
  title: string;
  titleZh: string;
  content: string;
  contentZh: string;
  imageUrl: string;
  publishedDate?: string;
  readTime?: string;
}

interface BlogPostProps {
  post: BlogPostData;
  locale?: 'en' | 'zh';
  onBack?: () => void;
}

export default function BlogPost({ post, locale = 'zh', onBack }: BlogPostProps) {
  const getText = (en: string, zh: string) => locale === 'zh' && zh ? zh : en;
  
  return (
    <article className="min-h-screen bg-linear-to-b from-white to-gray-50">
      {/* Back Button - Floating in top-left corner */}
      <div className="w-full h-[5vh] min-h-[50px] flex items-center px-4 bg-white border-b border-gray-100">
      <button
        onClick={onBack || (() => window.history.back())}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full shadow-sm text-gray-700 hover:text-violet-600 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">
          {locale === 'zh' ? '返回服务' : 'Back'}
        </span>
      </button>
    </div>

    {/* MARGIN */}
    {/* <div className="h-[5vh]" /> */}

    {/* IMAGE — 60vh on desktop, 40vh on mobile */}
    <div className="relative w-full bg-gray-900" style={{ height: '1080px' }}>
  <Image
    src={post.imageUrl || 'https://placehold.co/1200x800/9333ea/ffffff?text=Service+Image'}
    alt={getText(post.title, post.titleZh)}
    fill
    className="object-contain object-center"
    sizes="100vw"
    priority
  />
      {/* Title Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 lg:p-12 bg-linear-to-t from-black/80 via-black/50 to-transparent">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white leading-tight mb-4">
            {getText(post.title, post.titleZh)}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-white/90 text-sm sm:text-base">
            {post.publishedDate && (
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {post.publishedDate}
              </span>
            )}
            {post.readTime && (
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {post.readTime} read
              </span>
            )}
          </div>
        </div>
      </div>
    </div>


      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="prose prose-lg max-w-none"
        >
          <div 
            className="text-gray-700 leading-relaxed text-base sm:text-lg whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ 
              __html: getText(post.content, post.contentZh).replace(/\n/g, '<br/>') 
            }}
          />
        </motion.div>

        {/* CTA Section */}
        <div className="mt-12 sm:mt-16 p-6 sm:p-8 bg-gradient-to-br from-violet-50 to-fuchsia-50 rounded-2xl sm:rounded-3xl border border-violet-100 shadow-sm">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
            {getText('Ready to get started?', '准备开始了吗？')}
          </h3>
          <p className="text-gray-600 mb-6 text-sm sm:text-base">
            {getText('Contact us to learn more about this service.', '联系我们，了解更多关于这项服务的信息。')}
          </p>
          <Link 
            href="/#contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-700 transition shadow-lg shadow-violet-600/20 hover:shadow-violet-600/30"
          >
            {getText('Get in Touch', '联系我们')}
          </Link>
        </div>
      </div>
    </article>
  );
}