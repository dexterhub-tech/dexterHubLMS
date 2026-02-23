'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TopHeader } from '@/components/top-header';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Bell, CheckCheck, Info, AlertTriangle, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    time: string;
    read: boolean;
    link?: string;
}

export default function NotificationsPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchNotifications = async () => {
            if (!user) {
                setIsLoading(false);
                return;
            }
            try {
                setIsLoading(true);
                const data = await api.getLearnerNotifications(user.id);
                setNotifications(data);
            } catch (error) {
                console.error('Failed to fetch notifications:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchNotifications();
    }, [user]);

    const unreadNotifications = notifications.filter(n => !n.read);
    const readNotifications = notifications.filter(n => n.read);

    const markAsRead = (id: string) => {
        setNotifications(notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
        ));
    };

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    const handleNotificationClick = (notification: Notification) => {
        markAsRead(notification.id);
        if (notification.link) {
            router.push(notification.link);
        }
    };

    const getNotificationStyles = (type: string) => {
        switch (type) {
            case 'success':
                return { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' };
            case 'warning':
                return { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' };
            case 'error':
                return { icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100' };
            default:
                return { icon: Info, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' };
        }
    };

    const NotificationCard = ({ notification }: { notification: Notification }) => {
        const style = getNotificationStyles(notification.type);
        const Icon = style.icon;

        return (
            <div
                onClick={() => handleNotificationClick(notification)}
                className={cn(
                    "group flex items-start gap-4 p-5 bg-white rounded-[24px] border border-slate-100 hover:shadow-md hover:border-indigo-100 transition-all cursor-pointer relative overflow-hidden",
                    !notification.read && "border-l-4 border-l-indigo-500 shadow-sm"
                )}
            >
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0", style.bg, style.color)}>
                    <Icon className="w-6 h-6" />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-1">
                        <h3 className={cn("font-bold text-slate-900 leading-tight uppercase tracking-tight", !notification.read ? "text-slate-900" : "text-slate-600")}>
                            {notification.title}
                        </h3>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap mt-1">
                            {new Date(notification.time).toLocaleDateString()}
                        </span>
                    </div>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed mb-3">
                        {notification.message}
                    </p>
                    {notification.link && (
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-indigo-600 uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                            View Details <ArrowRight className="w-3 h-3" />
                        </div>
                    )}
                </div>
                {!notification.read && (
                    <div className="absolute top-4 right-4 w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                )}
            </div>
        );
    };

    const EmptyNotifications = ({ message }: { message: string }) => (
        <div className="flex flex-col items-center justify-center py-24 px-4 text-center bg-white rounded-[32px] border border-dashed border-slate-200">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <Bell className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tight mb-2">Clean Slate!</h3>
            <p className="text-slate-400 font-medium max-w-xs uppercase text-xs tracking-widest leading-relaxed">
                {message}
            </p>
        </div>
    );

    return (
        <div className="min-h-screen bg-neutral-50/50">
            <TopHeader user={user ? { name: `${user.firstName} ${user.lastName}`, email: user.email } : undefined} />

            <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200/60">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900 uppercase">Updates & Alerts</h1>
                        <p className="text-muted-foreground mt-2 max-w-xl text-sm md:text-lg font-medium">
                            Stay informed about your assignments, grades, and upcoming events.
                        </p>
                    </div>
                    {unreadNotifications.length > 0 && (
                        <Button
                            onClick={markAllAsRead}
                            variant="outline"
                            className="rounded-2xl border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-widest h-10 px-6 hover:bg-slate-50"
                        >
                            <CheckCheck className="w-4 h-4 mr-2" />
                            Mark all as read
                        </Button>
                    )}
                </div>

                <Tabs defaultValue="all" className="w-full">
                    <TabsList className="bg-slate-100/50 p-1 mb-8 rounded-2xl w-full md:w-auto flex overflow-x-auto no-scrollbar justify-start gap-1">
                        <TabsTrigger value="all" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 py-2.5 text-xs font-bold uppercase tracking-widest">
                            All ({notifications.length})
                        </TabsTrigger>
                        <TabsTrigger value="unread" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 py-2.5 text-xs font-bold uppercase tracking-widest">
                            Unread ({unreadNotifications.length})
                        </TabsTrigger>
                        <TabsTrigger value="read" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 py-2.5 text-xs font-bold uppercase tracking-widest">
                            Archive ({readNotifications.length})
                        </TabsTrigger>
                    </TabsList>

                    {isLoading ? (
                        <div className="py-20 flex flex-col items-center gap-4">
                            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Syncing feeds...</p>
                        </div>
                    ) : (
                        <>
                            <TabsContent value="all" className="space-y-4">
                                {notifications.length > 0 ? (
                                    notifications.map((notification) => (
                                        <NotificationCard key={notification.id} notification={notification} />
                                    ))
                                ) : (
                                    <EmptyNotifications message="You don't have any notifications at the moment." />
                                )}
                            </TabsContent>

                            <TabsContent value="unread" className="space-y-4">
                                {unreadNotifications.length > 0 ? (
                                    unreadNotifications.map((notification) => (
                                        <NotificationCard key={notification.id} notification={notification} />
                                    ))
                                ) : (
                                    <EmptyNotifications message="You've caught up with everything!" />
                                )}
                            </TabsContent>

                            <TabsContent value="read" className="space-y-4">
                                {readNotifications.length > 0 ? (
                                    readNotifications.map((notification) => (
                                        <NotificationCard key={notification.id} notification={notification} />
                                    ))
                                ) : (
                                    <EmptyNotifications message="No archived notifications to show." />
                                )}
                            </TabsContent>
                        </>
                    )}
                </Tabs>
            </div>
        </div>
    );
}
