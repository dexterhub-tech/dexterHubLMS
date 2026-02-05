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
import { Users, Plus, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function CohortsManagementPage() {
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCohort, setEditingCohort] = useState<Cohort | null>(null);
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
      if (editingCohort) {
        // Update logic would go here
        toast.success('Cohort updated');
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
      setFormData({
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        performanceThreshold: 70,
        weeklyTarget: 10,
        gracePeriodDays: 3,
      });
      loadCohorts();
    } catch (error) {
      toast.error('Failed to save cohort');
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-700 dark:text-green-400';
      case 'upcoming':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400';
      case 'completed':
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
      default:
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-muted animate-pulse rounded w-1/3" />
        <div className="grid gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-40 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Cohorts</h1>
          <p className="text-muted-foreground mt-2">{cohorts.length} total cohorts</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) handleReset();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 gap-2">
              <Plus className="w-4 h-4" />
              New Cohort
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCohort ? 'Edit Cohort' : 'Create New Cohort'}
              </DialogTitle>
              <DialogDescription>
                Configure cohort settings and targets
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Cohort Name *</label>
                <Input
                  placeholder="e.g., Cohort 2024-Q1"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Describe the cohort..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="min-h-24"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Start Date *</label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">End Date *</label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Performance Threshold (%)</label>
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
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Weekly Target (hours)</label>
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
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Grace Period (days)</label>
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
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    handleReset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-primary hover:bg-primary/90">
                  {editingCohort ? 'Update Cohort' : 'Create Cohort'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Cohorts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {cohorts.map((cohort) => (
          <Card key={cohort._id} className="border-border/50">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-foreground">{cohort.name}</h3>
                    <Badge className={getStatusColor(cohort.status)}>
                      {cohort.status.charAt(0).toUpperCase() + cohort.status.slice(1)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{cohort.description}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(cohort)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Learners</p>
                  <p className="font-semibold">{cohort.learnerIds.length}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Instructors</p>
                  <p className="font-semibold">{cohort.instructorIds.length}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Start Date</p>
                  <p className="font-semibold text-xs">
                    {new Date(cohort.startDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">End Date</p>
                  <p className="font-semibold text-xs">
                    {new Date(cohort.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-border/50 flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                  View Learners
                </Button>
                <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                  Manage
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {cohorts.length === 0 && (
        <Card className="border-border/50">
          <CardContent className="pt-12 text-center space-y-3">
            <Users className="w-12 h-12 text-muted-foreground mx-auto opacity-50" />
            <p className="text-muted-foreground">No cohorts yet</p>
            <p className="text-sm text-muted-foreground">Create your first cohort to get started</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
