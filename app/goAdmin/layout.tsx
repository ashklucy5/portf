// app/goAdmin/layout.tsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // ✅ FIXED: Auth check with proper pathname matching
  useEffect(() => {
    // Normalize pathname (remove trailing slash for comparison)
    const normalizedPath = pathname?.endsWith('/') && pathname !== '/' 
      ? pathname.slice(0, -1) 
      : pathname;

    // Skip auth check on login page (handle both with/without trailing slash)
    if (normalizedPath === '/goAdmin/login' || normalizedPath?.startsWith('/goAdmin/login')) {
      setCheckingAuth(false);
      return;
    }

    const checkAuth = () => {
      try {
        const isAdmin = localStorage.getItem('isAdmin') === 'true';
        
        if (!isAdmin) {
          // Redirect to login if not authenticated
          router.replace('/goAdmin/login');
        } else {
          setCheckingAuth(false);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        router.replace('/goAdmin/login');
      }
    };

    // Small delay to ensure localStorage is ready
    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, [pathname, router]); // ✅ pathname is already in deps

  // Show loading while checking auth
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
      </div>
    );
  }

  // If on login page, render without sidebar/header
  const normalizedPath = pathname?.endsWith('/') && pathname !== '/' 
    ? pathname.slice(0, -1) 
    : pathname;
    
  if (normalizedPath === '/goAdmin/login' || normalizedPath?.startsWith('/goAdmin/login')) {
    return <>{children}</>;
  }

  // Authenticated → render admin panel with sidebar/header
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-50 
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0
      `}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-64 w-full min-w-0">
        <Header onMenuToggle={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}