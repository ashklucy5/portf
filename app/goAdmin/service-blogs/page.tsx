// app/goAdmin/service-blogs/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { Save, Loader2, AlertCircle, CheckCircle, Image as ImageIcon, Upload, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import Link from 'next/link';

// ── CPANEL UPLOAD HELPER ──────────────────────────────────────────────
const uploadToCPanel = async (file: File, folder: string): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);
  
  const response = await fetch(process.env.NEXT_PUBLIC_UPLOAD_API_URL || '/uploads/upload.php', {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(error.error || 'Upload failed');
  }
  
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Upload failed');
  }
  
  return result.url;
};

// ── TYPES ───────────────────────────────────────────────────────────────
interface BlogPost {
  title: string;
  titleZh: string;
  content: string;
  contentZh: string;
  imageUrl: string;
  publishedDate: string;
  readTime: string;
}

interface ServiceBlogs {
  seo: BlogPost;
  design: BlogPost;
  marketing: BlogPost;
  ecommerce: BlogPost;
  analytics: BlogPost;
  support: BlogPost;
}

const SERVICE_KEYS = ['seo', 'design', 'marketing', 'ecommerce', 'analytics', 'support'] as const;

const SERVICE_LABELS: Record<string, { en: string; zh: string }> = {
  seo: { en: 'SEO Optimization', zh: 'SEO优化' },
  design: { en: 'UI/UX Design', zh: 'UI/UX设计' },
  marketing: { en: 'Digital Marketing', zh: '数字营销' },
  ecommerce: { en: 'E-Commerce', zh: '电子商务' },
  analytics: { en: 'Analytics', zh: '数据分析' },
  support: { en: '24/7 Support', zh: '全天候支持' },
};

// ── COMPONENT ──────────────────────────────────────────────────────────
export default function ServiceBlogsEditor() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);
  
  // Blog posts state
  const [blogs, setBlogs] = useState<ServiceBlogs>({} as ServiceBlogs);

  // ── Fetch existing blog data from Supabase ───────────────────────────
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const initialBlogs = {} as ServiceBlogs;
        
        for (const key of SERVICE_KEYS) {
          // Fetch English blog
          const { data: enBlog } = await supabase
            .from('content')
            .select('value')
            .eq('locale', 'en')
            .eq('section', 'services')
            .eq('key_path', `items.${key}.blog`)
            .maybeSingle();
          
          // Fetch Chinese blog
          const {data:  zhBlog } = await supabase
            .from('content')
            .select('value')
            .eq('locale', 'zh')
            .eq('section', 'services')
            .eq('key_path', `items.${key}.blog`)
            .maybeSingle();
          
          const enData = enBlog?.value ? JSON.parse(enBlog.value) : {};
          const zhData = zhBlog?.value ? JSON.parse(zhBlog.value) : {};
          
          initialBlogs[key] = {
            title: enData.title || '',
            titleZh: zhData.title || '',
            content: enData.content || '',
            contentZh: zhData.content || '',
            imageUrl: enData.imageUrl || '',
            publishedDate: enData.publishedDate || '',
            readTime: enData.readTime || '',
          };
        }
        
        setBlogs(initialBlogs);
      } catch (error) {
        console.error('Failed to fetch blog ', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBlogs();
  }, []);

  // ── Handle image upload for a blog post ──────────────────────────────
  const handleImageUpload = async (key: keyof ServiceBlogs, file: File) => {
    setUploadingImage(key);
    try {
      const url = await uploadToCPanel(file, 'services');
      
      setBlogs(prev => ({
        ...prev,
        [key]: {
          ...prev[key],
          imageUrl: url
        }
      }));
      
      return true;
    } catch (error) {
      console.error('Image upload failed:', error);
      alert('Failed to upload image');
      return false;
    } finally {
      setUploadingImage(null);
    }
  };

  // ── Save all blog changes to Supabase ────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    setStatus('idle');
    
    try {
      const updates: any[] = [];
      
      for (const key of SERVICE_KEYS) {
        const blog = blogs[key];
        
        // Save English blog
        updates.push({
          locale: 'en',
          section: 'services',
          key_path: `items.${key}.blog`,
          value: JSON.stringify({
            title: blog.title,
            content: blog.content,
            imageUrl: blog.imageUrl,
            publishedDate: blog.publishedDate,
            readTime: blog.readTime,
          }),
          updated_at: new Date().toISOString()
        });
        
        // Save Chinese blog
        updates.push({
          locale: 'zh',
          section: 'services',
          key_path: `items.${key}.blog`,
          value: JSON.stringify({
            title: blog.titleZh,
            content: blog.contentZh,
            imageUrl: blog.imageUrl, // Same image for both languages
            publishedDate: blog.publishedDate,
            readTime: blog.readTime,
          }),
          updated_at: new Date().toISOString()
        });
      }
      
      const { error } = await supabase
        .from('content')
        .upsert(updates, { onConflict: 'locale,section,key_path' });
      
      if (error) throw error;
      
      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (error) {
      console.error('Failed to save blogs:', error);
      setStatus('error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-65px)] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
        <span className="ml-3 text-gray-600">Loading blog posts...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/goAdmin/content"
            className="p-2 text-gray-600 hover:text-violet-600 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Service Blog Posts</h2>
            <p className="text-sm text-gray-500">Edit blog content for all 6 services</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white font-medium rounded-lg hover:bg-violet-700 disabled:opacity-70 transition"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save All Blogs'}
        </button>
      </div>

      {/* Status Messages */}
      {status === 'success' && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-700 rounded-lg text-sm">
          <CheckCircle className="w-4 h-4" /> Blog posts saved successfully!
        </div>
      )}
      {status === 'error' && (
        <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          <AlertCircle className="w-4 h-4" /> Failed to save. Please try again.
        </div>
      )}

      {/* Blog Editors for Each Service */}
      <div className="space-y-6">
        {SERVICE_KEYS.map((key) => {
          const blog = blogs[key];
          const labels = SERVICE_LABELS[key];
          
          return (
            <div key={key} className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
              {/* Service Header */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-violet-500" />
                  {labels.en}
                </h3>
                <span className="text-xs text-gray-500">{labels.zh}</span>
              </div>
              
              {/* Blog Image Upload */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-700 mb-2">Blog Hero Image</label>
                <div className="flex items-center gap-4">
                  <div className="relative w-32 h-20 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                    {blog.imageUrl ? (
                      <Image
                        src={blog.imageUrl}
                        alt={blog.title || key}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <label className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(key, file);
                      }}
                    />
                    <div className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 cursor-pointer transition text-center">
                      {uploadingImage === key ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <Upload className="w-4 h-4" /> {blog.imageUrl ? 'Change Image' : 'Upload Image'}
                        </span>
                      )}
                    </div>
                  </label>
                </div>
              </div>
              
              {/* Blog Titles */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Blog Title (English)</label>
                  <input
                    type="text"
                    value={blog.title}
                    onChange={(e) => setBlogs(prev => ({
                      ...prev,
                      [key]: { ...prev[key], title: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    placeholder={`Title for ${labels.en}`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Blog Title (Chinese)</label>
                  <input
                    type="text"
                    value={blog.titleZh}
                    onChange={(e) => setBlogs(prev => ({
                      ...prev,
                      [key]: { ...prev[key], titleZh: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    placeholder={`${labels.zh}的标题`}
                  />
                </div>
              </div>
              
              {/* Blog Content */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Content (English)</label>
                  <textarea
                    value={blog.content}
                    onChange={(e) => setBlogs(prev => ({
                      ...prev,
                      [key]: { ...prev[key], content: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 min-h-[150px] resize-y"
                    placeholder={`Write content for ${labels.en}... (use line breaks for paragraphs)`}
                  />
                  <p className="text-[10px] text-gray-400 mt-1">💡 Tip: Use blank lines to create paragraphs</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Content (Chinese)</label>
                  <textarea
                    value={blog.contentZh}
                    onChange={(e) => setBlogs(prev => ({
                      ...prev,
                      [key]: { ...prev[key], contentZh: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 min-h-[150px] resize-y"
                    placeholder={`为${labels.zh}撰写内容...（使用空行创建段落）`}
                  />
                  <p className="text-[10px] text-gray-400 mt-1">💡 提示：使用空行创建段落</p>
                </div>
              </div>
              
              {/* Meta Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Published Date</label>
                  <input
                    type="text"
                    value={blog.publishedDate}
                    onChange={(e) => setBlogs(prev => ({
                      ...prev,
                      [key]: { ...prev[key], publishedDate: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    placeholder="Apr 2026"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Read Time</label>
                  <input
                    type="text"
                    value={blog.readTime}
                    onChange={(e) => setBlogs(prev => ({
                      ...prev,
                      [key]: { ...prev[key], readTime: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    placeholder="5 min"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}