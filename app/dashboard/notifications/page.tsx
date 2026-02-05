'use client';

import { useState } from 'react';
import { TopHeader } from '@/components/top-header';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    time: string;
    read: boolean;
}

export default function NotificationsPage() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([
        {
            id: '1',
            title: 'New Assignment Posted',
            message: 'Mrs Diana Smith posted a new assignment in Biography class',
            type: 'info',
            time: '2 hours ago',
            read: false,
        },
        {
            id: '2',
            title: 'Grade Updated',
            message: 'Your quiz score for JavaScript Fundamentals has been updated to 85%',
            type: 'success',
            time: '5 hours ago',
            read: false,
        },
        {
            id: '3',
            title: 'Deadline Approaching',
            message: 'Psychology research paper is due in 3 days',
            type: 'warning',
            time: '1 day ago',
            read: true,
        },
        {
            id: '4',
            title: 'Course Completed',
            message: 'Congratulations! You have completed Web Design Principles',
            type: 'success',
            time: '2 days ago',
            read: true,
        },
        {
            id: '5',
            title: 'Missed Deadline',
            message: 'You missed the deadline for Math Theory assignment',
            type: 'error',
            time: '3 days ago',
            read: true,
        },
    ]);

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

    const getNotificationColor = (type: string) => {
        switch (type) {
            case 'success':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'warning':
                return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'error':
                return 'bg-red-100 text-red-700 border-red-200';
            default:
                return 'bg-blue-100 text-blue-700 border-blue-200';
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'success':
                return '✓';
            case 'warning':
                return '⚠';
            case 'error':
                return '✕';
            default:
                return 'ℹ';
        }
    };

    const NotificationCard = ({ notification }: { notification: Notification }) => (
        <Card
            className={cn(
                "border-border hover:shadow-md transition-all cursor-pointer",
                !notification.read && "bg-primary/5 border-primary/20"
            )}
            onClick={() => markAsRead(notification.id)}
        >
            <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                    <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0",
                        getNotificationColor(notification.type)
                    )}>
                        {getNotificationIcon(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="font-semibold text-foreground">{notification.title}</h3>
                            {!notification.read && (
                                <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2" />
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                        <p className="text-xs text-muted-foreground">{notification.time}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="min-h-screen bg-background">
            <TopHeader user={user ? { name: `${user.firstName} ${user.lastName}`, email: user.email } : undefined} />

            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
                        <p className="text-muted-foreground mt-2">
                            {unreadNotifications.length} unread notifications
                        </p>
                    </div>
                    {unreadNotifications.length > 0 && (
                        <Button onClick={markAllAsRead} variant="outline">
                            Mark all as read
                        </Button>
                    )}
                </div>

                <Tabs defaultValue="all" className="w-full">
                    <TabsList>
                        <TabsTrigger value="all">
                            All ({notifications.length})
                        </TabsTrigger>
                        <TabsTrigger value="unread">
                            Unread ({unreadNotifications.length})
                        </TabsTrigger>
                        <TabsTrigger value="read">
                            Read ({readNotifications.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="mt-6 space-y-3">
                        {notifications.map((notification) => (
                            <NotificationCard key={notification.id} notification={notification} />
                        ))}
                    </TabsContent>

                    <TabsContent value="unread" className="mt-6 space-y-3">
                        {unreadNotifications.length === 0 ? (
                            <Card className="border-border">
                                <CardContent className="pt-6 text-center">
                                    <p className="text-muted-foreground">No unread notifications</p>
                                </CardContent>
                            </Card>
                        ) : (
                            unreadNotifications.map((notification) => (
                                <NotificationCard key={notification.id} notification={notification} />
                            ))
                        )}
                    </TabsContent>

                    <TabsContent value="read" className="mt-6 space-y-3">
                        {readNotifications.length === 0 ? (
                            <Card className="border-border">
                                <CardContent className="pt-6 text-center">
                                    <p className="text-muted-foreground">No read notifications</p>
                                </CardContent>
                            </Card>
                        ) : (
                            readNotifications.map((notification) => (
                                <NotificationCard key={notification.id} notification={notification} />
                            ))
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
