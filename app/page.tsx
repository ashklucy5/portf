// app/page.tsx
'use client'
import { useState, useEffect } from 'react'
import Hero from "@/components/Hero"
import About from "@/components/About"
import Services from "@/components/Services"
import WorksCarousel from "@/components/WorksCarousel"
import Team from "@/components/Team"
import Footer from "@/components/Footer"
import Navbar from "@/components/Navbar"
import { Loader2, AlertCircle } from 'lucide-react'
import { getContent } from '@/lib/supabase'

// ── TYPES ───────────────────────────────────────────────────────────────
interface ServiceItem {
  title: string
  titleZh: string
  desc: string
  descZh: string
  imageUrl?: string
  icon?: string
}

interface ServicesItems {
  seo: ServiceItem;
  design: ServiceItem;
  marketing: ServiceItem;
  ecommerce: ServiceItem;
  analytics: ServiceItem;
  support: ServiceItem;
}

interface ServicesData {
  title: string
  titleZh: string
  subtitle: string
  subtitleZh: string
  items: ServicesItems
}

interface FeatureItem {
  title: string
  titleZh: string
  desc: string
  descZh: string
}

interface AboutFeatures {
  strategy: FeatureItem
  growth: FeatureItem
  team: FeatureItem
  secure: FeatureItem
}

interface AboutData {
  badge: string
  badgeZh: string
  title: string
  titleZh: string
  subtitle: string
  subtitleZh: string
  heading: string
  headingZh: string
  description: string
  descriptionZh: string
  aboutImage: string
  features: AboutFeatures
}

// ✅ Updated: CollaborationPhoto for Team/Portfolio section
export interface CollaborationPhoto {
  _id: string
  title: string
  titleZh: string
  description: string
  descriptionZh: string
  imageUrl: string
  location?: string
  locationZh?: string
  date?: string
}

interface ShowcaseItem {
  id: string
  image: string
  title: string
  titleZh?: string
}

interface CaseStudy {
  id: string
  image: string
  title: string
  titleZh?: string
  desc: string
  descZh?: string
  videoUrl: string
}

interface HeroStats {
  servicesTitle: string
  servicesTitleZh: string
  servicesBadge: string
  revenueTitle: string
  revenueTitleZh: string
  revenueValue: string
  revenueGrowth: string
  helped: string
  helpedZh: string
  helpedValue: string
}

interface HeroData {
  tagline: string
  taglineZh: string
  titleStart: string
  titleStartZh: string
  titleHighlight: string
  titleHighlightZh: string
  titleMiddle: string
  titleMiddleZh: string
  titleEnd: string
  titleEndZh: string
  cta: string
  ctaZh: string
  teamCard: { title: string; titleZh: string }
  servicesList: string[]
  trust: { text: string; textZh: string }
  heroImage: string
  stats: HeroStats
}

interface NavData {
  home: string
  homeZh: string
  services: string
  servicesZh: string
  works: string
  worksZh: string
  about: string
  aboutZh: string
  team: string
  teamZh: string
  contact: string
  contactZh: string
}

interface FooterData {
  title: string
  titleZh: string
  subtitle: string
  subtitleZh: string
  phone: string
  whatsapp: string
  email: string
  youtube: string
}

interface PageData {
  hero?: HeroData
  about?: AboutData
  services?: ServicesData
  // ✅ Updated: Team now uses CollaborationPhoto[]
  team?: CollaborationPhoto[] | string
  footer?: FooterData
  nav?: NavData
  'carousel-images'?: { items: Record<string, any> }
  'carousel-videos'?: { items: Record<string, any> }
}

// ── FALLBACK DATA ──────────────────────────────────────────────────────
const FALLBACK_DATA: PageData = {
  hero: {
    tagline: 'Increase your sales',
    taglineZh: '提升您的销售额',
    titleStart: 'Grow your',
    titleStartZh: '发展您的',
    titleHighlight: 'digital business',
    titleHighlightZh: '数字业务',
    titleMiddle: 'with us & make',
    titleMiddleZh: '与我们一起',
    titleEnd: 'Success',
    titleEndZh: '成功',
    cta: 'Get Start a Project',
    ctaZh: '开始项目',
    teamCard: { title: 'The most experienced team', titleZh: '最专业的团队' },
    servicesList: ['SEO', 'Graphic Design', 'PPC', 'Virtual Assistant'],
    trust: { text: 'Trusted by 50,000+ teams', textZh: '被50,000+团队信赖' },
    heroImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&fit=crop',
    stats: {
      servicesTitle: 'Services Offered',
      servicesTitleZh: '提供的服务',
      servicesBadge: '6+',
      revenueTitle: 'Annual Revenue',
      revenueTitleZh: '年收入',
      revenueValue: '$25.4M',
      revenueGrowth: '↑ +25M',
      helped: 'Clients helped',
      helpedZh: '服务客户',
      helpedValue: '12K+'
    }
  },
  about: {
    badge: 'About Us',
    badgeZh: '关于我们',
    title: 'Who We Are',
    titleZh: '我们是谁',
    subtitle: 'We are a team of passionate creators...',
    subtitleZh: '我们是一支充满激情的创作者团队...',
    heading: 'We blend creativity with data...',
    headingZh: '我们将创意与数据结合...',
    description: 'At GoSarwar, we believe that great design...',
    descriptionZh: '在GoSarwar，我们相信优秀的设计...',
    aboutImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&fit=crop',
    features: {
      strategy: { title: 'Creative Strategy', titleZh: '创意策略', desc: 'Innovative approaches...', descZh: '创新方法...' },
      growth: { title: 'Data Driven', titleZh: '数据驱动', desc: 'Decisions backed by analytics...', descZh: '基于分析的决策...' },
      team: { title: 'Expert Team', titleZh: '专业团队', desc: 'Skilled professionals...', descZh: '技术精湛的专业人士...' },
      secure: { title: 'Secure & Reliable', titleZh: '安全可靠', desc: 'Robust solutions...', descZh: '稳健的解决方案...' }
    }
  },
  services: {
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
},
  // ✅ Updated: Collaboration photos instead of team members
  team: [
    { _id: '1', title: 'Tech Company Visit', titleZh: '科技公司访问', description: 'Meeting with the development team', descriptionZh: '与开发团队会面', location: 'Shanghai, China', locationZh: '中国上海', imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop' },
    { _id: '2', title: 'Partnership Signing', titleZh: '合作签约', description: 'Official partnership agreement', descriptionZh: '正式合作协议', location: 'Beijing, China', locationZh: '中国北京', imageUrl: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=600&fit=crop' },
    { _id: '3', title: 'Team Collaboration', titleZh: '团队协作', description: 'Working session with marketing team', descriptionZh: '与市场团队工作会议', location: 'Guangzhou, China', locationZh: '中国广州', imageUrl: 'https://images.unsplash.com/photo-1497366754035-f200968a6ae7?w=800&h=600&fit=crop' },
    { _id: '4', title: 'Product Launch', titleZh: '产品发布', description: 'Joint product launch event', descriptionZh: '联合产品发布会', location: 'Shenzhen, China', locationZh: '中国深圳', imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=600&fit=crop' },
  ],
  footer: {
    title: 'Contact Us',
    titleZh: '联系我们',
    subtitle: "We'd love to hear from you",
    subtitleZh: "我们期待听到您的声音",
    phone: '+86 197 1664 1084',
    whatsapp: 'https://wa.me/+880 1319-238346',
    email: 'go-sarwar@outlook.com',
    youtube: 'https://youtube.com/channel/UC123456'
  },
  nav: {
    home: 'Home', homeZh: '首页',
    services: 'Services', servicesZh: '服务',
    works: 'Works', worksZh: '作品',
    about: 'About', aboutZh: '关于',
    team: 'Collaborations', teamZh: '合作',
    contact: 'Contact', contactZh: '联系'
  },
  'carousel-images': {
    items: {
      '1': { url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop', title: 'Project Alpha', titleZh: '项目阿尔法' },
      '2': { url: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=600&fit=crop', title: 'Project Beta', titleZh: '项目贝塔' },
      '3': { url: 'https://images.unsplash.com/photo-1497366754035-f200968a6ae7?w=800&h=600&fit=crop', title: 'Project Gamma', titleZh: '项目伽马' },
      '4': { url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=600&fit=crop', title: 'Project Delta', titleZh: '项目德尔塔' },
      '5': { url: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&h=600&fit=crop', title: 'Project Epsilon', titleZh: '项目伊普西龙' },
      '6': { url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop', title: 'Project Zeta', titleZh: '项目泽塔' },
    }
  },
  'carousel-videos': {
    items: {
      'cs1': { thumbnailUrl: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=533&fit=crop', title: 'Growth Strategy', titleZh: '增长策略', desc: 'How we increased conversions by 300%', descZh: '如何将转化率提高300%', videoUrl: '#' },
      'cs2': { thumbnailUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=533&fit=crop', title: 'Brand Redesign', titleZh: '品牌重塑', desc: 'Complete visual identity overhaul', descZh: '完整的视觉形象改造', videoUrl: '#' },
      'cs3': { thumbnailUrl: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=533&fit=crop', title: 'Marketing Campaign', titleZh: '营销活动', desc: 'Viral social media strategy', descZh: '病毒式社交媒体策略', videoUrl: '#' },
      'cs4': { thumbnailUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=533&fit=crop', title: 'Product Launch', titleZh: '产品发布', desc: 'Successful go-to-market plan', descZh: '成功的上市计划', videoUrl: '#' },
      'cs5': { thumbnailUrl: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=533&fit=crop', title: 'UX Research', titleZh: '用户体验研究', desc: 'User-centered design approach', descZh: '以用户为中心的设计方法', videoUrl: '#' },
      'cs6': { thumbnailUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=533&fit=crop', title: 'SEO Optimization', titleZh: 'SEO优化', desc: 'Ranking #1 on Google', descZh: '谷歌排名第一', videoUrl: '#' },
      'cs7': { thumbnailUrl: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=533&fit=crop', title: 'E-commerce', titleZh: '电子商务', desc: '300% sales increase', descZh: '销售额增长300%', videoUrl: '#' },
      'cs8': { thumbnailUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=533&fit=crop', title: 'Content Strategy', titleZh: '内容策略', desc: 'Engaging storytelling', descZh: '引人入胜的故事讲述', videoUrl: '#' },
      'cs9': { thumbnailUrl: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=533&fit=crop', title: 'Analytics', titleZh: '数据分析', desc: 'Data-driven decisions', descZh: '数据驱动的决策', videoUrl: '#' },
    }
  }
}

// ── COMPONENT ──────────────────────────────────────────────────────────
export default function Home() {
  // ✅ CHANGE: Default to 'zh' instead of 'en'
  const [locale, setLocale] = useState<'en' | 'zh'>('zh')
  const [data, setData] = useState<PageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [redirecting, setRedirecting] = useState(false)  // ✅ Add redirect state

  // ✅ ADD: Redirect to /?lang=zh if no lang param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const lang = params.get('lang')
    
    // If no lang param, redirect to Chinese default
    if (!lang) {
      setRedirecting(true)
      window.location.replace('/?lang=zh')
      return
    }
    
    // If lang param exists, set locale
    if (lang === 'en' || lang === 'zh') {
      setLocale(lang)
    }
  }, [])

  // Fetch from Supabase (only run if not redirecting)
  useEffect(() => {
    if (redirecting) return  // ✅ Skip fetch while redirecting
    
    let mounted = true
    
    const loadContent = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const content = await getContent(locale)
        
        if (mounted) {
          setData({ ...FALLBACK_DATA, ...content })
          setLoading(false)
        }
      } catch (err: any) {
        console.error('Failed to fetch content:', err)
        if (mounted) {
          setError('Failed to load content. Using fallback data.')
          setData(FALLBACK_DATA)
          setLoading(false)
        }
      }
    }
    
    loadContent()
    return () => { mounted = false }
  }, [locale, redirecting])  // ✅ Add redirecting to dependency array

  // Fetch from Supabase
  useEffect(() => {
    let mounted = true
    
    const loadContent = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const content = await getContent(locale)
        
        if (mounted) {
          // ✅ Merge with fallback to ensure UI never breaks
          setData({ ...FALLBACK_DATA, ...content })
          setLoading(false)
        }
      } catch (err: any) {
        console.error('Failed to fetch content:', err)
        if (mounted) {
          setError('Failed to load content. Using fallback data.')
          setData(FALLBACK_DATA)
          setLoading(false)
        }
      }
    }
    
    loadContent()
    return () => { mounted = false }
  }, [locale])

  // ✅ Show error state
  if (error && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (redirecting || loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
        <span className="ml-3 text-gray-600">
          {redirecting ? 'Redirecting to Chinese...' : 'Loading content...'}
        </span>
      </div>
    )
  }

  // ✅ Transform team/collaboration data - Now returns CollaborationPhoto[]
  const collaborationData: CollaborationPhoto[] = Array.isArray(data.team) 
    ? data.team 
    : FALLBACK_DATA.team as CollaborationPhoto[]

  // ✅ Transform carousel images (showcase)
  const showcaseImages: ShowcaseItem[] = data['carousel-images']?.items
    ? Object.entries(data['carousel-images'].items).map(([key, item]: [string, any]) => ({
        id: key,
        image: typeof item === 'string' ? item : (item?.url || item?.imageUrl || ''),
        title: typeof item === 'object' ? (item?.title || key) : key,
        titleZh: typeof item === 'object' ? item?.titleZh : undefined,
      }))
    : []

  // ✅ Transform carousel videos (case studies)
  const caseStudies: CaseStudy[] = data['carousel-videos']?.items
    ? Object.entries(data['carousel-videos'].items).map(([key, item]: [string, any]) => ({
        id: key,
        image: item?.thumbnailUrl || item?.imageUrl || '',
        title: item?.title || '',
        titleZh: item?.titleZh,
        desc: item?.desc || item?.description || '',
        descZh: item?.descZh,
        videoUrl: item?.videoUrl || '#',
      }))
    : []
  console.log('🔍 1. RAW SUPABASE CAROUSEL DATA:', data['carousel-images'], data['carousel-videos']);
  console.log('🔍 2. TRANSFORMED SHOWCASE IMAGES:', showcaseImages);
  console.log('🔍 3. TRANSFORMED CASE STUDIES:', caseStudies);
  return (
    <>
      {/* ✅ Pass locale for language switching */}
      <Navbar data={data.nav} locale={locale} />
      <Hero data={data.hero} />
      <Services data={data.services} locale={locale} />
      <About data={data.about} />
      {/* ✅ Pass transformed data to WorksCarousel */}
      <WorksCarousel data={{ 
        showcaseImages, 
        caseStudies 
      }} locale={locale}/>
      {/* ✅ Pass CollaborationPhoto[] to Team component */}
      <Team data={collaborationData}locale={locale} />
      <Footer data={data.footer} locale={locale} />
    </>
  )
}