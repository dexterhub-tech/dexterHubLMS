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
import { Users, Filter, Download } from 'lucide-react';

interface AdminLearner {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  cohort: string;
  status: 'on-track' | 'at-risk' | 'under-review' | 'dropped';
  score: number;
  joinDate: string;
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track':
        return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900';
      case 'at-risk':
        return 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-900';
      case 'under-review':
        return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900';
      case 'dropped':
        return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900';
      default:
        return '';
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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Learners</h1>
          <p className="text-muted-foreground mt-2">{filteredLearners.length} learners</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 gap-2">
          <Download className="w-4 h-4" />
          Export
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-600 dark:text-green-400">
              On Track
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.onTrack}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-orange-600 dark:text-orange-400">
              At Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {stats.atRisk}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
              Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {stats.underReview}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-red-600 dark:text-red-400">
              Dropped
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.dropped}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-col md:flex-row">
        <Input
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 max-w-sm"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="on-track">On Track</SelectItem>
            <SelectItem value="at-risk">At Risk</SelectItem>
            <SelectItem value="under-review">Under Review</SelectItem>
            <SelectItem value="dropped">Dropped</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Learners Table */}
      <Card className="border-border/50">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border/50 bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
                    Learner
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
                    Cohort
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredLearners.map((learner) => (
                  <tr
                    key={learner.id}
                    className="border-b border-border/50 hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium text-foreground">
                        {learner.firstName} {learner.lastName}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{learner.email}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{learner.cohort}</td>
                    <td className="px-6 py-4">
                      <Badge className={`${getStatusColor(learner.status)} border`}>
                        {learner.status.replace('-', ' ').toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">{learner.score}%</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(learner.joinDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <Button size="sm" variant="ghost">
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Empty State */}
      {filteredLearners.length === 0 && (
        <Card className="border-border/50">
          <CardContent className="pt-12 text-center space-y-3">
            <Users className="w-12 h-12 text-muted-foreground mx-auto opacity-50" />
            <p className="text-muted-foreground">No learners found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
