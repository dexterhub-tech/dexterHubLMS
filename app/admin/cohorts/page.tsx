'use client';

import React from "react"
import { useEffect, useState } from 'react';
import { api, Cohort } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Target,
  Clock,
  ArrowRight,
  MoreVertical,
  Activity,
  Layers,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function CohortsManagementPage() {
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingCohort, setEditingCohort] = useState<Cohort | null>(null);
  const [cohortToDelete, setCohortToDelete] = useState<Cohort | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    performanceThreshold: 70,
    weeklyTarget: 10,
    gracePeriodDays: 3,
  });

  useEffect(() => {
    loadCohorts();
  }, []);

  const loadCohorts = async () => {
    try {
      const data = await api.getCohorts();
      setCohorts(data);
    } catch (error) {
      toast.error('Failed to load cohorts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.startDate || !formData.endDate) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      setIsSaving(true);
      if (editingCohort) {
        await api.updateCohort(editingCohort._id, formData);
        toast.success('Cohort updated successfully');
      } else {
        await api.createCohort({
          ...formData,
          status: 'upcoming',
          instructorIds: [],
          learnerIds: [],
          courseIds: [],
        });
        toast.success('Cohort created successfully');
      }
      setIsDialogOpen(false);
      handleReset();
      loadCohorts();
    } catch (error) {
      toast.error(editingCohort ? 'Failed to update cohort' : 'Failed to create cohort');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!cohortToDelete) return;

    try {
      await api.deleteCohort(cohortToDelete._id);
      toast.success('Cohort deleted successfully');
      loadCohorts();
      setIsDeleteDialogOpen(false);
      setCohortToDelete(null);
    } catch (error) {
      toast.error('Failed to delete cohort');
    }
  };

  const handleEdit = (cohort: Cohort) => {
    setEditingCohort(cohort);
    setFormData({
      name: cohort.name,
      description: cohort.description,
      startDate: new Date(cohort.startDate).toISOString().split('T')[0],
      endDate: new Date(cohort.endDate).toISOString().split('T')[0],
      performanceThreshold: cohort.performanceThreshold,
      weeklyTarget: cohort.weeklyTarget,
      gracePeriodDays: cohort.gracePeriodDays,
    });
    setIsDialogOpen(true);
  };

  const handleReset = () => {
    setEditingCohort(null);
    setFormData({
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      performanceThreshold: 70,
      weeklyTarget: 10,
      gracePeriodDays: 3,
    });
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'active':
        return {
          color: 'bg-emerald-50 text-emerald-700 border-emerald-100',
          dot: 'bg-emerald-500'
        };
      case 'upcoming':
        return {
          color: 'bg-blue-50 text-blue-700 border-blue-100',
          dot: 'bg-blue-500'
        };
      case 'completed':
        return {
          color: 'bg-slate-50 text-slate-700 border-slate-200',
          dot: 'bg-slate-400'
        };
      default:
        return {
          color: 'bg-slate-50 text-slate-700 border-slate-200',
          dot: 'bg-slate-400'
        };
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 space-y-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-end">
          <div className="space-y-3">
            <div className="h-8 bg-slate-200 animate-pulse rounded-lg w-48" />
            <div className="h-4 bg-slate-100 animate-pulse rounded w-32" />
          </div>
          <div className="h-10 bg-slate-200 animate-pulse rounded-xl w-32" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 bg-slate-50 animate-pulse rounded-[32px] border border-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-10">

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200/60">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-blue-50 text-blue-700 border-blue-100 px-3 py-1 text-[10px] font-semibold tracking-tight uppercase">Management</Badge>
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900">Academic Cohorts</h1>
          <p className="text-muted-foreground mt-2 max-w-xl text-lg">
            Create, monitor, and manage learning groups and their performance targets.
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) handleReset();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all hover:shadow-md rounded-xl h-12 px-6">
              <Plus className="w-5 h-5 mr-2" />
              Create Cohort
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-white rounded-[32px] border-none shadow-2xl p-0 overflow-hidden">
            <div className="bg-indigo-600 p-8 text-white">
              <DialogHeader>
                <DialogTitle className="text-2xl font-semibold">
                  {editingCohort ? 'Edit Cohort' : 'New Learning Group'}
                </DialogTitle>
                <DialogDescription className="text-indigo-100 opacity-90">
                  Set the schedule and targets for this group.
                </DialogDescription>
              </DialogHeader>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1">Cohort Name</label>
                  <Input
                    placeholder="e.g., Summer Intensive Flow 2024"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="h-12 rounded-xl bg-slate-50 border-slate-100 focus:bg-white transition-all"
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1">Description</label>
                  <Textarea
                    placeholder="What is this cohort about?"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="min-h-24 rounded-xl bg-slate-50 border-slate-100 focus:bg-white transition-all resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="grid gap-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1">Start Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="h-12 pl-10 rounded-xl bg-slate-50 border-slate-100"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1">Graduation Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className="h-12 pl-10 rounded-xl bg-slate-50 border-slate-100"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 p-5 bg-slate-50 rounded-[24px] border border-slate-100">
                  <div className="space-y-2">
                    <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Min. Performance</label>
                    <div className="relative">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.performanceThreshold}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            performanceThreshold: parseInt(e.target.value),
                          })
                        }
                        className="h-10 rounded-lg bg-white border-slate-200 pr-8"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">%</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Weekly Target</label>
                    <div className="relative">
                      <Input
                        type="number"
                        min="1"
                        value={formData.weeklyTarget}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            weeklyTarget: parseInt(e.target.value),
                          })
                        }
                        className="h-10 rounded-lg bg-white border-slate-200 pr-8"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-400">HRS</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Grace Period</label>
                    <div className="relative">
                      <Input
                        type="number"
                        min="0"
                        value={formData.gracePeriodDays}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            gracePeriodDays: parseInt(e.target.value),
                          })
                        }
                        className="h-10 rounded-lg bg-white border-slate-200 pr-8"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-400">DAYS</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsDialogOpen(false)}
                  className="rounded-xl h-12 px-6"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700 rounded-xl h-12 px-8 font-semibold text-white shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5">
                  {isSaving ? 'Saving...' : (editingCohort ? 'Save Changes' : 'Create Cohort')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Cohorts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {cohorts.map((cohort) => {
          const statusInfo = getStatusInfo(cohort.status);
          return (
            <Card key={cohort._id} className="group relative bg-white rounded-[32px] border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full bg-slate-50 hover:bg-slate-100">
                      <MoreVertical className="w-4 h-4 text-slate-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 rounded-2xl p-2 shadow-xl border-slate-100">
                    <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-3 py-2">Actions</DropdownMenuLabel>
                    <DropdownMenuItem
                      onClick={() => handleEdit(cohort)}
                      className="rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 cursor-pointer hover:bg-slate-50 focus:bg-slate-50 transition-colors gap-2"
                    >
                      <Edit2 className="w-4 h-4 text-indigo-500" />
                      Edit Details
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-slate-50 mx-2" />
                    <DropdownMenuItem
                      onClick={() => {
                        setCohortToDelete(cohort);
                        setIsDeleteDialogOpen(true);
                      }}
                      className="rounded-xl px-3 py-2.5 text-sm font-medium text-rose-600 cursor-pointer hover:bg-rose-50 focus:bg-rose-50 transition-colors gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Cohort
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <CardHeader className="p-8 pb-4">
                <div className="flex items-center gap-3 mb-4">
                  <Badge className={cn("rounded-full px-3 py-0.5 text-[10px] font-semibold uppercase tracking-widest border transition-colors", statusInfo.color)}>
                    <span className={cn("w-1.5 h-1.5 rounded-full mr-2 inline-block", statusInfo.dot)} />
                    {cohort.status}
                  </Badge>
                  <Badge variant="outline" className="rounded-full text-[10px] font-semibold border-slate-100 bg-slate-50/50 text-slate-400">
                    ID: {cohort._id?.toString().slice(-6)}
                  </Badge>
                </div>
                <CardTitle className="text-2xl font-semibold text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">
                  {cohort.name}
                </CardTitle>
                <CardDescription className="text-slate-500 line-clamp-2 mt-2 leading-relaxed">
                  {cohort.description || "No description provided for this cohort."}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-8 pt-4 space-y-8">
                <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                  <div className="space-y-1">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                      <Users className="w-3 h-3" /> Talent Pool
                    </p>
                    <p className="text-xl font-semibold text-slate-800">{cohort.learnerIds.length} <span className="text-sm font-medium text-slate-400">Learners</span></p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 flex items-center gap-1.5 justify-end">
                      Academic Staff <Layers className="w-3 h-3" />
                    </p>
                    <p className="text-xl font-semibold text-slate-800">{cohort.instructorIds.length} <span className="text-sm font-medium text-slate-400">Mentors</span></p>
                  </div>

                  <div className="col-span-2 bg-slate-50/80 rounded-2xl p-4 border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-indigo-600 shadow-sm border border-slate-100">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-tighter">Timeline</p>
                        <p className="text-xs font-semibold text-slate-700">
                          {new Date(cohort.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} — {new Date(cohort.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-tighter">Threshold</p>
                      <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-indigo-100 font-semibold text-xs">{cohort.performanceThreshold}% Score</Badge>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={() => handleEdit(cohort)}
                    variant="outline"
                    className="flex-1 rounded-2xl h-11 border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50"
                  >
                    Edit Config
                  </Button>
                  <Button
                    className="flex-1 rounded-2xl h-11 bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 group"
                  >
                    Manage Learners
                    <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {cohorts.length === 0 && (
        <Card className="border-dashed border-2 border-slate-200 bg-transparent rounded-[40px] shadow-none">
          <CardContent className="py-24 text-center space-y-6">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-slate-300" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-slate-800 tracking-tight">Expand the ecosystem</p>
              <p className="text-slate-500 mt-2 max-w-sm mx-auto">You haven't created any cohorts yet. Start by creating your first academic group.</p>
            </div>
            <Button onClick={() => setIsDialogOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 rounded-xl px-8 h-12 shadow-xl shadow-indigo-100">
              Create First Cohort
            </Button>
          </CardContent>
        </Card>
      )}
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-[32px] border-none shadow-2xl p-8">
          <AlertDialogHeader>
            <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <AlertDialogTitle className="text-2xl font-semibold text-slate-900">Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 text-base leading-relaxed">
              This action cannot be undone. This will permanently delete the cohort
              <span className="font-semibold text-slate-900 mx-1">"{cohortToDelete?.name}"</span>
              and remove all associated data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 mt-8">
            <AlertDialogCancel className="rounded-xl h-12 px-6 border-slate-200 text-slate-600 font-semibold hover:bg-slate-50">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="rounded-xl h-12 px-8 bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-lg shadow-rose-100 transition-all"
            >
              Delete Cohort
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
