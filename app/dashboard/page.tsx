'use client';

import { useAuth } from '@/lib/auth-context';
import { InstructorDashboard } from '@/components/dashboard/instructor-dashboard';
import { LearnerDashboard } from '@/components/dashboard/learner-dashboard';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  if (user.role === 'admin' || user.role === 'super-admin') {
    // Admins might have their own dashboard or share instructor view for now
    // Redirecting to admin specific route usually handled in layout, but here we can show instructor view or a specific admin summary
    router.push('/admin');
    return null;
  }

  if (user.role === 'instructor') {
    return <InstructorDashboard />;
  }

  return <LearnerDashboard />;
}

