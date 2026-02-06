'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const MENU_ITEMS = {
  learner: [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/courses', label: 'My Courses', icon: BookOpen },
    { href: '/dashboard/progress', label: 'My Progress', icon: Users },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  ],
  instructor: [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/cohorts', label: 'My Cohorts', icon: Users },
    { href: '/dashboard/learners', label: 'Learners', icon: Users },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  ],
  admin: [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/cohorts', label: 'Cohorts', icon: Users },
    { href: '/admin/learners', label: 'Learners', icon: Users },
    { href: '/admin/recommendations', label: 'Reviews', icon: BookOpen },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ],
  'super-admin': [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/cohorts', label: 'Cohorts', icon: Users },
    { href: '/admin/learners', label: 'Learners', icon: Users },
    { href: '/admin/recommendations', label: 'Reviews', icon: BookOpen },
    { href: '/admin/audit-logs', label: 'Audit Logs', icon: LayoutDashboard },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ],
};

export function DashboardSidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = MENU_ITEMS[user?.role as keyof typeof MENU_ITEMS] || [];

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-background"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={`${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 fixed left-0 top-0 w-64 h-screen bg-sidebar border-r border-sidebar-border transition-transform duration-300 z-40 flex flex-col`}
      >
        {/* Header */}
        <div className="h-20 flex items-center justify-center border-b border-sidebar-border px-4">
          <Link href="/dashboard" className="text-2xl font-semibold text-sidebar-primary">
            DexterHub
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                  }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="flex-1">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 space-y-3 border-t border-sidebar-border">
          <div className="px-4 py-2">
            <p className="text-xs font-semibold text-sidebar-foreground/60 uppercase">User</p>
            <p className="text-sm font-medium text-sidebar-foreground mt-1">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-sidebar-foreground/60">{user?.email}</p>
          </div>

          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent/50 border-sidebar-border bg-transparent"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
