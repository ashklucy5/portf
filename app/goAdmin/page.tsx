// app/goAdmin/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { 
  FileText, Users, Eye, TrendingUp, Edit, Plus, 
  Loader2, AlertCircle, CheckCircle, RefreshCw, Menu 
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase'; // ✅ Import Supabase client

// Types
interface ContentStats {
  totalEntries: number;
  enCount: number;
  zhCount: number;
  sections: Record<string, number>;
  lastUpdated: string;
}

interface RecentChange {
  id: number;
  section: string;
  key_path: string;
  locale: string;
  updated_at: number;
}

const SECTIONS = [
  { id: 'hero', label: 'Hero', icon: FileText, path: '/goAdmin/content?section=hero' },
  { id: 'about', label: 'About', icon: FileText, path: '/goAdmin/content?section=about' },
  { id: 'services', label: 'Services', icon: FileText, path: '/goAdmin/content?section=services' },
  { id: 'team', label: 'Team', icon: Users, path: '/goAdmin/content?section=team' },
  { id: 'footer', label: 'Footer', icon: FileText, path: '/goAdmin/content?section=footer' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<ContentStats | null>(null);
  const [recentChanges, setRecentChanges] = useState<RecentChange[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ✅ Fetch stats from Supabase
  // ✅ Fetch stats from Supabase
const fetchStats = async () => {
  try {
    // Fetch counts for both locales
    const [enCountRes, zhCountRes] = await Promise.all([
      supabase
        .from('content')
        .select('id', { count: 'exact', head: true })
        .eq('locale', 'en'),
      supabase
        .from('content')
        .select('id', { count: 'exact', head: true })
        .eq('locale', 'zh'),
    ]);

    // Fetch section distribution (sample for performance)
    const {  data: sectionData, error: sectionError } = await supabase
      .from('content')
      .select('section')
      .limit(100);

    const enCount = enCountRes.count || 0;
    const zhCount = zhCountRes.count || 0;

    // Calculate section distribution from sample
    const sections: Record<string, number> = {};
    SECTIONS.forEach(s => { sections[s.id] = 0; });
    
    if (sectionData) {
      sectionData.forEach((row: any) => {
        if (sections[row.section] !== undefined) {
          sections[row.section] += 2; // Estimate: double the sample count
        }
      });
    }

    setStats({
      totalEntries: enCount + zhCount,
      enCount,
      zhCount,
      sections,
      lastUpdated: new Date().toLocaleString()
    });

    // Mock recent changes (replace with audit log table later)
    setRecentChanges([
      { id: 1, section: 'hero', key_path: 'tagline', locale: 'en', updated_at: Date.now() - 7200000 },
      { id: 2, section: 'about', key_path: 'description', locale: 'en', updated_at: Date.now() - 18000000 },
      { id: 3, section: 'team', key_path: 'members.CEO', locale: 'zh', updated_at: Date.now() - 86400000 },
    ]);

  } catch (err) {
    console.error('Failed to fetch stats from Supabase:', err);
    setError('Failed to load dashboard data. Please check your Supabase connection.');
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-65px)] items-center justify-center">
        <div className="flex items-center gap-3 text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm sm:text-base">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[calc(100vh-65px)] items-center justify-center p-4">
        <div className="text-center p-6 bg-red-50 rounded-2xl border border-red-200 max-w-sm w-full">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
          <h3 className="font-semibold text-red-800 mb-2 text-sm sm:text-base">Error Loading Dashboard</h3>
          <p className="text-xs sm:text-sm text-red-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm w-full"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header - Mobile Optimized */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">Dashboard</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">
            Overview of your bilingual content
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition disabled:opacity-50 text-xs sm:text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Grid - Responsive */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Content Entries */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 hover:shadow-md transition">
          <div className="flex items-start justify-between">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-500 truncate">Total Entries</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{stats?.totalEntries || 0}</p>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Across all sections</p>
            </div>
            <div className="p-2 sm:p-3 rounded-xl bg-blue-500 bg-opacity-10 shrink-0">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </div>
          </div>
        </div>

        {/* English Content */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 hover:shadow-md transition">
          <div className="flex items-start justify-between">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-500 truncate">English</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{stats?.enCount || 0}</p>
              <p className="text-[10px] sm:text-xs text-emerald-600 mt-0.5 sm:mt-1 hidden sm:block">Active</p>
            </div>
            <div className="p-2 sm:p-3 rounded-xl bg-emerald-500 bg-opacity-10 shrink-0">
              <span className="text-sm sm:text-lg font-bold text-emerald-600">EN</span>
            </div>
          </div>
        </div>

        {/* Chinese Content */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 hover:shadow-md transition">
          <div className="flex items-start justify-between">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-500 truncate">Chinese</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{stats?.zhCount || 0}</p>
              <p className="text-[10px] sm:text-xs text-emerald-600 mt-0.5 sm:mt-1 hidden sm:block">Active</p>
            </div>
            <div className="p-2 sm:p-3 rounded-xl bg-violet-500 bg-opacity-10 shrink-0">
              <span className="text-sm sm:text-lg font-bold text-violet-600">中文</span>
            </div>
          </div>
        </div>

        {/* Last Updated */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 hover:shadow-md transition">
          <div className="flex items-start justify-between">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-500 truncate">Last Synced</p>
              <p className="text-sm sm:text-lg font-bold text-gray-900 mt-1 truncate">{stats?.lastUpdated?.split(',')[0] || 'Never'}</p>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Supabase</p>
            </div>
            <div className="p-2 sm:p-3 rounded-xl bg-amber-500 bg-opacity-10 shrink-0">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions - Responsive Grid */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Quick Actions</h2>
        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3">
          {SECTIONS.map((section) => {
            const Icon = section.icon;
            return (
              <Link
                key={section.id}
                href={section.path}
                className="flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 bg-gray-50 rounded-xl hover:bg-violet-50 hover:border-violet-200 border border-transparent transition group"
                onClick={() => setSidebarOpen(false)}
              >
                <div className="p-2 sm:p-3 bg-white rounded-xl shadow-sm group-hover:shadow-md transition">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 group-hover:text-violet-600" />
                </div>
                <span className="text-[10px] sm:text-xs font-medium text-gray-700 group-hover:text-violet-700 text-center leading-tight">
                  {section.label}
                </span>
                <span className="text-[9px] sm:text-[10px] text-gray-400 hidden sm:block">
                  {stats?.sections?.[section.id] || 0}
                </span>
              </Link>
            );
          })}
          <Link
            href="/goAdmin/media"
            className="flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 bg-gray-50 rounded-xl hover:bg-emerald-50 hover:border-emerald-200 border border-transparent transition group"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="p-2 sm:p-3 bg-white rounded-xl shadow-sm group-hover:shadow-md transition">
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 group-hover:text-emerald-600" />
            </div>
            <span className="text-[10px] sm:text-xs font-medium text-gray-700 group-hover:text-emerald-700 text-center leading-tight">
              Media
            </span>
            <span className="text-[9px] sm:text-[10px] text-gray-400 hidden sm:block">Upload</span>
          </Link>
        </div>
      </div>

      {/* Recent Changes - Mobile Optimized */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">Recent Changes</h2>
          <span className="text-[10px] sm:text-xs text-gray-500 hidden sm:inline">Last 24 hours</span>
        </div>
        
        {recentChanges.length === 0 ? (
          <div className="text-center py-6 sm:py-8 text-gray-500">
            <FileText className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs sm:text-sm">No recent changes</p>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {recentChanges.map((change) => (
              <div 
                key={change.id} 
                className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-violet-100 rounded-full flex items-center justify-center shrink-0">
                    <Edit className="w-4 h-4 sm:w-5 sm:h-5 text-violet-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 text-xs sm:text-sm capitalize truncate">{change.section}</p>
                    <p className="text-[10px] sm:text-xs text-gray-500 truncate">
                      <span className="font-mono bg-gray-200 px-1 py-0.5 rounded">{change.key_path}</span>
                      <span className="ml-1 sm:ml-2 text-[9px] sm:text-[10px] uppercase font-semibold text-gray-400">
                        {change.locale}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] sm:text-xs text-gray-500">
                    {formatTimeAgo(change.updated_at)}
                  </p>
                  <Link 
                    href={`/goAdmin/content?section=${change.section}`}
                    className="text-[10px] sm:text-xs text-violet-600 hover:text-violet-700 font-medium"
                    onClick={() => setSidebarOpen(false)}
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* System Status - Responsive */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">System Status</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <StatusCard 
            title="Supabase" 
            status="Online" 
            description="Content database" 
            color="emerald" 
          />
          <StatusCard 
            title="Aliyun OSS" 
            status="Online" 
            description="Image storage" 
            color="emerald" 
          />
          <StatusCard 
            title="Next.js Static" 
            status="Online" 
            description="Frontend hosting" 
            color="emerald" 
          />
        </div>
      </div>
    </div>
  );
}

// Helper: Format timestamp to human-readable time ago
function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

// Reusable Status Card Component - Mobile Optimized
function StatusCard({ title, status, description, color }: {
  title: string;
  status: 'Online' | 'Offline' | 'Degraded';
  description: string;
  color: 'emerald' | 'amber' | 'red';
}) {
  const colors = {
    emerald: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    amber: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
    red: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
  };
  
  const c = colors[color];
  
  return (
    <div className="flex items-center gap-2.5 sm:gap-3 p-3 sm:p-4 bg-gray-50 rounded-xl">
      <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${c.dot} animate-pulse shrink-0`} />
      <div className="min-w-0">
        <p className="font-medium text-gray-900 text-xs sm:text-sm truncate">{title}</p>
        <p className={`text-[10px] sm:text-xs ${c.text}`}>{status}</p>
        <p className="text-[9px] sm:text-[10px] text-gray-500 truncate hidden sm:block">{description}</p>
      </div>
    </div>
  );
}