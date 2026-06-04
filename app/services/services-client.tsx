// app/services/services-client.tsx
'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import Link from 'next/link';

export default function ServicesClient() {
  const searchParams = useSearchParams();
  const serviceKey = searchParams.get('service');
  const [locale, setLocale] = useState<'en' | 'zh'>('en');
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Detect locale
  useEffect(() => {
    const urlLang = searchParams.get('lang') as 'en' | 'zh';
    if (urlLang === 'en' || urlLang === 'zh') setLocale(urlLang);
  }, [searchParams]);

  // Fetch blog/service data client-side
  useEffect(() => {
    if (!serviceKey) {
      setLoading(false);
      return;
    }

    const fetchServiceData = async () => {
      try {
        const {  data: blogData } = await supabase
          .from('content')
          .select('value')
          .eq('locale', locale)
          .eq('section', 'services')
          .eq('key_path', `items.${serviceKey}.blog`)
          .maybeSingle();

        if (blogData?.value) {
          const parsed = JSON.parse(blogData.value);
          setPost({ ...parsed, serviceKey });
        } else {
          // Fallback if no blog content exists yet
          setPost({
            title: 'Service Details',
            titleZh: '服务详情',
            content: 'Detailed content for this service will be added soon.',
            contentZh: '该服务的详细内容即将添加。',
            imageUrl: '',
            serviceKey,
          });
        }
      } catch (error) {
        console.error('Failed to fetch service data:', error);
        setPost({
          title: 'Service Details',
          titleZh: '服务详情',
          content: 'Content coming soon...',
          contentZh: '内容即将推出...',
          imageUrl: '',
          serviceKey,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchServiceData();
  }, [serviceKey, locale]);

  const getText = (en: string, zh: string) => locale === 'zh' && zh ? zh : en;

  // No service selected
  if (!serviceKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">No service selected</h2>
          <Link href="/#services" className="text-violet-600 hover:underline">
            ← Back to Services
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading post...</div>
      </div>
    );
  }

  return (
    <article className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Back Button */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <Link
            href="/#services"
            className="flex items-center gap-2 text-gray-600 hover:text-violet-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Services</span>
          </Link>
        </div>
      </div>

      {/* Hero Image */}
      <div className="relative h-64 sm:h-80 lg:h-96 bg-gray-100">
        <Image
          src={post.imageUrl || `https://placehold.co/1200x600/9333ea/ffffff?text=${encodeURIComponent(getText(post.title, post.titleZh))}`}
          alt={getText(post.title, post.titleZh)}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
            {getText(post.title, post.titleZh)}
          </h1>
          
          <div className="flex items-center gap-4 mt-3 text-white/80 text-sm">
            {post.publishedDate && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" /> {post.publishedDate}
              </span>
            )}
            {post.readTime && (
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> {post.readTime} read
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        <div 
          className="text-gray-700 leading-relaxed whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ 
            __html: getText(post.content, post.contentZh).replace(/\n/g, '<br/>') 
          }}
        />

        {/* CTA */}
        <div className="mt-12 p-6 bg-violet-50 rounded-2xl border border-violet-100">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {getText('Ready to get started?', '准备开始了吗？')}
          </h3>
          <p className="text-gray-600 mb-4">
            {getText('Contact us to learn more about this service.', '联系我们，了解更多关于这项服务的信息。')}
          </p>
          <Link 
            href="/#contact"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white font-medium rounded-xl hover:bg-violet-700 transition"
          >
            {getText('Get in Touch', '联系我们')}
          </Link>
        </div>
      </div>
    </article>
  );
}