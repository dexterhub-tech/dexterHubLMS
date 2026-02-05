'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
    Menu,
    Home,
    BookOpen,
    CheckSquare,
    TrendingUp,
    Bell,
    Grid,
    Users,
    Settings,
    LogOut,
    Sparkles
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ModernSidebarProps {
    role?: 'learner' | 'instructor' | 'admin';
}

function SidebarContent({ role, user, logout, pathname, onLinkClick }: {
    role: string,
    user: any,
    logout: () => void,
    pathname: string,
    onLinkClick?: () => void
}) {
    const learnerLinks = [
        { href: '/dashboard', label: 'Overview', icon: Home },
        { href: '/dashboard/courses', label: 'My Courses', icon: BookOpen },
        { href: '/dashboard/tasks', label: 'Tasks', icon: CheckSquare },
        { href: '/dashboard/progress', label: 'Achievements', icon: TrendingUp },
        { href: '/dashboard/notifications', label: 'Alerts', icon: Bell },
    ];

    const instructorLinks = [
        { href: '/dashboard', label: 'Dashboard', icon: Grid },
        { href: '/dashboard/cohorts', label: 'Cohorts', icon: BookOpen },
        { href: '/dashboard/learners', label: 'Students', icon: Users },
    ];

    const adminLinks = [
        { href: '/admin', label: 'Admin Panel', icon: Grid },
        { href: '/admin/cohorts', label: 'Cohorts', icon: BookOpen },
        { href: '/admin/learners', label: 'Users', icon: Users },
        { href: '/admin/recommendations', label: 'Reviews', icon: Sparkles },
    ];

    const links = role === 'admin' ? adminLinks : role === 'instructor' ? instructorLinks : learnerLinks;

    return (
        <div className="flex flex-col h-full">
            {/* Premium Logo Section */}
            <div className="p-8">
                <div className="flex items-center gap-3">
                    {/* <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                        <Sparkles className="w-6 h-6 text-white" />
                    </div> */}
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                            Dexter<span className="text-indigo-600">Hub</span>
                        </h1>
                        <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Education Hub</p>
                    </div>
                </div>
            </div>

            {/* Main Navigation */}
            <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar pt-2">
                <div className="px-4 mb-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Main Menu</p>
                </div>
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={onLinkClick}
                            className={cn(
                                "flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative",
                                isActive
                                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                                    : "text-slate-500 hover:bg-white hover:text-indigo-600 hover:shadow-sm"
                            )}
                        >
                            <Icon className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-400 group-hover:text-indigo-600")} />
                            <span className="text-sm font-semibold">{link.label}</span>
                            {isActive && (
                                <div className="absolute right-4 w-1.5 h-1.5 bg-white rounded-full" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Upgrade / Promo Card (Optional/Aesthetic) */}
            <div className="px-6 py-4">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-4 text-white shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:scale-125 transition-transform">
                        <Sparkles className="w-12 h-12" />
                    </div>
                    <p className="text-xs font-bold opacity-80 mb-1">Upgrade to Pro</p>
                    <p className="text-sm font-semibold mb-3 leading-tight">Get unlimited access to premium courses.</p>
                    <button className="w-full py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl text-xs font-bold transition-all">
                        Upgrade Now
                    </button>
                </div>
            </div>

            {/* User Profile info & Actions */}
            <div className="p-4 mt-auto border-t border-slate-100">
                <div className="bg-slate-50 rounded-2xl p-3 flex items-center justify-between group transition-all hover:bg-slate-100/80">
                    <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
                            <AvatarImage src={user?.avatar} />
                            <AvatarFallback className="bg-white text-indigo-600 font-bold">
                                {user?.firstName?.[0] || 'U'}{user?.lastName?.[0] || ''}
                            </AvatarFallback>
                        </Avatar>
                        <div className="max-w-[100px]">
                            <p className="text-sm font-bold text-slate-800 truncate">{user?.firstName} {user?.lastName}</p>
                            <p className="text-[10px] text-slate-400 font-medium truncate capitalize">{role}</p>
                        </div>
                    </div>

                    <button
                        onClick={logout}
                        className="p-2.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
                        title="Logout"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}

export function ModernSidebar({ role = 'learner' }: ModernSidebarProps) {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Mobile Trigger */}
            <div className="lg:hidden fixed top-4 left-4 z-50">
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild>
                        <button className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 shadow-xl hover:bg-slate-50 transition-all">
                            <Menu className="w-6 h-6" />
                        </button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 border-r-0 bg-neutral-50/50 backdrop-blur-md w-80">
                        <SidebarContent role={role} user={user} logout={logout} pathname={pathname} onLinkClick={() => setIsOpen(false)} />
                    </SheetContent>
                </Sheet>
            </div>

            {/* Desktop Sidebar (Floating Aesthetic) */}
            <aside className="hidden lg:flex fixed left-6 top-6 bottom-6 w-72 bg-white/70 backdrop-blur-xl border border-slate-200/60 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] z-40 flex-col overflow-hidden">
                <SidebarContent role={role} user={user} logout={logout} pathname={pathname} />
            </aside>
        </>
    );
}
