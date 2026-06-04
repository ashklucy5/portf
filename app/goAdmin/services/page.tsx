// app/goAdmin/services/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { Save, Loader2, AlertCircle, CheckCircle, Image as ImageIcon, Upload } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

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
interface ServiceItem {
  title: string;
  titleZh: string;
  desc: string;
  descZh: string;
  imageUrl: string;
  blog?: {
    title: string;
    titleZh: string;
    content: string;
    contentZh: string;
    imageUrl: string;
    publishedDate?: string;
    readTime?: string;
  };
}

interface ServicesItems {
  seo: ServiceItem;
  design: ServiceItem;
  marketing: ServiceItem;
  ecommerce: ServiceItem;
  analytics: ServiceItem;
  support: ServiceItem;
}

// ✅ Updated keys to match your CSV database
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
export default function AdminServices() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [editingBlog, setEditingBlog] = useState<keyof ServicesItems | null>(null);
  
  // Header fields
  const [title, setTitle] = useState('');
  const [titleZh, setTitleZh] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [subtitleZh, setSubtitleZh] = useState('');
  
  // Service items
  const [items, setItems] = useState<ServicesItems>({} as ServicesItems);
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);

  // Fetch existing data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch header fields
        const fetchField = async (locale: 'en' | 'zh', key: string) => {
          const { data } = await supabase
            .from('content')
            .select('value')
            .eq('locale', locale)
            .eq('section', 'services')
            .eq('key_path', key)
            .maybeSingle();
          return data?.value || '';
        };
        
        const [t, tZh, st, stZh] = await Promise.all([
          fetchField('en', 'title'),
          fetchField('zh', 'title'),
          fetchField('en', 'subtitle'),
          fetchField('zh', 'subtitle'),
        ]);
        
        setTitle(t);
        setTitleZh(tZh);
        setSubtitle(st);
        setSubtitleZh(stZh);
        
        // Fetch items JSON (stored as single JSON object per locale)
        const { data: itemsData } = await supabase
          .from('content')
          .select('value')
          .eq('locale', 'en')
          .eq('section', 'services')
          .eq('key_path', 'items')
          .maybeSingle();
        
        if (itemsData?.value) {
          try {
            const parsed = JSON.parse(itemsData.value);
            setItems(parsed);
          } catch {
            // Use empty items if parsing fails
          }
        }
      } catch (error) {
        console.error('Failed to fetch services data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Handle image upload for a service item
  const handleImageUpload = async (key: keyof ServicesItems, file: File) => {
    setUploadingImage(key);
    try {
      const url = await uploadToCPanel(file, 'services');
      
      setItems(prev => ({
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

  // Save all changes to Supabase
  const handleSave = async () => {
    setSaving(true);
    setStatus('idle');
    
    try {
      const updates = [
        // Header fields
        { locale: 'en', section: 'services', key_path: 'title', value: title },
        { locale: 'zh', section: 'services', key_path: 'title', value: titleZh },
        { locale: 'en', section: 'services', key_path: 'subtitle', value: subtitle },
        { locale: 'zh', section: 'services', key_path: 'subtitle', value: subtitleZh },
        // Items JSON (stored as single JSON object)
        { locale: 'en', section: 'services', key_path: 'items', value: JSON.stringify(items) },
        { locale: 'zh', section: 'services', key_path: 'items', value: JSON.stringify(items) }
      ];
      
      const { error } = await supabase
        .from('content')
        .upsert(updates, { onConflict: 'locale,section,key_path' });
      
      if (error) throw error;
      
      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (error) {
      console.error('Failed to save services:', error);
      setStatus('error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-65px)] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
        <span className="ml-3 text-gray-600">Loading services...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Services Section</h2>
          <p className="text-sm text-gray-500">Edit service offerings and descriptions</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white font-medium rounded-lg hover:bg-violet-700 disabled:opacity-70 transition"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Status Messages */}
      {status === 'success' && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-700 rounded-lg text-sm">
          <CheckCircle className="w-4 h-4" /> Changes saved successfully!
        </div>
      )}
      {status === 'error' && (
        <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          <AlertCircle className="w-4 h-4" /> Failed to save. Please try again.
        </div>
      )}

      {/* Header Fields */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 space-y-4">
        <h3 className="font-semibold text-gray-900">Section Header</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Title (English)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="Business Services"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Title (Chinese)</label>
            <input
              type="text"
              value={titleZh}
              onChange={(e) => setTitleZh(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="企业服务"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Subtitle (English)</label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="We provide a wide range of digital services..."
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Subtitle (Chinese)</label>
            <input
              type="text"
              value={subtitleZh}
              onChange={(e) => setSubtitleZh(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="我们提供广泛的数字服务..."
            />
          </div>
        </div>
      </div>

      {/* Service Items */}
      <div className="space-y-4">
        {SERVICE_KEYS.map((key) => {
          const item = items[key] || { title: '', titleZh: '', desc: '', descZh: '', imageUrl: '' };
          const labels = SERVICE_LABELS[key];
          
          return (
            <div key={key} className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-900">{labels.en}</h4>
                <span className="text-xs text-gray-500">{labels.zh}</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Image Upload */}
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-700">Service Image</label>
                  <div className="flex items-center gap-3">
                    {item.imageUrl ? (
                      <div className="relative w-20 h-14 rounded-lg overflow-hidden bg-gray-100">
                        <Image
                          src={item.imageUrl}
                          alt={item.title || key}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-14 rounded-lg bg-gray-100 flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
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
                      <div className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium text-gray-700 cursor-pointer transition text-center flex items-center justify-center gap-1">
                        {uploadingImage === key ? (
                          <><Loader2 className="w-3 h-3 animate-spin" /> Uploading...</>
                        ) : (
                          <><Upload className="w-3 h-3" /> {item.imageUrl ? 'Change' : 'Upload'}</>
                        )}
                      </div>
                    </label>
                  </div>
                </div>
                
                {/* Text Fields */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Title (English)</label>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => setItems(prev => ({
                        ...prev,
                        [key]: { ...prev[key], title: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                      placeholder={labels.en}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Title (Chinese)</label>
                    <input
                      type="text"
                      value={item.titleZh}
                      onChange={(e) => setItems(prev => ({
                        ...prev,
                        [key]: { ...prev[key], titleZh: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                      placeholder={labels.zh}
                    />
                  </div>
                </div>
              </div>
              
              {/* Descriptions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Description (English)</label>
                  <textarea
                    value={item.desc}
                    onChange={(e) => setItems(prev => ({
                      ...prev,
                      [key]: { ...prev[key], desc: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 min-h-[80px]"
                    placeholder={`Describe ${labels.en.toLowerCase()}...`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Description (Chinese)</label>
                  <textarea
                    value={item.descZh}
                    onChange={(e) => setItems(prev => ({
                      ...prev,
                      [key]: { ...prev[key], descZh: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 min-h-[80px]"
                    placeholder={`描述${labels.zh}...`}
                  />
                </div>
              </div>

              {/* Blog Post Editor Toggle */}
              <div className="pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingBlog(editingBlog === key ? null : key)}
                  className="text-sm text-violet-600 hover:text-violet-700 font-medium flex items-center gap-1"
                >
                  {editingBlog === key ? '▼ Hide Blog Editor' : '✏️ Edit Blog Post'}
                </button>
              </div>

              {/* Blog Post Editor (collapsible) */}
              {editingBlog === key && (
                <div className="mt-4 p-4 bg-violet-50 rounded-xl space-y-4 border border-violet-100">
                  <h5 className="font-medium text-violet-900">Blog Post Content</h5>
                  
                  {/* Blog Image URL */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Blog Hero Image URL</label>
                    <input
                      type="text"
                      value={item.blog?.imageUrl || ''}
                      onChange={(e) => setItems(prev => ({
                        ...prev,
                        [key]: { 
                          ...prev[key], 
                          blog: { ...prev[key]?.blog, imageUrl: e.target.value } as any 
                        }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="https://..."
                    />
                  </div>
                  
                  {/* Blog Title */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Blog Title (EN)</label>
                      <input
                        type="text"
                        value={item.blog?.title || ''}
                        onChange={(e) => setItems(prev => ({
                          ...prev,
                          [key]: { 
                            ...prev[key], 
                            blog: { ...prev[key]?.blog, title: e.target.value } as any 
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="Blog post title..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Blog Title (ZH)</label>
                      <input
                        type="text"
                        value={item.blog?.titleZh || ''}
                        onChange={(e) => setItems(prev => ({
                          ...prev,
                          [key]: { 
                            ...prev[key], 
                            blog: { ...prev[key]?.blog, titleZh: e.target.value } as any 
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="博客标题..."
                      />
                    </div>
                  </div>
                  
                  {/* Blog Content */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Content (EN)</label>
                      <textarea
                        value={item.blog?.content || ''}
                        onChange={(e) => setItems(prev => ({
                          ...prev,
                          [key]: { 
                            ...prev[key], 
                            blog: { ...prev[key]?.blog, content: e.target.value } as any 
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm min-h-[120px]"
                        placeholder="Write your blog post content... (supports line breaks)"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Content (ZH)</label>
                      <textarea
                        value={item.blog?.contentZh || ''}
                        onChange={(e) => setItems(prev => ({
                          ...prev,
                          [key]: { 
                            ...prev[key], 
                            blog: { ...prev[key]?.blog, contentZh: e.target.value } as any 
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm min-h-[120px]"
                        placeholder="撰写博客内容..."
                      />
                    </div>
                  </div>
                  
                  {/* Meta Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Published Date</label>
                      <input
                        type="text"
                        value={item.blog?.publishedDate || ''}
                        onChange={(e) => setItems(prev => ({
                          ...prev,
                          [key]: { 
                            ...prev[key], 
                            blog: { ...prev[key]?.blog, publishedDate: e.target.value } as any 
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="Apr 2026"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Read Time</label>
                      <input
                        type="text"
                        value={item.blog?.readTime || ''}
                        onChange={(e) => setItems(prev => ({
                          ...prev,
                          [key]: { 
                            ...prev[key], 
                            blog: { ...prev[key]?.blog, readTime: e.target.value } as any 
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="5 min"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}