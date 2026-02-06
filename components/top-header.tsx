'use client';

import React from 'react';
import { Search, Bell, User, Sparkles, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface TopHeaderProps {
    user?: {
        name: string;
        email: string;
        avatar?: string;
    };
    onSearch?: (query: string) => void;
}

export function TopHeader({ user, onSearch }: TopHeaderProps) {
    const [isSearchOpen, setIsSearchOpen] = React.useState(false);

    return (
        <header className="sticky top-0 z-40 w-full border-b border-slate-100 bg-white/70 backdrop-blur-xl">
            <div className="flex items-center justify-between px-4 md:px-8 h-16 md:h-20">
                {/* Brand / Logo (Visible on mobile to fill space) */}
                <div className="flex md:hidden items-center gap-2 pl-10"> {/* Leave room for sidebar toggle */}
                    <div className="">
                        <div>
                            <h1 className="text-xl font-semibold text-slate-900 tracking-tight">
                                Dexter<span className="text-indigo-600">Hub</span>
                            </h1>
                            {/* <p className="text-[10px] uppercase tracking-widest font-semibold text-slate-400">Education Hub</p> */}
                        </div>
                    </div>
                </div>

                {/* Desktop Search */}
                <div className="hidden md:flex max-w-xl">
                    <div className="relative group w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                        <Input
                            type="search"
                            placeholder="Search for anything..."
                            className="bg-slate-50/50 border-slate-100 pl-10 h-11 rounded-xl focus:bg-white focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all"
                            onChange={(e) => onSearch?.(e.target.value)}
                        />
                    </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 md:gap-4">
                    {/* Mobile Search Toggle */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden text-slate-500 h-10 w-10 rounded-xl"
                        onClick={() => setIsSearchOpen(!isSearchOpen)}
                    >
                        <Search className="w-5 h-5" />
                    </Button>

                    <Button variant="ghost" size="icon" className="relative h-10 w-10 md:h-12 md:w-12 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
                        <Bell className="w-5 h-5 md:w-6 md:h-6" />
                        <span className="absolute top-2.5 right-2.5 md:top-3 md:right-3 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
                    </Button>

                    <div className="h-8 w-px bg-slate-100 mx-1 hidden md:block" />

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="flex items-center gap-2 px-1 md:px-3 h-10 md:h-12 rounded-xl hover:bg-indigo-50 group transition-all">
                                <Avatar className="w-8 h-8 md:w-9 md:h-9 border-2 border-white shadow-sm">
                                    <AvatarImage src={user?.avatar} />
                                    <AvatarFallback className="bg-white text-indigo-600 font-bold text-xs">
                                        {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="text-left hidden lg:block">
                                    <p className="text-sm font-bold text-slate-900 leading-none group-hover:text-indigo-600 transition-colors">{user?.name || 'User'}</p>
                                    <p className="text-[10px] text-slate-400 font-semibold tracking-wide uppercase mt-1">
                                        {user?.email?.split('@')[0] || 'Member'}
                                    </p>
                                </div>
                                <ChevronDown className="w-4 h-4 text-slate-400 hidden lg:block group-hover:text-indigo-600 group-hover:translate-y-0.5 transition-all" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-64 p-2 rounded-2xl border-slate-100 shadow-xl shadow-slate-200/50">
                            <DropdownMenuLabel className="px-4 py-3">
                                <p className="text-sm font-bold text-slate-900">{user?.name}</p>
                                <p className="text-xs font-medium text-slate-500">{user?.email}</p>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-slate-50" />
                            <DropdownMenuItem className="rounded-xl py-3 px-4 font-semibold text-slate-600 focus:bg-indigo-50 focus:text-indigo-600 cursor-pointer">
                                Settings & Privacy
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-xl py-3 px-4 font-semibold text-slate-600 focus:bg-indigo-50 focus:text-indigo-600 cursor-pointer">
                                Learning Preferences
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-slate-50" />
                            <DropdownMenuItem className="rounded-xl py-3 px-4 font-bold text-rose-500 focus:bg-rose-50 focus:text-rose-600 cursor-pointer">
                                Sign Out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Mobile Search Input Overlay */}
            {isSearchOpen && (
                <div className="md:hidden px-4 pb-4 animate-in slide-in-from-top-2 duration-200">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            type="search"
                            autoFocus
                            placeholder="Search your library..."
                            className="bg-slate-50 border-transparent pl-10 h-12 rounded-xl focus:bg-white focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all font-medium"
                            onChange={(e) => onSearch?.(e.target.value)}
                        />
                    </div>
                </div>
            )}
        </header>
    );
}
