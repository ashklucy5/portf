// app/goAdmin/media/page.tsx
'use client';
import { useState, useEffect, useCallback } from 'react';
import {
  Save, RotateCcw, CheckCircle, AlertCircle, Image as ImageIcon, Video,
  Upload, Loader2, X, Trash2, Layout, Users, Info
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

// ── TYPES ───────────────────────────────────────────────────────────────
type SectionType = 'hero' | 'about' | 'team' | 'carousel-images' | 'carousel-videos' | 'collaborations';

interface ImageSlot {
  id: string;
  file: File | null;
  preview: string | null;
  ossUrl: string | null;
  title: string;
  titleZh: string;
  status: 'empty' | 'pending' | 'uploading' | 'uploaded';
}

interface TeamMember {
  id: string;
  name: string;
  nameZh: string;
  file: File | null;
  preview: string | null;
  ossUrl: string | null;
  status: 'empty' | 'pending' | 'uploading' | 'uploaded';
}

interface VideoSlot {
  id: string;
  thumbnailFile: File | null;
  thumbnailPreview: string | null;
  thumbnailOssUrl: string | null;
  thumbnailStatus: 'empty' | 'pending' | 'uploading' | 'uploaded';
  videoUrl: string;
  title: string;
  titleZh: string;
  desc: string;
  descZh: string;
}

interface CollaborationSlot {
  id: string;
  file: File | null;
  preview: string | null;
  ossUrl: string | null;
  title: string;
  titleZh: string;
  description: string;
  descriptionZh: string;
  location: string;
  locationZh: string;
  status: 'empty' | 'pending' | 'uploading' | 'uploaded';
}

// Section config
const SECTIONS: { id: SectionType; label: string; icon: any; description: string }[] = [
  { id: 'hero', label: 'Hero Section', icon: Layout, description: 'Main hero background image' },
  { id: 'about', label: 'About Section', icon: Info, description: 'About page background image' },
  { id: 'team', label: 'Team Section', icon: Users, description: '4 team member avatars' },
  { id: 'collaborations', label: 'Collaborations', icon: Users, description: '4 collaboration photos with bilingual text' },
  { id: 'carousel-images', label: 'Carousel Images', icon: ImageIcon, description: '6 showcase project images' },
  { id: 'carousel-videos', label: 'Carousel Videos', icon: Video, description: '9 case study videos with thumbnails' },
];

// ── HELPERS ───────────────────────────────────────────────────────────────
const emptyImageSlot = (prefix: string, index?: number): ImageSlot => ({
  id: index ? `${prefix}-${index}` : prefix,
  file: null, preview: null, ossUrl: null, title: '', titleZh: '', status: 'empty'
});

const emptyTeamMember = (index: number): TeamMember => ({
  id: `team-${index}`,
  name: '', nameZh: '', file: null, preview: null, ossUrl: null, status: 'empty'
});

const emptyVideoSlot = (index: number): VideoSlot => ({
  id: `carousel-vid-${index}`,
  thumbnailFile: null, thumbnailPreview: null, thumbnailOssUrl: null,
  thumbnailStatus: 'empty', videoUrl: '', title: '', titleZh: '', desc: '', descZh: ''
});

const emptyCollaborationSlot = (index: number): CollaborationSlot => ({
  id: `collab-${index}`,
  file: null, preview: null, ossUrl: null,
  title: '', titleZh: '', description: '', descriptionZh: '', location: '', locationZh: '',
  status: 'empty'
});

// ── CPANEL UPLOAD CONFIG ──────────────────────────────────────
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

// ── COMPONENT ─────────────────────────────────────────────────────────────
export default function MediaLibrary() {
  const [activeSection, setActiveSection] = useState<SectionType>('hero');
  
  // Section state
  const [hero, setHero] = useState<ImageSlot>(emptyImageSlot('hero'));
  const [about, setAbout] = useState<ImageSlot>(emptyImageSlot('about'));
  const [team, setTeam] = useState<TeamMember[]>(Array.from({ length: 4 }, (_, i) => emptyTeamMember(i + 1)));
  const [collaborations, setCollaborations] = useState<CollaborationSlot[]>(
    Array.from({ length: 4 }, (_, i) => emptyCollaborationSlot(i + 1))
  );
  const [carouselImages, setCarouselImages] = useState<ImageSlot[]>(
    Array.from({ length: 6 }, (_, i) => emptyImageSlot('carousel-img', i + 1))
  );
  const [carouselVideos, setCarouselVideos] = useState<VideoSlot[]>(
    Array.from({ length: 9 }, (_, i) => emptyVideoSlot(i + 1))
  );
  
  const [saving, setSaving] = useState(false);
  const [globalStatus, setGlobalStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [loading, setLoading] = useState(true);

  // ── FETCH MEDIA FROM SUPABASE ─────────────────────────────────────────
  const fetchMediaFromSupabase = useCallback(async () => {
    try {
      const sections = ['hero', 'about', 'team', 'collaborations', 'carousel-images', 'carousel-videos'];
      
      const responses = await Promise.all(
        sections.map(section => 
          supabase
            .from('content')
            .select('key_path, value')
            .eq('locale', 'en')
            .eq('section', section)
        )
      );

      const transformResponse = (response: any) => {
        const rows = response.data || [];
        const result: Record<string, any> = {};
        
        for (const row of rows) {
          const keys = row.key_path.split('.');
          let target = result;
          for (let i = 0; i < keys.length - 1; i++) {
            target[keys[i]] = target[keys[i]] || {};
            target = target[keys[i]];
          }
          target[keys[keys.length - 1]] = row.value;
        }
        return result;
      };

      const [heroData, aboutData, teamData, collabData, carouselImgData, carouselVidData] = 
        responses.map(transformResponse);

      // Populate sections
      if (heroData.heroImage) {
        setHero({
          ...emptyImageSlot('hero'),
          ossUrl: heroData.heroImage,
          preview: heroData.heroImage,
          title: heroData.tagline || '',
          titleZh: heroData.taglineZh || '',
          status: 'uploaded'
        });
      }
      if (aboutData.aboutImage) {
        setAbout({
          ...emptyImageSlot('about'),
          ossUrl: aboutData.aboutImage,
          preview: aboutData.aboutImage,
          title: aboutData.title || '',
          titleZh: aboutData.titleZh || '',
          status: 'uploaded'
        });
      }
      if (teamData.members) {
        setTeam(Object.entries(teamData.members).map(([role, name]: [string, any], index) => ({
          ...emptyTeamMember(index + 1),
          name: typeof name === 'string' ? name : '',
          nameZh: teamData[`members.${role}Zh`] || '',
          ossUrl: teamData[`memberImage.${role}`] || null,
          preview: teamData[`memberImage.${role}`] || null,
          status: teamData[`memberImage.${role}`] ? 'uploaded' : 'empty'
        })));
      }
      if (collabData.items) {
        setCollaborations(Object.entries(collabData.items).map(([key, item]: [string, any], index) => ({
          ...emptyCollaborationSlot(index + 1),
          ossUrl: typeof item === 'string' ? item : (item.imageUrl || null),
          preview: typeof item === 'string' ? item : (item.imageUrl || null),
          title: typeof item === 'object' ? item.title : '',
          titleZh: typeof item === 'object' ? item.titleZh : '',
          description: typeof item === 'object' ? item.description : '',
          descriptionZh: typeof item === 'object' ? item.descriptionZh : '',
          location: typeof item === 'object' ? item.location : '',
          locationZh: typeof item === 'object' ? item.locationZh : '',
          status: (typeof item === 'string' ? item : item?.imageUrl) ? 'uploaded' : 'empty'
        })));
      }
      if (carouselImgData.items) {
        setCarouselImages(Object.entries(carouselImgData.items).map(([key, item]: [string, any], index) => ({
          ...emptyImageSlot('carousel-img', index + 1),
          ossUrl: typeof item === 'string' ? item : (item.url || null),
          preview: typeof item === 'string' ? item : (item.url || null),
          title: typeof item === 'object' ? item.title : '',
          titleZh: typeof item === 'object' ? item.titleZh : '',
          status: (typeof item === 'string' ? item : item?.url) ? 'uploaded' : 'empty'
        })));
      }
      if (carouselVidData.items) {
        setCarouselVideos(Object.entries(carouselVidData.items).map(([key, item]: [string, any], index) => ({
          ...emptyVideoSlot(index + 1),
          thumbnailOssUrl: item?.thumbnailUrl || null,
          thumbnailPreview: item?.thumbnailUrl || null,
          thumbnailStatus: item?.thumbnailUrl ? 'uploaded' : 'empty',
          videoUrl: item?.videoUrl || '',
          title: item?.title || '',
          titleZh: item?.titleZh || '',
          desc: item?.desc || '',
          descZh: item?.descZh || ''
        })));
      }

    } catch (error) {
      console.error('Failed to fetch media from Supabase:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMediaFromSupabase();
  }, [fetchMediaFromSupabase]);

  // ── SAVE MEDIA METADATA TO SUPABASE ───────────────────────────────────
  const saveMediaToSupabase = async (updates: Record<string, any>) => {
    const rowsToUpsert = Object.entries(updates).map(([key_path, value]) => ({
      locale: 'en',
      section: activeSection,
      key_path,
      value: typeof value === 'object' ? JSON.stringify(value) : String(value),
      updated_at: new Date().toISOString()
    }));

    const { error } = await supabase
      .from('content')
      .upsert(rowsToUpsert, {
        onConflict: 'locale,section,key_path'
      });

    if (error) throw error;
    return { success: true };
  };

  // ── HERO SECTION HANDLERS ─────────────────────────────────────────────
  const handleHeroSelect = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    if (hero.preview && hero.preview !== hero.ossUrl) {
      URL.revokeObjectURL(hero.preview);
    }
    setHero({ ...hero, file, preview: URL.createObjectURL(file), ossUrl: null, status: 'pending' });
  };

  const uploadHeroToOSS = async () => {
  if (!hero.file) return;
  setHero(prev => ({ ...prev, status: 'uploading' }));
  
  try {
    const ossUrl = await uploadToCPanel(hero.file!, 'hero');
    setHero(prev => ({ ...prev, ossUrl, preview: ossUrl, status: 'uploaded' }));
    
    // ✅ Save to BOTH English and Chinese
    await supabase.from('content').upsert([
      {
        locale: 'en',
        section: 'hero',
        key_path: 'heroImage',
        value: ossUrl,
        updated_at: new Date().toISOString()
      },
      {
        locale: 'zh',
        section: 'hero',
        key_path: 'heroImage',
        value: ossUrl,  // ✅ Same image URL for both
        updated_at: new Date().toISOString()
      }
    ], {
      onConflict: 'locale,section,key_path'
    });
    
  } catch (error) {
    console.error('Hero upload failed:', error);
    setHero(prev => ({ ...prev, status: 'pending' }));
    throw error;
  }
};

  const clearHero = () => {
    if (hero.preview && hero.preview !== hero.ossUrl) {
      URL.revokeObjectURL(hero.preview);
    }
    setHero({ ...emptyImageSlot('hero') });
    saveMediaToSupabase({ heroImage: '', tagline: '', taglineZh: '' });
  };

  // ── ABOUT SECTION HANDLERS ────────────────────────────────────────────
  const handleAboutSelect = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    if (about.preview && about.preview !== about.ossUrl) {
      URL.revokeObjectURL(about.preview);
    }
    setAbout({ ...about, file, preview: URL.createObjectURL(file), ossUrl: null, status: 'pending' });
  };

  const uploadAboutToOSS = async () => {
  if (!about.file) return;
  setAbout(prev => ({ ...prev, status: 'uploading' }));
  
  try {
    const ossUrl = await uploadToCPanel(about.file!, 'about');
    setAbout(prev => ({ ...prev, ossUrl, preview: ossUrl, status: 'uploaded' }));
    
    // ✅ Save to BOTH English and Chinese
    await supabase.from('content').upsert([
      {
        locale: 'en',
        section: 'about',
        key_path: 'aboutImage',
        value: ossUrl,
        updated_at: new Date().toISOString()
      },
      {
        locale: 'zh',
        section: 'about',
        key_path: 'aboutImage',
        value: ossUrl,  // ✅ Same image URL for both
        updated_at: new Date().toISOString()
      }
    ], {
      onConflict: 'locale,section,key_path'
    });
    
  } catch (error) {
    console.error('About upload failed:', error);
    setAbout(prev => ({ ...prev, status: 'pending' }));
    throw error;
  }
};

  const clearAbout = () => {
    if (about.preview && about.preview !== about.ossUrl) {
      URL.revokeObjectURL(about.preview);
    }
    setAbout({ ...emptyImageSlot('about') });
    saveMediaToSupabase({ aboutImage: '', title: '', titleZh: '' });
  };

  // ── TEAM SECTION HANDLERS ─────────────────────────────────────────────
  const handleTeamImageSelect = (index: number, file: File) => {
    if (!file.type.startsWith('image/')) return;
    setTeam(prev => {
      const next = [...prev];
      if (next[index].preview && next[index].preview !== next[index].ossUrl) {
        URL.revokeObjectURL(next[index].preview!);
      }
      next[index] = { 
        ...next[index], 
        file, 
        preview: URL.createObjectURL(file), 
        ossUrl: null, 
        status: 'pending' 
      };
      return next;
    });
  };

  const uploadTeamImageToOSS = async (index: number) => {
    const member = team[index];
    if (!member.file) return;
    
    setTeam(prev => {
      const next = [...prev];
      next[index] = { ...next[index], status: 'uploading' };
      return next;
    });

    try {
      const role = ['CEO', 'CTO', 'Designer', 'DevLead'][index] || `member${index + 1}`;
      const ossUrl = await uploadToCPanel(member.file!, 'team');
      
      setTeam(prev => {
        const next = [...prev];
        next[index] = { ...next[index], ossUrl, preview: ossUrl, status: 'uploaded' };
        return next;
      });
      
      await saveMediaToSupabase({ 
        [`members.${role}`]: member.name,
        [`members.${role}Zh`]: member.nameZh,
        [`memberImage.${role}`]: ossUrl 
      });
    } catch (error) {
      console.error('Team upload failed:', error);
      setTeam(prev => {
        const next = [...prev];
        next[index] = { ...next[index], status: 'pending' };
        return next;
      });
      throw error;
    }
  };

  const clearTeamMember = (index: number) => {
    setTeam(prev => {
      const next = [...prev];
      if (next[index].preview && next[index].preview !== next[index].ossUrl) {
        URL.revokeObjectURL(next[index].preview!);
      }
      next[index] = emptyTeamMember(index + 1);
      return next;
    });
    const role = ['CEO', 'CTO', 'Designer', 'DevLead'][index] || `member${index + 1}`;
    saveMediaToSupabase({ 
      [`members.${role}`]: '', 
      [`members.${role}Zh`]: '', 
      [`memberImage.${role}`]: '' 
    });
  };

  // ── COLLABORATIONS SECTION HANDLERS ───────────────────────────────────
  const handleCollaborationSelect = (index: number, file: File) => {
    if (!file.type.startsWith('image/')) return;
    setCollaborations(prev => {
      const next = [...prev];
      if (next[index].preview && next[index].preview !== next[index].ossUrl) {
        URL.revokeObjectURL(next[index].preview!);
      }
      next[index] = { 
        ...next[index], 
        file, 
        preview: URL.createObjectURL(file), 
        ossUrl: null, 
        status: 'pending' 
      };
      return next;
    });
  };

  const uploadCollaborationToOSS = async (index: number) => {
    const item = collaborations[index];
    if (!item.file) return;
    
    setCollaborations(prev => {
      const next = [...prev];
      next[index] = { ...next[index], status: 'uploading' };
      return next;
    });

    try {
      const ossUrl = await uploadToCPanel(item.file!, 'collaborations');
      
      setCollaborations(prev => {
        const next = [...prev];
        next[index] = { ...next[index], ossUrl, preview: ossUrl, status: 'uploaded' };
        return next;
      });
      
      await saveMediaToSupabase({ 
        [`items.${index + 1}`]: {
          imageUrl: ossUrl,
          title: item.title,
          titleZh: item.titleZh,
          description: item.description,
          descriptionZh: item.descriptionZh,
          location: item.location,
          locationZh: item.locationZh
        }
      });
    } catch (error) {
      console.error('Collaboration upload failed:', error);
      setCollaborations(prev => {
        const next = [...prev];
        next[index] = { ...next[index], status: 'pending' };
        return next;
      });
      throw error;
    }
  };

  const clearCollaboration = (index: number) => {
    setCollaborations(prev => {
      const next = [...prev];
      if (next[index].preview && next[index].preview !== next[index].ossUrl) {
        URL.revokeObjectURL(next[index].preview!);
      }
      next[index] = emptyCollaborationSlot(index + 1);
      return next;
    });
    saveMediaToSupabase({ [`items.${index + 1}`]: '' });
  };

  // ── CAROUSEL IMAGE HANDLERS ───────────────────────────────────────────
  const handleCarouselImageSelect = (index: number, file: File) => {
    if (!file.type.startsWith('image/')) return;
    setCarouselImages(prev => {
      const next = [...prev];
      if (next[index].preview && next[index].preview !== next[index].ossUrl) {
        URL.revokeObjectURL(next[index].preview!);
      }
      next[index] = { 
        ...next[index], 
        file, 
        preview: URL.createObjectURL(file), 
        ossUrl: null, 
        status: 'pending' 
      };
      return next;
    });
  };

  const uploadCarouselImageToOSS = async (index: number) => {
    const item = carouselImages[index];
    if (!item.file) return;
    
    setCarouselImages(prev => {
      const next = [...prev];
      next[index] = { ...next[index], status: 'uploading' };
      return next;
    });

    try {
      const ossUrl = await uploadToCPanel(item.file!, 'carousel');
      
      setCarouselImages(prev => {
        const next = [...prev];
        next[index] = { ...next[index], ossUrl, preview: ossUrl, status: 'uploaded' };
        return next;
      });
      
      await saveMediaToSupabase({ 
        [`items.${index + 1}`]: { 
          url: ossUrl, 
          title: item.title,
          titleZh: item.titleZh
        } 
      });
    } catch (error) {
      console.error('Carousel image upload failed:', error);
      setCarouselImages(prev => {
        const next = [...prev];
        next[index] = { ...next[index], status: 'pending' };
        return next;
      });
      throw error;
    }
  };

  const clearCarouselImage = (index: number) => {
    setCarouselImages(prev => {
      const next = [...prev];
      if (next[index].preview && next[index].preview !== next[index].ossUrl) {
        URL.revokeObjectURL(next[index].preview!);
      }
      next[index] = emptyImageSlot('carousel-img', index + 1);
      return next;
    });
    saveMediaToSupabase({ [`items.${index + 1}`]: '' });
  };

  // ── CAROUSEL VIDEO HANDLERS ───────────────────────────────────────────
  const handleThumbnailSelect = (index: number, file: File) => {
    if (!file.type.startsWith('image/')) return;
    setCarouselVideos(prev => {
      const next = [...prev];
      if (next[index].thumbnailPreview && next[index].thumbnailPreview !== next[index].thumbnailOssUrl) {
        URL.revokeObjectURL(next[index].thumbnailPreview!);
      }
      next[index] = {
        ...next[index],
        thumbnailFile: file,
        thumbnailPreview: URL.createObjectURL(file),
        thumbnailOssUrl: null,
        thumbnailStatus: 'pending'
      };
      return next;
    });
  };

  const uploadThumbnailToOSS = async (index: number) => {
    const slot = carouselVideos[index];
    if (!slot.thumbnailFile) return;
    
    setCarouselVideos(prev => {
      const next = [...prev];
      next[index] = { ...next[index], thumbnailStatus: 'uploading' };
      return next;
    });

    try {
      const ossUrl = await uploadToCPanel(slot.thumbnailFile!, 'carousel');
      
      setCarouselVideos(prev => {
        const next = [...prev];
        next[index] = { 
          ...next[index], 
          thumbnailOssUrl: ossUrl, 
          thumbnailPreview: ossUrl, 
          thumbnailStatus: 'uploaded' 
        };
        return next;
      });
      
      await saveMediaToSupabase({ 
        [`items.${index + 1}`]: {
          thumbnailUrl: ossUrl,
          videoUrl: slot.videoUrl,
          title: slot.title,
          titleZh: slot.titleZh,
          desc: slot.desc,
          descZh: slot.descZh
        }
      });
    } catch (error) {
      console.error('Thumbnail upload failed:', error);
      setCarouselVideos(prev => {
        const next = [...prev];
        next[index] = { ...next[index], thumbnailStatus: 'pending' };
        return next;
      });
      throw error;
    }
  };

  const clearThumbnail = (index: number) => {
    setCarouselVideos(prev => {
      const next = [...prev];
      if (next[index].thumbnailPreview && next[index].thumbnailPreview !== next[index].thumbnailOssUrl) {
        URL.revokeObjectURL(next[index].thumbnailPreview!);
      }
      next[index] = {
        ...next[index],
        thumbnailFile: null, 
        thumbnailPreview: null, 
        thumbnailOssUrl: null, 
        thumbnailStatus: 'empty'
      };
      return next;
    });
  };

  const updateVideoField = (index: number, field: 'videoUrl' | 'title' | 'titleZh' | 'desc' | 'descZh', value: string) => {
    setCarouselVideos(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
    const slot = carouselVideos[index];
    saveMediaToSupabase({ 
      [`items.${index + 1}`]: {
        thumbnailUrl: slot.thumbnailOssUrl,
        videoUrl: slot.videoUrl,
        title: slot.title,
        titleZh: slot.titleZh,
        desc: slot.desc,
        descZh: slot.descZh
      }
    });
  };

  // ── GLOBAL SAVE ───────────────────────────────────────────────────────
  const handleSaveAll = async () => {
    setSaving(true);
    setGlobalStatus('idle');

    try {
      const uploads: Promise<void>[] = [];
      
      if (hero.status === 'pending') uploads.push(uploadHeroToOSS());
      if (about.status === 'pending') uploads.push(uploadAboutToOSS());
      
      team.forEach((member, i) => {
        if (member.status === 'pending') uploads.push(uploadTeamImageToOSS(i));
      });
      
      collaborations.forEach((item, i) => {
        if (item.status === 'pending') uploads.push(uploadCollaborationToOSS(i));
      });
      
      carouselImages.forEach((item, i) => {
        if (item.status === 'pending') uploads.push(uploadCarouselImageToOSS(i));
      });
      
      carouselVideos.forEach((slot, i) => {
        if (slot.thumbnailStatus === 'pending') uploads.push(uploadThumbnailToOSS(i));
      });

      await Promise.all(uploads);
      setGlobalStatus('success');
      setTimeout(() => setGlobalStatus('idle'), 3000);
      
    } catch (error) {
      console.error('Save failed', error);
      setGlobalStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const handleResetAll = () => {
    [hero, about].forEach(slot => { 
      if (slot.preview && slot.preview !== slot.ossUrl) URL.revokeObjectURL(slot.preview); 
    });
    team.forEach(m => { 
      if (m.preview && m.preview !== m.ossUrl) URL.revokeObjectURL(m.preview); 
    });
    collaborations.forEach(c => { 
      if (c.preview && c.preview !== c.ossUrl) URL.revokeObjectURL(c.preview); 
    });
    carouselImages.forEach(img => { 
      if (img.preview && img.preview !== img.ossUrl) URL.revokeObjectURL(img.preview); 
    });
    carouselVideos.forEach(vid => { 
      if (vid.thumbnailPreview && vid.thumbnailPreview !== vid.thumbnailOssUrl) {
        URL.revokeObjectURL(vid.thumbnailPreview);
      }
    });
    
    setHero(emptyImageSlot('hero'));
    setAbout(emptyImageSlot('about'));
    setTeam(Array.from({ length: 4 }, (_, i) => emptyTeamMember(i + 1)));
    setCollaborations(Array.from({ length: 4 }, (_, i) => emptyCollaborationSlot(i + 1)));
    setCarouselImages(Array.from({ length: 6 }, (_, i) => emptyImageSlot('carousel-img', i + 1)));
    setCarouselVideos(Array.from({ length: 9 }, (_, i) => emptyVideoSlot(i + 1)));
    setGlobalStatus('idle');
  };

  // ── RENDER: Image Slot Component ──────────────────────────────────────
  const renderImageSlot = (
    slot: ImageSlot,
    onSelect: (file: File) => void,
    onUpload: () => Promise<void>,
    onClear: () => void,
    label: string
  ) => (
    <div className="space-y-3">
      {slot.status === 'uploading' && (
        <div className="flex items-center gap-4 p-3 bg-violet-50 border border-violet-200 rounded-xl">
          <img src={slot.preview!} alt="Uploading" className="w-16 h-16 rounded-lg object-cover shrink-0 opacity-60" />
          <div className="flex-1">
            <p className="text-sm font-medium text-violet-700">Uploading to cPanel…</p>
            <div className="mt-2 h-1.5 bg-violet-200 rounded-full overflow-hidden">
              <div className="h-full bg-violet-500 rounded-full animate-pulse w-3/4" />
            </div>
          </div>
          <Loader2 className="w-5 h-5 text-violet-500 animate-spin shrink-0" />
        </div>
      )}

      {slot.status === 'uploaded' && (
        <div className="flex items-center gap-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
          <img src={slot.preview!} alt="Uploaded" className="w-16 h-16 rounded-lg object-cover shrink-0 border border-emerald-200" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{slot.file?.name || 'Uploaded image'}</p>
            <p className="text-xs text-emerald-600 flex items-center gap-1 mt-0.5">
              <CheckCircle className="w-3 h-3" /> Hosted on cPanel
            </p>
            <p className="text-[11px] text-gray-400 truncate">{slot.ossUrl}</p>
          </div>
          <button onClick={onClear} className="p-2 text-gray-400 hover:text-red-500 transition shrink-0" title="Remove">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {slot.status !== 'uploaded' && slot.status !== 'uploading' && (
        !slot.file ? (
          <label className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-violet-400 hover:bg-violet-50 transition group">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => {
                const f = e.target.files?.[0];
                if (f) { onSelect(f); e.target.value = ''; }
              }}
            />
            <Upload className="w-6 h-6 text-gray-400 group-hover:text-violet-500 mb-2" />
            <span className="text-sm text-gray-500 group-hover:text-violet-600 font-medium">Click to upload {label}</span>
            <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB</p>
          </label>
        ) : (
          <div className="flex items-center gap-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <img src={slot.preview!} alt="Preview" className="w-16 h-16 rounded-lg object-cover shrink-0 border border-amber-200" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{slot.file?.name}</p>
              <p className="text-xs text-gray-500">{((slot.file?.size ?? 0) / 1024 / 1024).toFixed(2)} MB</p>
              <p className="text-xs text-amber-600 mt-0.5">Ready to upload to cPanel</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={onClear} className="p-2 text-gray-400 hover:text-red-500 transition" title="Remove">
                <X className="w-4 h-4" />
              </button>
              <button
                onClick={onUpload}
                className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 transition"
              >
                <Upload className="w-4 h-4" />
                Upload
              </button>
            </div>
          </div>
        )
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          type="text"
          value={slot.title || ''}
          onChange={e => {
            if (activeSection === 'hero') setHero({ ...hero, title: e.target.value });
            else if (activeSection === 'about') setAbout({ ...about, title: e.target.value });
          }}
          placeholder="Title (English)"
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm placeholder-gray-400"
        />
        <input
          type="text"
          value={slot.titleZh || ''}
          onChange={e => {
            if (activeSection === 'hero') setHero({ ...hero, titleZh: e.target.value });
            else if (activeSection === 'about') setAbout({ ...about, titleZh: e.target.value });
          }}
          placeholder="标题 (中文)"
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm placeholder-gray-400"
        />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-65px)] items-center justify-center bg-gray-50">
        <div className="flex items-center gap-3 text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading media from Supabase...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-65px)]">
      <div className="w-64 border-r border-gray-200 bg-white p-4 space-y-1 overflow-y-auto shrink-0">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-3">Media Sections</h3>
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all text-left ${
                isActive
                  ? 'bg-violet-50 text-violet-700 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-violet-600' : 'text-gray-400'}`} />
              <div className="flex-1 min-w-0">
                <p className="truncate">{section.label}</p>
                <p className="text-[10px] text-gray-400 truncate">{section.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {SECTIONS.find(s => s.id === activeSection)?.label}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {SECTIONS.find(s => s.id === activeSection)?.description}
            </p>
          </div>
          {globalStatus === 'success' && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium">
              <CheckCircle className="w-4 h-4" /> Saved to Supabase + cPanel
            </div>
          )}
          {globalStatus === 'error' && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-700 rounded-full text-sm font-medium">
              <AlertCircle className="w-4 h-4" /> Save failed
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {activeSection === 'hero' && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Hero Background Image</h3>
                {renderImageSlot(hero, handleHeroSelect, uploadHeroToOSS, clearHero, 'hero image')}
              </div>
            )}
            {activeSection === 'about' && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">About Section Image</h3>
                {renderImageSlot(about, handleAboutSelect, uploadAboutToOSS, clearAbout, 'about image')}
              </div>
            )}
            {activeSection === 'team' && (
              <div className="space-y-4">
                {team.map((member, index) => (
                  <div key={member.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
                    <div className="flex items-start gap-4">
                      <div className="shrink-0 w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center text-violet-700 font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input
                            type="text"
                            value={member.name}
                            onChange={e => setTeam(prev => {
                              const next = [...prev];
                              next[index] = { ...next[index], name: e.target.value };
                              return next;
                            })}
                            placeholder="Name (English)"
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
                          />
                          <input
                            type="text"
                            value={member.nameZh}
                            onChange={e => setTeam(prev => {
                              const next = [...prev];
                              next[index] = { ...next[index], nameZh: e.target.value };
                              return next;
                            })}
                            placeholder="姓名 (中文)"
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
                          />
                        </div>
                        {member.status !== 'uploaded' ? (
                          !member.file ? (
                            <label className="flex flex-col items-center justify-center py-4 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-violet-400 hover:bg-violet-50 transition group">
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={e => {
                                  const f = e.target.files?.[0];
                                  if (f) { handleTeamImageSelect(index, f); e.target.value = ''; }
                                }}
                              />
                              <Upload className="w-5 h-5 text-gray-400 group-hover:text-violet-500 mb-1" />
                              <span className="text-sm text-gray-500 group-hover:text-violet-600">Upload avatar</span>
                            </label>
                          ) : (
                            <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                              <img src={member.preview!} alt="Preview" className="w-12 h-12 rounded-full object-cover border border-amber-200 shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{member.file?.name}</p>
                                <p className="text-xs text-amber-600">Ready to upload</p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <button onClick={() => clearTeamMember(index)} className="p-1.5 text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                                <button
                                  onClick={() => uploadTeamImageToOSS(index)}
                                  disabled={member.status === 'uploading'}
                                  className="px-3 py-1.5 bg-violet-600 text-white text-xs font-medium rounded-lg hover:bg-violet-700 disabled:opacity-50 flex items-center gap-1.5"
                                >
                                  {member.status === 'uploading' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                                  {member.status === 'uploading' ? 'Uploading...' : 'Upload'}
                                </button>
                              </div>
                            </div>
                          )
                        ) : (
                          <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                            <img src={member.preview!} alt="Uploaded" className="w-12 h-12 rounded-full object-cover border border-emerald-200 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-emerald-600 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" /> Avatar on cPanel
                              </p>
                              <p className="text-[11px] text-gray-400 truncate">{member.ossUrl}</p>
                            </div>
                            <button onClick={() => clearTeamMember(index)} className="p-1.5 text-gray-400 hover:text-red-500 shrink-0" title="Remove">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {activeSection === 'collaborations' && (
              <div className="space-y-4">
                {collaborations.map((item, index) => (
                  <div key={item.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
                    <div className="flex items-start gap-4">
                      <div className="shrink-0 w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center text-violet-700 font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1 space-y-3">
                        {item.status !== 'uploaded' ? (
                          !item.file ? (
                            <label className="flex flex-col items-center justify-center py-4 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-violet-400 hover:bg-violet-50 transition group">
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={e => {
                                  const f = e.target.files?.[0];
                                  if (f) { handleCollaborationSelect(index, f); e.target.value = ''; }
                                }}
                              />
                              <Upload className="w-5 h-5 text-gray-400 group-hover:text-violet-500 mb-1" />
                              <span className="text-sm text-gray-500 group-hover:text-violet-600">Upload collaboration photo</span>
                            </label>
                          ) : (
                            <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                              <img src={item.preview!} alt="Preview" className="w-12 h-12 rounded-lg object-cover border border-amber-200 shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{item.file?.name}</p>
                                <p className="text-xs text-amber-600">Ready to upload</p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <button onClick={() => clearCollaboration(index)} className="p-1.5 text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                                <button
                                  onClick={() => uploadCollaborationToOSS(index)}
                                  disabled={item.status === 'uploading'}
                                  className="px-3 py-1.5 bg-violet-600 text-white text-xs font-medium rounded-lg hover:bg-violet-700 disabled:opacity-50 flex items-center gap-1.5"
                                >
                                  {item.status === 'uploading' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                                  {item.status === 'uploading' ? 'Uploading...' : 'Upload'}
                                </button>
                              </div>
                            </div>
                          )
                        ) : (
                          <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                            <img src={item.preview!} alt="Uploaded" className="w-12 h-12 rounded-lg object-cover border border-emerald-200 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-emerald-600 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" /> Image on cPanel
                              </p>
                              <p className="text-[11px] text-gray-400 truncate">{item.ossUrl}</p>
                            </div>
                            <button onClick={() => clearCollaboration(index)} className="p-1.5 text-gray-400 hover:text-red-500 shrink-0" title="Remove">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input
                            type="text"
                            value={item.title || ''}
                            onChange={e => setCollaborations(prev => {
                              const next = [...prev];
                              next[index] = { ...next[index], title: e.target.value };
                              return next;
                            })}
                            placeholder="Title (English)"
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm placeholder-gray-400"
                          />
                          <input
                            type="text"
                            value={item.titleZh || ''}
                            onChange={e => setCollaborations(prev => {
                              const next = [...prev];
                              next[index] = { ...next[index], titleZh: e.target.value };
                              return next;
                            })}
                            placeholder="标题 (中文)"
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm placeholder-gray-400"
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <textarea
                            value={item.description || ''}
                            onChange={e => setCollaborations(prev => {
                              const next = [...prev];
                              next[index] = { ...next[index], description: e.target.value };
                              return next;
                            })}
                            placeholder="Description (English)"
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm placeholder-gray-400 resize-none"
                            rows={2}
                          />
                          <textarea
                            value={item.descriptionZh || ''}
                            onChange={e => setCollaborations(prev => {
                              const next = [...prev];
                              next[index] = { ...next[index], descriptionZh: e.target.value };
                              return next;
                            })}
                            placeholder="描述 (中文)"
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm placeholder-gray-400 resize-none"
                            rows={2}
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input
                            type="text"
                            value={item.location || ''}
                            onChange={e => setCollaborations(prev => {
                              const next = [...prev];
                              next[index] = { ...next[index], location: e.target.value };
                              return next;
                            })}
                            placeholder="Location (English)"
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm placeholder-gray-400"
                          />
                          <input
                            type="text"
                            value={item.locationZh || ''}
                            onChange={e => setCollaborations(prev => {
                              const next = [...prev];
                              next[index] = { ...next[index], locationZh: e.target.value };
                              return next;
                            })}
                            placeholder="地点 (中文)"
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm placeholder-gray-400"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {activeSection === 'carousel-images' && (
              <div className="space-y-4">
                {carouselImages.map((item, index) => (
                  <div key={item.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
                    <div className="flex items-start gap-4">
                      <div className="shrink-0 w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center text-violet-700 font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1 space-y-3">
                        {item.status !== 'uploaded' ? (
                          !item.file ? (
                            <label className="flex flex-col items-center justify-center py-4 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-violet-400 hover:bg-violet-50 transition group">
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={e => {
                                  const f = e.target.files?.[0];
                                  if (f) { handleCarouselImageSelect(index, f); e.target.value = ''; }
                                }}
                              />
                              <Upload className="w-5 h-5 text-gray-400 group-hover:text-violet-500 mb-1" />
                              <span className="text-sm text-gray-500 group-hover:text-violet-600">Upload image</span>
                            </label>
                          ) : (
                            <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                              <img src={item.preview!} alt="Preview" className="w-12 h-12 rounded-lg object-cover border border-amber-200 shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{item.file?.name}</p>
                                <p className="text-xs text-amber-600">Ready to upload</p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <button onClick={() => clearCarouselImage(index)} className="p-1.5 text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                                <button
                                  onClick={() => uploadCarouselImageToOSS(index)}
                                  disabled={item.status === 'uploading'}
                                  className="px-3 py-1.5 bg-violet-600 text-white text-xs font-medium rounded-lg hover:bg-violet-700 disabled:opacity-50 flex items-center gap-1.5"
                                >
                                  {item.status === 'uploading' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                                  {item.status === 'uploading' ? 'Uploading...' : 'Upload'}
                                </button>
                              </div>
                            </div>
                          )
                        ) : (
                          <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                            <img src={item.preview!} alt="Uploaded" className="w-12 h-12 rounded-lg object-cover border border-emerald-200 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-emerald-600 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" /> Image on cPanel
                              </p>
                              <p className="text-[11px] text-gray-400 truncate">{item.ossUrl}</p>
                            </div>
                            <button onClick={() => clearCarouselImage(index)} className="p-1.5 text-gray-400 hover:text-red-500 shrink-0" title="Remove">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input
                            type="text"
                            value={item.title || ''}
                            onChange={e => setCarouselImages(prev => {
                              const next = [...prev];
                              next[index] = { ...next[index], title: e.target.value };
                              return next;
                            })}
                            placeholder="Project Title (English)"
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm placeholder-gray-400"
                          />
                          <input
                            type="text"
                            value={item.titleZh || ''}
                            onChange={e => setCarouselImages(prev => {
                              const next = [...prev];
                              next[index] = { ...next[index], titleZh: e.target.value };
                              return next;
                            })}
                            placeholder="项目名称 (中文)"
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm placeholder-gray-400"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {activeSection === 'carousel-videos' && (
              <div className="space-y-4">
                {carouselVideos.map((item, index) => (
                  <div key={item.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
                    <div className="flex items-start gap-4">
                      <div className="shrink-0 w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center text-violet-700 font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1 space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Thumbnail</label>
                          {item.thumbnailStatus !== 'uploaded' ? (
                            !item.thumbnailFile ? (
                              <label className="flex items-center justify-center py-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-violet-400 hover:bg-violet-50 transition group">
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={e => {
                                    const f = e.target.files?.[0];
                                    if (f) { handleThumbnailSelect(index, f); e.target.value = ''; }
                                  }}
                                />
                                <ImageIcon className="w-4 h-4 text-gray-400 group-hover:text-violet-500 mr-2" />
                                <span className="text-sm text-gray-500 group-hover:text-violet-600">Upload thumbnail</span>
                              </label>
                            ) : (
                              <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                                <img src={item.thumbnailPreview!} alt="Thumb" className="w-12 h-12 rounded-lg object-cover border border-amber-200 shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">{item.thumbnailFile?.name}</p>
                                  <p className="text-xs text-amber-600">Ready to upload</p>
                                </div>
                                <button onClick={() => clearThumbnail(index)} className="p-1.5 text-gray-400 hover:text-red-500 shrink-0"><X className="w-4 h-4" /></button>
                                <button
                                  onClick={() => uploadThumbnailToOSS(index)}
                                  disabled={item.thumbnailStatus === 'uploading'}
                                  className="px-3 py-1.5 bg-violet-600 text-white text-xs font-medium rounded-lg hover:bg-violet-700 disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                                >
                                  {item.thumbnailStatus === 'uploading' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                                  {item.thumbnailStatus === 'uploading' ? 'Uploading...' : 'Upload'}
                                </button>
                              </div>
                            )
                          ) : (
                            <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                              <img src={item.thumbnailPreview!} alt="Uploaded" className="w-12 h-12 rounded-lg object-cover border border-emerald-200 shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-emerald-600 flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3" /> Thumbnail on cPanel
                                </p>
                                <p className="text-[11px] text-gray-400 truncate">{item.thumbnailOssUrl}</p>
                              </div>
                              <button onClick={() => clearThumbnail(index)} className="p-1.5 text-gray-400 hover:text-red-500 shrink-0" title="Remove">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Video Link</label>
                          <div className="relative">
                            <Video className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="url"
                              value={item.videoUrl}
                              onChange={e => updateVideoField(index, 'videoUrl', e.target.value)}
                              placeholder="https://youtube.com/watch?v=…"
                              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm placeholder-gray-400"
                            />
                            {item.videoUrl && <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />}
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input
                            type="text"
                            value={item.title}
                            onChange={e => updateVideoField(index, 'title', e.target.value)}
                            placeholder="Title (English)"
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm placeholder-gray-400"
                          />
                          <input
                            type="text"
                            value={item.titleZh}
                            onChange={e => updateVideoField(index, 'titleZh', e.target.value)}
                            placeholder="标题 (中文)"
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm placeholder-gray-400"
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <textarea
                            value={item.desc}
                            onChange={e => updateVideoField(index, 'desc', e.target.value)}
                            placeholder="Description (English)"
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm placeholder-gray-400 resize-none"
                            rows={2}
                          />
                          <textarea
                            value={item.descZh}
                            onChange={e => updateVideoField(index, 'descZh', e.target.value)}
                            placeholder="描述 (中文)"
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm placeholder-gray-400 resize-none"
                            rows={2}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="shrink-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between">
          <button
            onClick={handleResetAll}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition text-sm"
          >
            <RotateCcw className="w-4 h-4" /> Reset All
          </button>
          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-violet-600 text-white font-medium rounded-xl shadow-md shadow-violet-500/20 hover:bg-violet-700 disabled:opacity-70 disabled:cursor-not-allowed transition text-sm"
          >
            {saving
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving to Supabase + cPanel…</>
              : <><Save className="w-4 h-4" /> Save All to Frontend</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}