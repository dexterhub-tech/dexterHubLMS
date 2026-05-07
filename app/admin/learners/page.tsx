'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Users,
  Search,
  MoreHorizontal,
  GraduationCap,
  TrendingUp,
  Award,
  BookOpen,
  Mail,
  Filter,
  CheckCircle2,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { StatCard } from '@/components/stat-card';
import { toast } from 'sonner';

interface Learner {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  status: string;
  activeCohortId?: any;
  createdAt: string;
  performance?: number; // Simulated
  progress?: number; // Simulated
}

export default function LearnersAdminPage() {
  const [learners, setLearners] = useState<Learner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadLearners();
  }, []);

  const loadLearners = async () => {
    try {
      setIsLoading(true);
      const users = await api.getAllUsers();
      const filtered = users.filter((u: any) => u.role === 'learner');
      
      // Add some mock data for performance/progress
      const enriched = filtered.map((l: any) => ({
        ...l,
        performance: Math.floor(Math.random() * 30) + 70, // 70-100
        progress: Math.floor(Math.random() * 100)
      }));
      
      setLearners(enriched);
    } catch (error) {
      toast.error('Failed to load learners');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLearners = learners.filter((l) => 
    `${l.firstName} ${l.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-8 space-y-8 animate-pulse">
        <div className="h-10 bg-slate-200 rounded-lg w-1/3" />
        <div className="h-96 bg-slate-100 rounded-[32px]" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200/60">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest">Student Success</Badge>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Learner Directory</h1>
          <p className="text-slate-500 mt-2 max-w-xl text-lg font-medium">
            Monitor student engagement, track academic performance, and manage cohort enrollments.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-2xl h-14 px-6 border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-all">
            Engagement Report
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-xs shadow-2xl shadow-indigo-200 transition-all active:scale-95">
            Add New Learner
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          label="Total Learners"
          value={learners.length}
          iconColor="text-indigo-600"
          iconBgColor="bg-indigo-50"
        />
        <StatCard
          icon={TrendingUp}
          label="Avg. Performance"
          value="84%"
          iconColor="text-emerald-600"
          iconBgColor="bg-emerald-50"
        />
        <StatCard
          icon={BookOpen}
          label="Active in Cohorts"
          value={learners.filter(l => l.activeCohortId).length}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-50"
        />
        <StatCard
          icon={Award}
          label="Certificates Issued"
          value="12"
          iconColor="text-amber-600"
          iconBgColor="bg-amber-50"
        />
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by name, email or cohort..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-14 rounded-[20px] bg-white border-none shadow-sm focus:ring-4 focus:ring-indigo-50 transition-all font-medium"
            />
          </div>
          <div className="flex gap-3">
             <Button variant="outline" className="h-14 rounded-2xl border-slate-200 px-6 font-bold text-slate-600">
                <Filter className="w-4 h-4 mr-2" />
                Filter by Status
             </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-50">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Student Identity</th>
                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Performance</th>
                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Course Progress</th>
                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Status</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredLearners.map((learner) => (
                <tr key={learner._id} className="group hover:bg-slate-50/50 transition-all">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12 rounded-2xl border-2 border-white shadow-md">
                        <AvatarImage src={learner.avatar} />
                        <AvatarFallback className="bg-emerald-50 text-emerald-600 font-black">
                          {learner.firstName[0]}{learner.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {learner.firstName} {learner.lastName}
                        </p>
                        <p className="text-xs text-slate-400 font-bold tracking-tight uppercase tracking-widest opacity-60">{learner.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex flex-col items-center gap-1">
                      <span className={cn(
                        "text-sm font-black",
                        learner.performance! >= 90 ? "text-emerald-600" : 
                        learner.performance! >= 80 ? "text-indigo-600" : "text-amber-600"
                      )}>
                        {learner.performance}%
                      </span>
                      <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-full transition-all duration-1000",
                            learner.performance! >= 90 ? "bg-emerald-500" : 
                            learner.performance! >= 80 ? "bg-indigo-500" : "bg-amber-500"
                          )} 
                          style={{ width: `${learner.performance}%` }} 
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-sm font-black text-slate-900">{learner.progress}%</span>
                      <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600 rounded-full transition-all" style={{ width: `${learner.progress}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex justify-center">
                      <Badge className={cn(
                        "rounded-full px-4 py-1 text-[9px] font-black uppercase tracking-widest border",
                        learner.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                        learner.status === 'dropped' ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-slate-50 text-slate-700 border-slate-200'
                      )}>
                        {learner.status || 'Active'}
                      </Badge>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl hover:bg-white border border-transparent hover:border-slate-100 shadow-none hover:shadow-md">
                        <ArrowUpRight className="w-5 h-5 text-slate-400" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl hover:bg-white border border-transparent hover:border-slate-100 shadow-none hover:shadow-md">
                        <MoreHorizontal className="w-5 h-5 text-slate-400" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-slate-50 bg-slate-50/20 flex items-center justify-between">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Reviewing <span className="text-slate-900">{filteredLearners.length}</span> candidates
            </p>
            <div className="flex gap-2">
                <Button variant="outline" size="sm" className="rounded-xl h-10 px-6 border-slate-200 text-xs font-black uppercase tracking-widest text-slate-600 bg-white" disabled>Previous</Button>
                <Button variant="outline" size="sm" className="rounded-xl h-10 px-6 border-slate-200 text-xs font-black uppercase tracking-widest text-slate-600 bg-white" disabled>Next</Button>
            </div>
        </div>
      </div>
    </div>
  );
}
