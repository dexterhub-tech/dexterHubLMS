'use client';

import React, { useEffect, useState, use } from 'react';
import { api, Cohort } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Users,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  Mail,
  Search,
  Trash2,
  ShieldCheck,
  LayoutGrid,
  TrendingUp,
  AlertCircle,
  Plus,
  Upload,
  FileText,
  RefreshCcw
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';

export default function AdminCohortDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [cohort, setCohort] = useState<Cohort | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadCohort();
  }, [id]);

  const loadCohort = async () => {
    try {
      setIsLoading(true);
      const data = await api.getCohort(id);
      setCohort(data);
    } catch (error) {
      toast.error('Failed to load cohort details');
      router.push('/admin/cohorts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveEmail = async (emailToRemove: string) => {
    if (!cohort || !cohort.allowedLearners) return;
    
    try {
      setIsUpdating(true);
      const updatedEmails = cohort.allowedLearners.filter(email => email !== emailToRemove);
      await api.updateAllowedLearners(id, updatedEmails);
      setCohort({ ...cohort, allowedLearners: updatedEmails });
      toast.success('Email removed successfully');
    } catch (error) {
      toast.error('Failed to update authorized list');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddSingleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !cohort) return;
    if (!newEmail.includes('@')) {
      toast.error('Please enter a valid email');
      return;
    }

    const currentList = cohort.allowedLearners || [];
    if (currentList.includes(newEmail)) {
      toast.error('Email is already in the list');
      return;
    }

    try {
      setIsUpdating(true);
      const updatedList = [...currentList, newEmail];
      await api.updateAllowedLearners(id, updatedList);
      setCohort({ ...cohort, allowedLearners: updatedList });
      setNewEmail('');
      toast.success('Email added successfully');
    } catch (error) {
      toast.error('Failed to add email');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUploadCsv = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile || !cohort) return;

    try {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onload = async (event) => {
        const text = event.target?.result as string;
        const emails = text
          .split('\n')
          .map(line => line.split(',')[0].trim())
          .filter(email => email.includes('@'));

        if (emails.length === 0) {
          toast.error('No valid emails found in CSV');
          setIsUploading(false);
          return;
        }

        const currentList = cohort.allowedLearners || [];
        // Unique emails only
        const updatedList = Array.from(new Set([...currentList, ...emails]));
        
        try {
          await api.updateAllowedLearners(id, updatedList);
          setCohort({ ...cohort, allowedLearners: updatedList });
          setCsvFile(null);
          setIsCsvModalOpen(false);
          toast.success(`Successfully added ${emails.length} emails`);
        } catch (error) {
          toast.error('Failed to update cohort with CSV data');
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsText(csvFile);
    } catch (error) {
      toast.error('Failed to read CSV file');
      setIsUploading(false);
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to clear the entire authorized list? Access will be open to all registered users.')) return;
    
    try {
      setIsUpdating(true);
      await api.updateAllowedLearners(id, []);
      setCohort(prev => prev ? { ...prev, allowedLearners: [] } : null);
      toast.success('Authorized list cleared');
    } catch (error) {
      toast.error('Failed to clear list');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 space-y-8 max-w-7xl mx-auto">
        <div className="h-8 bg-slate-200 animate-pulse rounded-lg w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 h-96 bg-slate-50 animate-pulse rounded-[32px]" />
          <div className="lg:col-span-2 h-96 bg-slate-50 animate-pulse rounded-[32px]" />
        </div>
      </div>
    );
  }

  if (!cohort) return null;

  const allFilteredEmails = (cohort.allowedLearners || []).filter(email => 
    email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(allFilteredEmails.length / itemsPerPage);
  const displayedEmails = allFilteredEmails.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-10">
      {/* Back Button & Header */}
      <div className="space-y-6">
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="rounded-xl h-10 px-4 text-slate-500 hover:text-slate-900 transition-colors gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Cohorts
        </Button>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200/60">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl md:text-2xl font-bold tracking-tight text-slate-900">{cohort.name}</h1>
            <Badge className={cn(
              "rounded-full px-3 py-0.5 text-[9px] font-bold uppercase tracking-widest border shadow-none",
              cohort.status === 'active' ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
              cohort.status === 'upcoming' ? "bg-indigo-50 text-indigo-700 border-indigo-100" :
              "bg-slate-50 text-slate-600 border-slate-200"
            )}>
              {cohort.status}
            </Badge>
          </div>
          <p className="text-slate-500 text-base md:text-lg font-light leading-relaxed max-w-2xl">
            {cohort.description || "Detailed management and access control for this learning cycle."}
          </p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: 'Enrolled Learners', value: cohort.learnerIds?.length || 0, icon: Users, color: 'indigo' },
          { label: 'Performance Goal', value: `${cohort.performanceThreshold}%`, icon: TrendingUp, color: 'emerald' },
          { label: 'Weekly Target', value: `${cohort.weeklyTarget}h`, icon: Clock, color: 'amber' },
          { label: 'Days Remaining', value: Math.max(0, Math.ceil((new Date(cohort.endDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24))), icon: Calendar, color: 'violet' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className={cn(
                "p-3 rounded-2xl transition-colors",
                stat.color === 'indigo' ? 'bg-indigo-50 text-indigo-600' :
                stat.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                stat.color === 'amber' ? 'bg-amber-50 text-amber-600' :
                'bg-violet-50 text-violet-600'
              )}>
                <stat.icon className="w-5 h-5" />
              </div>
              <Badge variant="ghost" className="text-[10px] font-bold text-slate-300 uppercase tracking-widest p-0">Metrics</Badge>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

        <div className="space-y-6">
          <Card className="rounded-[32px] border-slate-100 shadow-sm overflow-hidden bg-white min-h-[600px] flex flex-col">
            <CardHeader className="p-8 md:p-10 border-b border-slate-50 space-y-8">
              {/* Header Row */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-2xl font-bold text-slate-900">Authorized List</CardTitle>
                    <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100/50 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest">
                      {cohort.allowedLearners?.length || 0} Emails
                    </Badge>
                  </div>
                  <CardDescription className="text-slate-500 font-medium">Manage access control for this cycle.</CardDescription>
                </div>
                
                <div className="flex items-center gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => router.push(`/admin/cohorts/${id}/sync`)}
                    className="rounded-xl border-indigo-100 bg-indigo-50/50 text-indigo-700 hover:bg-indigo-100 h-10 font-bold text-[10px] uppercase tracking-widest px-5 shadow-none transition-all active:scale-95"
                  >
                    <RefreshCcw className="w-4 h-4 mr-2" />
                    Sync Platform
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleClearAll}
                    disabled={isUpdating || !cohort.allowedLearners || cohort.allowedLearners.length === 0}
                    className="h-10 rounded-xl border-rose-100 text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-bold text-[10px] uppercase tracking-widest px-5"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear List
                  </Button>
                </div>
              </div>

              {/* Toolbar Row */}
              <div className="flex flex-col lg:flex-row items-center gap-4 bg-slate-50/50 p-2 rounded-2xl border border-slate-100">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    placeholder="Search current list..."
                    className="h-12 pl-11 w-full rounded-xl bg-transparent border-none focus-visible:ring-0 text-sm font-medium"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-2 w-full lg:w-auto p-1 bg-white rounded-xl shadow-sm border border-slate-100">
                  <form onSubmit={handleAddSingleEmail} className="flex flex-1 w-full sm:w-auto">
                    <div className="relative flex-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <Input 
                        placeholder="Add single email..."
                        className="h-10 pl-9 w-full sm:w-64 border-none shadow-none focus-visible:ring-0 text-xs font-medium"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        disabled={isUpdating}
                      />
                    </div>
                    <Button 
                      type="submit" 
                      disabled={isUpdating || !newEmail}
                      className="h-10 rounded-lg bg-slate-900 text-white hover:bg-black px-4 font-bold text-[10px] uppercase tracking-widest"
                    >
                      Add
                    </Button>
                  </form>
                  <div className="hidden sm:block h-6 w-px bg-slate-100 mx-1" />
                  <Dialog open={isCsvModalOpen} onOpenChange={setIsCsvModalOpen}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" className="h-10 w-full sm:w-auto rounded-lg text-slate-600 hover:bg-slate-50 px-4 font-bold text-[10px] uppercase tracking-widest">
                        <Upload className="w-3.5 h-3.5 mr-2" />
                        Bulk Upload
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[450px] rounded-[32px] border-none shadow-2xl p-0 overflow-hidden bg-white">
                      <form onSubmit={handleUploadCsv}>
                        <div className="bg-slate-900 p-10 text-white">
                          <DialogHeader>
                            <DialogTitle className="text-2xl font-bold uppercase tracking-tight">Bulk Upload</DialogTitle>
                            <DialogDescription className="text-slate-400 font-medium text-sm mt-2">
                              Import a CSV list to authorize multiple learners at once.
                            </DialogDescription>
                          </DialogHeader>
                        </div>

                        <div className="p-8 space-y-6">
                          <div className="space-y-4">
                            <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-[24px] p-10 hover:bg-slate-50 transition-all cursor-pointer relative group">
                              <input
                                type="file"
                                accept=".csv"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                              />
                              <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4 group-hover:scale-110 transition-transform">
                                <Upload className="w-7 h-7" />
                              </div>
                              <p className="text-sm font-bold text-slate-900 uppercase tracking-widest">
                                {csvFile ? csvFile.name : 'Select CSV File'}
                              </p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">
                                email@domain.com (column A)
                              </p>
                            </div>

                            {csvFile && (
                              <div className="bg-emerald-50 rounded-2xl p-4 flex items-center gap-4 border border-emerald-100">
                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-emerald-500 shadow-sm border border-emerald-50">
                                  <FileText className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Ready to Sync</p>
                                  <p className="text-sm font-bold text-slate-900 truncate">{csvFile.name}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <DialogFooter className="bg-slate-50 p-8 pt-6 border-t border-slate-100 gap-3">
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setIsCsvModalOpen(false)}
                            className="rounded-2xl h-14 px-8 font-bold text-slate-500 hover:bg-slate-100"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            disabled={isUploading || !csvFile}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl h-14 px-10 shadow-xl shadow-indigo-100 transition-all active:scale-95 tracking-widest text-xs"
                          >
                            {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'APPLY LIST'}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 flex flex-col">
              {displayedEmails.length > 0 ? (
                <>
                  <div className="divide-y divide-slate-50 flex-1">
                    {displayedEmails.map((email, index) => (
                      <div key={index} className="flex items-center justify-between p-6 hover:bg-slate-50/50 transition-colors group">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500">
                            <Mail className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{email}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Authorized Learner</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveEmail(email)}
                          disabled={isUpdating}
                          className="rounded-xl text-slate-300 hover:text-rose-600 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {/* Pagination Footer */}
                  {totalPages > 1 && (
                    <div className="p-6 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Page {currentPage} of {totalPages}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(p => p - 1)}
                          className="h-8 w-8 p-0 rounded-lg border-slate-200"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <div className="flex items-center gap-1">
                           {[...Array(totalPages)].map((_, i) => (
                             <Button
                               key={i}
                               variant={currentPage === i + 1 ? 'default' : 'ghost'}
                               size="sm"
                               onClick={() => setCurrentPage(i + 1)}
                               className={cn(
                                 "h-8 w-8 p-0 rounded-lg text-[10px] font-bold",
                                 currentPage === i + 1 ? "bg-slate-900 text-white" : "text-slate-400"
                               )}
                             >
                               {i + 1}
                             </Button>
                           )).slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage(p => p + 1)}
                          className="h-8 w-8 p-0 rounded-lg border-slate-200"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-2">
                    <Mail className="w-10 h-10" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xl font-semibold text-slate-900">No Authorized Emails</h4>
                    <p className="text-slate-500 max-w-sm">
                      {searchQuery ? "No results match your search." : "This cohort is currently open to all registered learners."}
                    </p>
                  </div>
                  {!searchQuery && (
                    <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-2 rounded-xl text-xs font-semibold border border-amber-100">
                      <AlertCircle className="w-4 h-4" />
                      Open Enrollment Active
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
