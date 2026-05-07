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
  Mail,
  MapPin,
  ExternalLink,
  BookOpen,
  Star,
  Clock,
  Briefcase
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { StatCard } from '@/components/stat-card';
import { toast } from 'sonner';

interface Instructor {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  status: string;
  instructorDetails?: {
    expertise: string[];
    experienceYears: number;
    teachingPhilosophy: string;
  };
  cohortCount?: number;
  studentCount?: number;
}

export default function InstructorsAdminPage() {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadInstructors();
  }, []);

  const loadInstructors = async () => {
    try {
      setIsLoading(true);
      // We'll use the existing getAllUsers and filter for now, 
      // but ideally we'd have a dedicated endpoint for instructor stats
      const users = await api.getAllUsers();
      const filtered = users.filter((u: any) => u.role === 'instructor');
      setInstructors(filtered);
    } catch (error) {
      toast.error('Failed to load instructors');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredInstructors = instructors.filter((ins) => 
    `${ins.firstName} ${ins.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ins.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-8 space-y-8 animate-pulse">
        <div className="h-10 bg-slate-200 rounded-lg w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-100 rounded-2xl" />
          ))}
        </div>
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
            <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest">Faculty Management</Badge>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Instructors Directory</h1>
          <p className="text-slate-500 mt-2 max-w-xl text-lg font-medium">
            Manage your teaching staff, monitor course assignments, and evaluate performance metrics.
          </p>
        </div>
        <Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-xs shadow-2xl shadow-slate-200 transition-all active:scale-95">
          Invite Instructor
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={GraduationCap}
          label="Active Instructors"
          value={instructors.length}
          iconColor="text-indigo-600"
          iconBgColor="bg-indigo-50"
        />
        <StatCard
          icon={BookOpen}
          label="Total Courses"
          value="24"
          iconColor="text-blue-600"
          iconBgColor="bg-blue-50"
        />
        <StatCard
          icon={Star}
          label="Avg. Rating"
          value="4.8"
          iconColor="text-amber-600"
          iconBgColor="bg-amber-50"
        />
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search instructors by name or expertise..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-14 rounded-[20px] bg-white border-none shadow-sm focus:ring-4 focus:ring-indigo-50 transition-all font-medium"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 p-8 gap-6">
          {filteredInstructors.map((instructor) => (
            <Card key={instructor._id} className="rounded-[32px] border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden">
              <CardHeader className="p-6 pb-0 flex flex-row items-center gap-4">
                <Avatar className="w-16 h-16 rounded-2xl border-4 border-white shadow-xl transition-transform group-hover:scale-110">
                  <AvatarImage src={instructor.avatar} />
                  <AvatarFallback className="bg-indigo-600 text-white font-black text-xl">
                    {instructor.firstName[0]}{instructor.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-slate-900 truncate text-lg">{instructor.firstName} {instructor.lastName}</h3>
                  <p className="text-xs text-indigo-600 font-bold uppercase tracking-widest truncate">{instructor.instructorDetails?.expertise?.[0] || 'Lead Instructor'}</p>
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-6 space-y-6">
                <div className="flex flex-wrap gap-2">
                  {(instructor.instructorDetails?.expertise || ['Cloud Computing', 'Full Stack', 'AI']).slice(0, 3).map((tag, i) => (
                    <Badge key={i} variant="secondary" className="bg-slate-50 text-slate-500 border-none rounded-lg font-bold text-[9px] uppercase tracking-wider px-2">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Cohorts</p>
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-slate-300" />
                      <span className="font-black text-slate-900">{instructor.cohortCount || '3'}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Students</p>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-slate-300" />
                      <span className="font-black text-slate-900">{instructor.studentCount || '142'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button className="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl h-11 font-black text-[10px] uppercase tracking-widest transition-all">
                    View Profile
                  </Button>
                  <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-all">
                    <Mail className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredInstructors.length === 0 && (
          <div className="py-20 text-center space-y-4">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
              <GraduationCap className="w-10 h-10" />
            </div>
            <p className="text-xl font-black text-slate-800">No instructors found</p>
            <p className="text-slate-400 font-medium">Try searching for another name or expertise.</p>
          </div>
        )}
      </div>
    </div>
  );
}
