'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { EnterpriseCrmProvider } from '@/context/EnterpriseCrmContext';
import { SuperAdminProvider } from '@/context/SuperAdminContext';
import { EnterpriseTopHeader } from '@/components/layout/EnterpriseTopHeader';
import { EnterpriseNavbar } from '@/components/layout/EnterpriseNavbar';
import { SuperAdminSidebar } from '@/components/layout/SuperAdminSidebar';
import { SuperAdminHeader } from '@/components/layout/SuperAdminHeader';
import { authMockService, MockAuthUser } from '@/services/authMockService';

export function EnterpriseShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<MockAuthUser | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const user = authMockService.getCurrentUser();
    setCurrentUser(user);
  }, [pathname]);

  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    return (
      <EnterpriseCrmProvider>
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased w-full max-w-full">
          {children}
        </div>
      </EnterpriseCrmProvider>
    );
  }

  // Dedicated Super Admin management console is active only on /super-admin routes
  const isSuperAdminSession = pathname.startsWith('/super-admin');

  return (
    <EnterpriseCrmProvider>
      <SuperAdminProvider>
        {isSuperAdminSession ? (
          <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans antialiased w-full max-w-full relative">
            {/* Super Admin Vertical Sidebar */}
            <SuperAdminSidebar
              mobileOpen={mobileSidebarOpen}
              onCloseMobile={() => setMobileSidebarOpen(false)}
            />

            {/* Super Admin Main App Column */}
            <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 md:pl-64">
              <SuperAdminHeader onOpenMobileSidebar={() => setMobileSidebarOpen(true)} />
              <main className="flex-1 p-3 sm:p-5 lg:p-6 w-full max-w-full min-w-0 animate-in fade-in duration-150">
                <React.Suspense fallback={<div className="p-8 text-center text-slate-400">Loading...</div>}>
                  {children}
                </React.Suspense>
              </main>
            </div>
          </div>
        ) : (
          <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans antialiased w-full max-w-full">
            {/* Level 1: Top Brand & Profile Header */}
            <React.Suspense fallback={<div className="h-12 bg-white border-b border-slate-200" />}>
              <EnterpriseTopHeader />
            </React.Suspense>

            {/* Level 2: Sticky Horizontal Navbar with Module Dropdowns */}
            <React.Suspense fallback={<div className="h-10 bg-slate-900 border-b border-slate-800" />}>
              <EnterpriseNavbar />
            </React.Suspense>

            {/* Main Application Container — 100% Full Width Edge-to-Edge */}
            <main className="flex-1 px-2.5 sm:px-6 lg:px-8 py-3 sm:py-4 w-full max-w-full min-w-0 animate-in fade-in duration-150">
              <React.Suspense fallback={<div className="p-8 text-center text-slate-400">Loading...</div>}>
                {children}
              </React.Suspense>
            </main>
          </div>
        )}
      </SuperAdminProvider>
    </EnterpriseCrmProvider>
  );
}
