'use client';

import React from "react"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { ModernSidebar } from '@/components/modern-sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Redirect instructors/admins to their respective dashboards
  if (user?.role === 'admin' || user?.role === 'super-admin') {
    router.push('/admin');
    return null;
  }

  const role = user?.role === 'instructor' ? 'instructor' : 'learner';

  return (
    <div className="min-h-screen bg-background">
      <ModernSidebar role={role} />
      <main className="ml-0 lg:ml-80 min-h-screen">
        {children}
      </main>
    </div>
  );
}
