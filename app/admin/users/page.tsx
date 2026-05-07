'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
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
  XCircle,
  Shield,
  GraduationCap
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { StatCard } from '@/components/stat-card';
import { toast } from 'sonner';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'learner' | 'instructor' | 'admin' | 'super-admin';
  status: 'active' | 'dropped' | 'inactive';
  createdAt: string;
  avatar?: string;
}

export default function UsersAdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const data = await api.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users directory');
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'super-admin':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'admin':
        return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'instructor':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'learner':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super-admin':
      case 'admin':
        return <Shield className="w-3 h-3 mr-1.5" />;
      case 'instructor':
        return <GraduationCap className="w-3 h-3 mr-1.5" />;
      case 'learner':
        return <Users className="w-3 h-3 mr-1.5" />;
      default:
        return null;
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const stats = {
    total: users.length,
    admins: users.filter((u) => u.role === 'admin' || u.role === 'super-admin').length,
    instructors: users.filter((u) => u.role === 'instructor').length,
    learners: users.filter((u) => u.role === 'learner').length,
    active: users.filter((u) => u.status === 'active').length,
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-8 space-y-8">
        <div className="h-10 bg-slate-200 animate-pulse rounded-lg w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-100 animate-pulse rounded-2xl" />
          ))}
        </div>
        <div className="h-96 bg-slate-100 animate-pulse rounded-[32px]" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-10 pb-20">

      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200/60">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100 px-3 py-1 text-[10px] font-semibold tracking-tight uppercase">Platform Administration</Badge>
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900">Users Directory</h1>
          <p className="text-muted-foreground mt-2 max-w-xl text-lg">
            Manage all platform participants, verify identities, and assign administrative roles.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl h-12 border-slate-200 shadow-sm hover:shadow-md transition-all">
            <Download className="w-4 h-4 mr-2" />
            Export Users
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all hover:shadow-md rounded-xl h-12">
            <UserPlus className="w-4 h-4 mr-2" />
            Create User
          </Button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          icon={Users}
          label="Total Users"
          value={stats.total}
          iconColor="text-slate-600"
          iconBgColor="bg-slate-50"
        />
        <StatCard
          icon={Shield}
          label="Admin Staff"
          value={stats.admins}
          iconColor="text-indigo-600"
          iconBgColor="bg-indigo-50"
        />
        <StatCard
          icon={GraduationCap}
          label="Instructors"
          value={stats.instructors}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-50"
        />
        <StatCard
          icon={Users}
          label="Learner Pool"
          value={stats.learners}
          iconColor="text-emerald-600"
          iconBgColor="bg-emerald-50"
        />
        <StatCard
          icon={CheckCircle2}
          label="Active Talent"
          value={stats.active}
          iconColor="text-emerald-600"
          iconBgColor="bg-emerald-50"
        />
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">

        {/* Toolbar */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/30 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by name, email or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 h-12 rounded-2xl bg-white border-slate-100 focus:border-indigo-200 focus:ring-4 focus:ring-indigo-50 transition-all text-sm"
            />
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="grow md:w-48 h-12 rounded-2xl bg-white border-slate-100 text-xs font-semibold uppercase tracking-wider">
                <SelectValue placeholder="Filter by Role" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-100">
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Administrators</SelectItem>
                <SelectItem value="instructor">Mentors/Instructors</SelectItem>
                <SelectItem value="learner">Students/Learners</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon" onClick={() => loadUsers()} className="h-12 w-12 rounded-2xl border-slate-100 bg-white">
              <TrendingUp className="w-4 h-4 text-slate-400" />
            </Button>
          </div>
        </div>

        {/* Dynamic Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-50">
                <th className="px-8 py-5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Identity</th>
                <th className="px-6 py-5 text-[10px] font-semibold uppercase tracking-widest text-slate-400 text-center">Account Role</th>
                <th className="px-6 py-5 text-[10px] font-semibold uppercase tracking-widest text-slate-400 text-center">Status</th>
                <th className="px-6 py-5 text-[10px] font-semibold uppercase tracking-widest text-slate-400 text-center">Date Joined</th>
                <th className="px-8 py-5 text-[10px] font-semibold uppercase tracking-widest text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredUsers.map((user) => {
                const roleClass = getRoleBadgeStyle(user.role);
                return (
                  <tr
                    key={user._id}
                    className="group hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-12 h-12 rounded-2xl border border-slate-100 shadow-sm">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback className="bg-indigo-50 text-indigo-600 font-semibold">
                            {user.firstName[0]}{user.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs text-slate-400 font-medium">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center">
                        <Badge variant="outline" className={cn("rounded-full px-3 py-1 text-[9px] font-bold uppercase tracking-widest transition-all", roleClass)}>
                          {getRoleIcon(user.role)}
                          {user.role}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center">
                        <Badge className={cn(
                          "rounded-full px-3 py-0.5 text-[9px] font-semibold uppercase tracking-widest border transition-all",
                          user.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-700 border-slate-200'
                        )}>
                          {user.status || 'active'}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center text-xs font-semibold text-slate-400">
                      {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
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
        {filteredUsers.length === 0 && (
          <div className="py-24 text-center space-y-4">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-slate-300" />
            </div>
            <div>
              <p className="text-xl font-semibold text-slate-800">No users matching criteria</p>
              <p className="text-sm text-slate-400 max-w-xs mx-auto">Try adjusting your filters or search terms to find who you're looking for.</p>
            </div>
            <Button variant="link" onClick={() => { setSearchTerm(''); setRoleFilter('all'); }} className="text-indigo-600 font-semibold">Clear all filters</Button>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="px-8 py-5 border-t border-slate-50 bg-slate-50/20 flex items-center justify-between">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
            Showing <span className="text-slate-900">{filteredUsers.length}</span> of <span className="text-slate-900">{users.length}</span> total users
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
