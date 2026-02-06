'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Users,
  Filter,
  Download,
  Search,
  MoreHorizontal,
  UserPlus,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { StatCard } from '@/components/stat-card';

interface AdminLearner {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  cohort: string;
  status: 'on-track' | 'at-risk' | 'under-review' | 'dropped';
  score: number;
  joinDate: string;
  avatar?: string;
}

export default function LearnersAdminPage() {
  const [learners] = useState<AdminLearner[]>([
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      cohort: 'Cohort 2024-Q1',
      status: 'on-track',
      score: 85,
      joinDate: '2024-01-15',
    },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      cohort: 'Cohort 2024-Q1',
      status: 'at-risk',
      score: 62,
      joinDate: '2024-01-15',
    },
    {
      id: '3',
      firstName: 'Mike',
      lastName: 'Johnson',
      email: 'mike@example.com',
      cohort: 'Cohort 2024-Q2',
      status: 'on-track',
      score: 78,
      joinDate: '2024-02-01',
    },
    {
      id: '4',
      firstName: 'Sarah',
      lastName: 'Williams',
      email: 'sarah@example.com',
      cohort: 'Cohort 2024-Q1',
      status: 'under-review',
      score: 55,
      joinDate: '2024-01-15',
    },
    {
      id: '5',
      firstName: 'David',
      lastName: 'Brown',
      email: 'david@example.com',
      cohort: 'Cohort 2024-Q2',
      status: 'dropped',
      score: 40,
      joinDate: '2024-02-01',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'on-track':
        return {
          color: 'bg-emerald-50 text-emerald-700 border-emerald-100',
          dot: 'bg-emerald-500',
          icon: CheckCircle2
        };
      case 'at-risk':
        return {
          color: 'bg-orange-50 text-orange-700 border-orange-100',
          dot: 'bg-orange-500',
          icon: AlertCircle
        };
      case 'under-review':
        return {
          color: 'bg-amber-50 text-amber-700 border-amber-100',
          dot: 'bg-amber-500',
          icon: Search
        };
      case 'dropped':
        return {
          color: 'bg-rose-50 text-rose-700 border-rose-100',
          dot: 'bg-rose-500',
          icon: XCircle
        };
      default:
        return {
          color: 'bg-slate-50 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
          icon: Users
        };
    }
  };

  const filteredLearners = learners.filter((learner) => {
    const matchesSearch =
      learner.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      learner.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      learner.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || learner.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: learners.length,
    onTrack: learners.filter((l) => l.status === 'on-track').length,
    atRisk: learners.filter((l) => l.status === 'at-risk').length,
    underReview: learners.filter((l) => l.status === 'under-review').length,
    dropped: learners.filter((l) => l.status === 'dropped').length,
  };

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-10 pb-20">

      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200/60">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 px-3 py-1 text-[10px] font-semibold tracking-tight uppercase">User Management</Badge>
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900">Learner Directory</h1>
          <p className="text-muted-foreground mt-2 max-w-xl text-lg">
            Track student progress, manage status types, and export performance data.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl h-12 border-slate-200 shadow-sm hover:shadow-md transition-all">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button className="bg-slate-900 hover:bg-slate-800 shadow-sm transition-all hover:shadow-md rounded-xl h-12">
            <UserPlus className="w-4 h-4 mr-2" />
            Direct Add
          </Button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          icon={Users}
          label="Total Students"
          value={stats.total}
          iconColor="text-slate-600"
          iconBgColor="bg-slate-50"
        />
        <StatCard
          icon={CheckCircle2}
          label="On Track"
          value={stats.onTrack}
          iconColor="text-emerald-600"
          iconBgColor="bg-emerald-50"
        />
        <StatCard
          icon={AlertCircle}
          label="At Risk"
          value={stats.atRisk}
          iconColor="text-orange-600"
          iconBgColor="bg-orange-50"
        />
        <StatCard
          icon={Search}
          label="Under Review"
          value={stats.underReview}
          iconColor="text-amber-600"
          iconBgColor="bg-amber-50"
        />
        <StatCard
          icon={XCircle}
          label="Dropped"
          value={stats.dropped}
          iconColor="text-rose-600"
          iconBgColor="bg-rose-50"
        />
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">

        {/* Toolbar */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/30 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by name, email or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 h-12 rounded-2xl bg-white border-slate-100 focus:border-indigo-200 focus:ring-4 focus:ring-indigo-50 transition-all text-sm"
            />
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="grow md:w-48 h-12 rounded-2xl bg-white border-slate-100 text-xs font-semibold uppercase tracking-wider">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-100">
                <SelectItem value="all">All Channels</SelectItem>
                <SelectItem value="on-track" className="text-emerald-600">On Track</SelectItem>
                <SelectItem value="at-risk" className="text-orange-600">At Risk</SelectItem>
                <SelectItem value="under-review" className="text-amber-600">In Review</SelectItem>
                <SelectItem value="dropped" className="text-rose-600">Dropped</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-slate-100 bg-white">
              <Filter className="w-4 h-4 text-slate-400" />
            </Button>
          </div>
        </div>

        {/* Dynamic Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-50">
                <th className="px-8 py-5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Student Info</th>
                <th className="px-6 py-5 text-[10px] font-semibold uppercase tracking-widest text-slate-400 text-center">Cohort</th>
                <th className="px-6 py-5 text-[10px] font-semibold uppercase tracking-widest text-slate-400 text-center">Status</th>
                <th className="px-6 py-5 text-[10px] font-semibold uppercase tracking-widest text-slate-400 text-center">Grade</th>
                <th className="px-6 py-5 text-[10px] font-semibold uppercase tracking-widest text-slate-400 text-center">Joined</th>
                <th className="px-8 py-5 text-[10px] font-semibold uppercase tracking-widest text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredLearners.map((learner) => {
                const style = getStatusStyle(learner.status);
                const StatusIcon = style.icon;
                return (
                  <tr
                    key={learner.id}
                    className="group hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-12 h-12 rounded-2xl border border-slate-100 shadow-sm">
                          <AvatarImage src={learner.avatar} />
                          <AvatarFallback className="bg-indigo-50 text-indigo-600 font-semibold">
                            {learner.firstName[0]}{learner.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {learner.firstName} {learner.lastName}
                          </p>
                          <p className="text-xs text-slate-400 font-medium">{learner.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">{learner.cohort}</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center">
                        <Badge className={cn("rounded-full px-3 py-0.5 text-[9px] font-semibold uppercase tracking-widest border transition-all", style.color)}>
                          <StatusIcon className="w-3 h-3 mr-1.5" />
                          {learner.status.replace('-', ' ')}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              learner.score > 80 ? "bg-emerald-500" : learner.score > 60 ? "bg-amber-500" : "bg-rose-500"
                            )}
                            style={{ width: `${learner.score}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-slate-700">{learner.score}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center text-xs font-semibold text-slate-400">
                      {new Date(learner.joinDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl hover:bg-white border border-transparent hover:border-slate-100 shadow-none hover:shadow-sm">
                          <ExternalLink className="w-4 h-4 text-slate-400" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl hover:bg-white border border-transparent hover:border-slate-100 shadow-none hover:shadow-sm">
                          <MoreHorizontal className="w-4 h-4 text-slate-400" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredLearners.length === 0 && (
          <div className="py-24 text-center space-y-4">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-slate-300" />
            </div>
            <div>
              <p className="text-xl font-semibold text-slate-800">No students matching criteria</p>
              <p className="text-sm text-slate-400 max-w-xs mx-auto">Try adjusting your filters or search terms to find who you're looking for.</p>
            </div>
            <Button variant="link" onClick={() => { setSearchTerm(''); setStatusFilter('all'); }} className="text-indigo-600 font-semibold">Clear all filters</Button>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="px-8 py-5 border-t border-slate-50 bg-slate-50/20 flex items-center justify-between">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
            Showing <span className="text-slate-900">{filteredLearners.length}</span> of <span className="text-slate-900">{learners.length}</span> students
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="rounded-xl h-9 px-4 border-slate-200 text-xs font-semibold text-slate-600 bg-white" disabled>Previous</Button>
            <Button variant="outline" size="sm" className="rounded-xl h-9 px-4 border-slate-200 text-xs font-semibold text-slate-600 bg-white" disabled>Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
