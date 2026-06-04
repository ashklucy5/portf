// app/goAdmin/components/Sidebar.tsx
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  FileText, 
  Settings, 
  LogOut, 
  Image as ImageIcon, 
  X,
  Megaphone  // ✅ Added: Icon for Services
} from 'lucide-react';

const navItems = [
  { href: '/goAdmin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/goAdmin/content', label: 'Content', icon: FileText },
  { href: '/goAdmin/media', label: 'Media', icon: ImageIcon },
  { href: '/goAdmin/services', label: 'Services', icon: Megaphone }, // ✅ Added: Services section
  { href: '/goAdmin/settings', label: 'Settings', icon: Settings },
  {href: '/goAdmin/service-blogs', 
  label: 'Service Blogs', 
  icon: FileText,
  description: 'Edit blog posts for services'}
];

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  
  return (
    <aside className="w-64 bg-gray-900 text-white h-screen flex flex-col fixed md:relative z-50">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-lg">GoSarwar Admin</h1>
          <p className="text-xs text-gray-400">v1.0.0</p>
        </div>
        {/* ✅ Close button for mobile */}
        <button 
          onClick={onClose}
          className="md:hidden p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose} // ✅ Close sidebar when clicking nav links
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <Link
          href="/"
          onClick={onClose} // ✅ Close sidebar when clicking back to website
          className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium text-sm">Back to Website</span>
        </Link>
      </div>
    </aside>
  );
}