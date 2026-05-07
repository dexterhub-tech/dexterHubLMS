'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { api, Cohort } from '@/lib/api';
import { TopHeader } from '@/components/top-header';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
    ChevronLeft, 
    Upload, 
    CheckCircle2, 
    AlertCircle, 
    XCircle, 
    RefreshCcw, 
    FileText, 
    ArrowRight,
    Loader2,
    Search
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

interface EmailComparison {
    email: string;
    status: 'matched' | 'missing' | 'extra';
}

export default function CohortSyncPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { user } = useAuth();
    
    const [cohort, setCohort] = useState<Cohort | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [csvEmails, setCsvEmails] = useState<string[]>([]);
    const [comparison, setComparison] = useState<EmailComparison[]>([]);
    const [isSyncing, setIsSyncing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadCohort();
    }, [id]);

    const loadCohort = async () => {
        try {
            setIsLoading(true);
            const data = await api.getCohort(id);
            setCohort(data);
        } catch (error) {
            toast.error('Failed to load cohort');
            router.push('/admin/cohorts');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            const emails = text
                .split('\n')
                .map(line => line.split(',')[0].trim().toLowerCase())
                .filter(email => email.includes('@'));
            
            setCsvEmails(emails);
            compareEmails(emails, cohort?.allowedLearners || []);
            toast.success(`Parsed ${emails.length} emails from CSV`);
        };
        reader.readAsText(file);
    };

    const compareEmails = (csv: string[], db: string[]) => {
        const allEmails = Array.from(new Set([...csv, ...db]));
        const results: EmailComparison[] = allEmails.map(email => {
            const inCsv = csv.includes(email);
            const inDb = db.includes(email);
            
            if (inCsv && inDb) return { email, status: 'matched' };
            if (inCsv && !inDb) return { email, status: 'missing' };
            return { email, status: 'extra' };
        });
        setComparison(results);
    };

    const handleSync = async (mode: 'append' | 'strict') => {
        if (!cohort) return;

        try {
            setIsSyncing(true);
            let finalEmails: string[] = [];
            
            if (mode === 'append') {
                finalEmails = Array.from(new Set([...(cohort.allowedLearners || []), ...csvEmails]));
            } else {
                finalEmails = csvEmails;
            }

            await api.updateAllowedLearners(id, finalEmails);
            toast.success('Synchronization complete');
            
            // Reload data
            const updatedCohort = await api.getCohort(id);
            setCohort(updatedCohort);
            compareEmails(csvEmails, updatedCohort.allowedLearners || []);
        } catch (error) {
            toast.error('Sync failed');
        } finally {
            setIsSyncing(false);
        }
    };

    const stats = {
        matched: comparison.filter(c => c.status === 'matched').length,
        missing: comparison.filter(c => c.status === 'missing').length,
        extra: comparison.filter(c => c.status === 'extra').length,
    };

    const filteredComparison = comparison.filter(c => 
        c.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="min-h-screen bg-neutral-50/50">
                <TopHeader user={user ? { name: `${user.firstName} ${user.lastName}`, email: user.email } : undefined} />
                <div className="flex h-[calc(100vh-80px)] items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50/50">
            <TopHeader user={user ? { name: `${user.firstName} ${user.lastName}`, email: user.email } : undefined} />

            <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-10">
                {/* Header */}
                <div className="space-y-6">
                    <Button 
                        variant="ghost" 
                        onClick={() => router.back()}
                        className="rounded-xl h-10 px-4 text-slate-500 hover:text-slate-900 transition-colors gap-2"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Back to Management
                    </Button>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-2">
                            <h1 className="text-4xl font-semibold tracking-tight text-slate-900">Sync Platform</h1>
                            <p className="text-muted-foreground text-lg max-w-2xl font-light">
                                Compare database authorized list with your master CSV for <span className="text-indigo-600 font-bold">{cohort?.name}</span>.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Controls & Stats */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="rounded-[32px] border-slate-100 shadow-sm overflow-hidden bg-white">
                            <CardHeader className="p-8 border-b border-slate-50">
                                <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400">Master Source</CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 space-y-8">
                                <div className="space-y-4">
                                    <div className="relative group flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-[24px] p-8 hover:bg-slate-50 transition-all cursor-pointer">
                                        <input
                                            type="file"
                                            accept=".csv"
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            onChange={handleFileUpload}
                                        />
                                        <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4 group-hover:scale-110 transition-transform">
                                            <Upload className="w-7 h-7" />
                                        </div>
                                        <p className="text-sm font-bold text-slate-900 uppercase tracking-widest text-center">
                                            {csvEmails.length > 0 ? 'Change CSV Source' : 'Upload CSV Master'}
                                        </p>
                                    </div>

                                    {csvEmails.length > 0 && (
                                        <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100 flex items-center gap-4">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">CSV Parsed</p>
                                                <p className="text-lg font-black text-slate-900">{csvEmails.length} Emails</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {csvEmails.length > 0 && (
                                    <div className="space-y-3 pt-4 border-t border-slate-50">
                                        <Button 
                                            onClick={() => handleSync('append')}
                                            disabled={isSyncing || stats.missing === 0}
                                            className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black tracking-widest shadow-xl shadow-indigo-100 transition-all active:scale-95"
                                        >
                                            {isSyncing ? <Loader2 className="w-5 h-5 animate-spin" /> : `FIX ${stats.missing} MISSING`}
                                        </Button>
                                        <Button 
                                            variant="ghost"
                                            onClick={() => handleSync('strict')}
                                            disabled={isSyncing}
                                            className="w-full h-14 rounded-2xl text-slate-500 font-bold hover:bg-slate-100"
                                        >
                                            STRICT SYNC TO CSV
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-1 gap-4">
                            {[
                                { label: 'Matched', value: stats.matched, color: 'emerald', icon: CheckCircle2, sub: 'In sync' },
                                { label: 'Missing', value: stats.missing, color: 'rose', icon: AlertCircle, sub: 'Not in database' },
                                { label: 'Extra', value: stats.extra, color: 'amber', icon: XCircle, sub: 'Not in CSV source' }
                            ].map((stat, i) => (
                                <div key={i} className="bg-white rounded-[24px] p-5 border border-slate-100 shadow-sm flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center shadow-sm",
                                            stat.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                                            stat.color === 'rose' ? 'bg-rose-50 text-rose-600' :
                                            'bg-amber-50 text-amber-600'
                                        )}>
                                            <stat.icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                            <p className="text-xl font-black text-slate-900">{stat.value}</p>
                                        </div>
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.sub}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Comparison List */}
                    <div className="lg:col-span-2">
                        <Card className="rounded-[32px] border-slate-100 shadow-sm overflow-hidden bg-white h-full flex flex-col min-h-[600px]">
                            <CardHeader className="p-8 border-b border-slate-50">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div>
                                        <CardTitle className="text-2xl font-bold text-slate-900">Comparison Report</CardTitle>
                                        <CardDescription className="font-medium text-slate-500">Live reconciliation of student identifiers.</CardDescription>
                                    </div>
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <Input 
                                            placeholder="Search email..." 
                                            className="pl-11 h-12 w-64 rounded-2xl bg-slate-50 border-none shadow-inner font-medium"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0 flex-1 overflow-y-auto">
                                {csvEmails.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center p-12 text-center space-y-4">
                                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                                            <RefreshCcw className="w-10 h-10" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Waiting for Source</h3>
                                            <p className="text-slate-500 max-w-xs mx-auto font-medium leading-relaxed">
                                                Upload your master CSV file on the left to begin the reconciliation process.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-50">
                                        {filteredComparison.map((item, index) => (
                                            <div key={index} className="flex items-center justify-between p-6 hover:bg-slate-50/50 transition-colors group">
                                                <div className="flex items-center gap-4">
                                                    <div className={cn(
                                                        "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-sm",
                                                        item.status === 'matched' ? 'bg-emerald-500' :
                                                        item.status === 'missing' ? 'bg-rose-500' :
                                                        'bg-amber-500'
                                                    )}>
                                                        {item.status === 'matched' ? <CheckCircle2 className="w-6 h-6" /> :
                                                         item.status === 'missing' ? <AlertCircle className="w-6 h-6" /> :
                                                         <XCircle className="w-6 h-6" />}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900">{item.email}</p>
                                                        <p className={cn(
                                                            "text-[10px] font-black uppercase tracking-widest",
                                                            item.status === 'matched' ? 'text-emerald-500' :
                                                            item.status === 'missing' ? 'text-rose-500' :
                                                            'text-amber-500'
                                                        )}>
                                                            {item.status} {item.status === 'matched' ? 'in database' : item.status === 'missing' ? 'absent from DB' : 'not in CSV'}
                                                        </p>
                                                    </div>
                                                </div>
                                                
                                                {item.status === 'missing' && (
                                                    <Badge className="bg-rose-50 text-rose-600 border-none font-black text-[9px] uppercase tracking-widest px-3 py-1">
                                                        PENDING ADDITION
                                                    </Badge>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
