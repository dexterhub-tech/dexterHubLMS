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
  Mail,
  Search,
  Trash2,
  ShieldCheck,
  LayoutGrid,
  TrendingUp,
  AlertCircle,
  Plus,
  Upload,
  FileText
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

  const filteredEmails = (cohort.allowedLearners || []).filter(email => 
    email.toLowerCase().includes(searchQuery.toLowerCase())
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

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-semibold tracking-tight text-slate-900">{cohort.name}</h1>
              <Badge className={cn(
                "rounded-full px-3 py-0.5 text-[10px] font-semibold uppercase tracking-widest border",
                cohort.status === 'active' ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                cohort.status === 'upcoming' ? "bg-blue-50 text-blue-700 border-blue-100" :
                "bg-slate-50 text-slate-700 border-slate-200"
              )}>
                {cohort.status}
              </Badge>
            </div>
            <p className="text-muted-foreground text-lg max-w-2xl">
              {cohort.description || "Detailed management and access control for this learning cycle."}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Stats & Metadata */}
        <div className="lg:col-span-1 space-y-8">
          <Card className="rounded-2xl border-slate-100 shadow-sm overflow-hidden bg-white">
            <CardHeader className="p-8 border-b border-slate-50">
              <CardTitle className="text-sm font-semibold uppercase tracking-widest text-slate-400">Cohort Overview</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm">
                  <LayoutGrid className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Enrolled Learners</p>
                  <p className="text-2xl font-semibold text-slate-900">{cohort.learnerIds?.length || 0}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target Threshold</p>
                  <p className="text-2xl font-semibold text-slate-900">{cohort.performanceThreshold}% Score</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Timeline</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {new Date(cohort.startDate).toLocaleDateString()} - {new Date(cohort.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-600 shadow-sm">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Weekly Target</p>
                  <p className="text-xl font-semibold text-slate-900">{cohort.weeklyTarget} Hours</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-100 shadow-sm overflow-hidden bg-slate-900 text-white">
            <CardContent className="p-8 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-lg tracking-tight">Access Control</h3>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                Registration for this cohort is restricted to the specific emails listed on the right. If the list is empty, registration is open to all platform users.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Authorized Emails List */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-2xl border-slate-100 shadow-sm overflow-hidden bg-white min-h-[600px] flex flex-col">
            <CardHeader className="p-10 border-b border-slate-50">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <CardTitle className="text-2xl font-semibold text-slate-900 flex items-center gap-3">
                    Authorized List
                    <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none px-3 py-1 text-xs">
                      {cohort.allowedLearners?.length || 0} Emails
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-slate-500 mt-1">Manage who can register for this cohort.</CardDescription>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <form onSubmit={handleAddSingleEmail} className="flex gap-2">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input 
                        placeholder="Add single email..."
                        className="h-11 pl-10 w-64 rounded-xl bg-slate-50 border-slate-100 focus:bg-white transition-all shadow-inner"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        disabled={isUpdating}
                      />
                    </div>
                    <Button 
                      type="submit" 
                      disabled={isUpdating || !newEmail}
                      className="h-11 rounded-xl bg-slate-900 text-white hover:bg-black gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </Button>
                  </form>

                  <Dialog open={isCsvModalOpen} onOpenChange={setIsCsvModalOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="h-11 rounded-xl border-slate-200 text-slate-600 gap-2 hover:bg-slate-50">
                        <Upload className="w-4 h-4" />
                        Upload CSV
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[450px] rounded-2xl border-none shadow-2xl p-0 overflow-hidden bg-white">
                      <form onSubmit={handleUploadCsv}>
                        <div className="bg-slate-900 p-8 text-white">
                          <DialogHeader>
                            <DialogTitle className="text-2xl font-semibold uppercase tracking-tight">Bulk Upload</DialogTitle>
                            <DialogDescription className="text-slate-400 font-medium text-sm">
                              Upload a CSV file containing a list of authorized emails.
                            </DialogDescription>
                          </DialogHeader>
                        </div>

                        <div className="p-8 space-y-6">
                          <div className="space-y-4">
                            <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-8 hover:bg-slate-50 transition-all cursor-pointer relative group">
                              <input
                                type="file"
                                accept=".csv"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                              />
                              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4 group-hover:scale-110 transition-transform">
                                <Upload className="w-6 h-6" />
                              </div>
                              <p className="text-sm font-bold text-slate-900 uppercase tracking-widest">
                                {csvFile ? csvFile.name : 'Select CSV File'}
                              </p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">
                                Format: email@domain.com (First column)
                              </p>
                            </div>

                            {csvFile && (
                              <div className="bg-emerald-50 rounded-xl p-4 flex items-center gap-3 border border-emerald-100">
                                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-emerald-500 shadow-sm">
                                  <FileText className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">File Ready</p>
                                  <p className="text-xs font-bold text-slate-900 truncate">{csvFile.name}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <DialogFooter className="bg-slate-50 p-8 border-t border-slate-100 gap-3">
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setIsCsvModalOpen(false)}
                            className="rounded-xl h-12 px-6"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            disabled={isUploading || !csvFile}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl h-12 px-8 shadow-lg shadow-indigo-100 transition-all"
                          >
                            {isUploading ? 'Processing...' : 'Apply List'}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>

                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                      placeholder="Search list..."
                      className="h-11 pl-10 w-48 rounded-xl bg-slate-50 border-slate-100 focus:bg-white transition-all shadow-inner"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={handleClearAll}
                    disabled={isUpdating || !cohort.allowedLearners || cohort.allowedLearners.length === 0}
                    className="h-11 rounded-xl border-rose-100 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                  >
                    Clear All
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-auto">
              {filteredEmails.length > 0 ? (
                <div className="divide-y divide-slate-50">
                  {filteredEmails.map((email, index) => (
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
