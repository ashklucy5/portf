// components/BlogPost.tsx
'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import Link from 'next/link';

export interface BlogPostData {
  id: string;
  serviceKey: string; // 'content' | 'china' | etc.
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
    <article className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Back Button */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <button
            onClick={onBack || (() => window.history.back())}
            className="flex items-center gap-2 text-gray-600 hover:text-violet-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Services</span>
          </button>
        </div>
      </div>

      {/* Hero Image */}
      <div className="relative h-64 sm:h-80 lg:h-96 bg-gray-100">
        <Image
          src={post.imageUrl || 'https://placehold.co/1200x600/9333ea/ffffff?text=Service+Image'}
          alt={getText(post.title, post.titleZh)}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />
        
        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
            {getText(post.title, post.titleZh)}
          </h1>
          
          {/* Meta Info */}
          <div className="flex items-center gap-4 mt-3 text-white/80 text-sm">
            {post.publishedDate && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {post.publishedDate}
              </span>
            )}
            {post.readTime && (
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {post.readTime} read
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="prose prose-lg max-w-none"
        >
          <div 
            className="text-gray-700 leading-relaxed whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ 
              __html: getText(post.content, post.contentZh).replace(/\n/g, '<br/>') 
            }}
          />
        </motion.div>

        {/* CTA Section */}
        <div className="mt-12 p-6 bg-violet-50 rounded-2xl border border-violet-100">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {locale === 'zh' ? '准备开始了吗？' : 'Ready to get started?'}
          </h3>
          <p className="text-gray-600 mb-4">
            {locale === 'zh' 
              ? '联系我们，了解更多关于这项服务的信息。' 
              : 'Contact us to learn more about this service.'}
          </p>
          <Link 
            href="/#contact"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white font-medium rounded-xl hover:bg-violet-700 transition"
          >
            {locale === 'zh' ? '联系我们' : 'Get in Touch'}
          </Link>
        </div>
      </div>
    </article>
  );
}