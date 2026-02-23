'use client';

import React, { useState, useEffect } from 'react';
import { TopHeader } from '@/components/top-header';
import { StatCard } from '@/components/stat-card';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  Award,
  Zap,
  Clock,
  Target,
  ChevronRight
} from 'lucide-react';

export default function ProgressPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>({
    velocity: 0,
    hours: 0,
    streak: 0,
    certificates: 0
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const data = await api.getLearnerProgressDashboard(user.id);
        setStats(data.stats);
        setChartData(data.chartData);
        setAssessments(data.assessments);
      } catch (error) {
        console.error('Failed to fetch progress:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm font-medium uppercase tracking-widest">Loading stats...</p>
        </div>
      </div>
    );
  }

  const scoreData = chartData.length > 0 ? chartData : [
    { week: 'W1', score: 0 }, { week: 'W8', score: 0 }
  ];

  return (
    <div className="min-h-screen bg-neutral-50/50">
      <TopHeader user={user ? { name: `${user.firstName} ${user.lastName}`, email: user.email } : undefined} />

      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-12">
        {/* Minimal Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200/60">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900 uppercase">My Progress</h1>
            <p className="text-muted-foreground mt-2 max-w-xl text-sm md:text-lg font-medium">
              Overview of your learning performance and achievements.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500 bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
            <Target className="w-4 h-4 text-indigo-600" />
            <span>{stats.velocity}% to Target</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatMiniCard
            icon={TrendingUp}
            label="Accuracy"
            value={`${stats.velocity}%`}
            color="indigo"
          />
          <StatMiniCard
            icon={Clock}
            label="Hours"
            value={`${stats.hours}h`}
            color="violet"
          />
          <StatMiniCard
            icon={Zap}
            label="Streak"
            value={`${stats.streak}d`}
            color="amber"
          />
          <StatMiniCard
            icon={Award}
            label="Badges"
            value={`${stats.certificates}`}
            color="emerald"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Main Chart Section */}
          <div className="lg:col-span-3 space-y-6">
            <Card className="rounded-[32px] border-none shadow-sm bg-white p-6 md:p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 uppercase tracking-tight">Performance Trend</h3>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Weekly average scores</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Score</span>
                  </div>
                </div>
              </div>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={scoreData}>
                    <defs>
                      <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.01} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="week"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                      domain={[0, 100]}
                    />
                    <Tooltip
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}
                      labelStyle={{ display: 'none' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="#6366f1"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#scoreGradient)"
                      activeDot={{ r: 6, strokeWidth: 0, fill: '#6366f1' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <div className="bg-indigo-600 rounded-[32px] p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
              <div className="relative z-10 space-y-4">
                <h3 className="text-xl font-bold uppercase tracking-tight">Level Up Your Journey</h3>
                <p className="text-indigo-100/80 text-sm font-medium leading-relaxed max-w-md">
                  Your consistent learning velocity is impressive. Maintaining a {stats.streak} day streak puts you ahead of 80% of your cohort.
                </p>
                <button className="flex items-center gap-2 bg-white text-indigo-600 px-6 py-2.5 rounded-2xl font-bold text-sm hover:bg-neutral-50 transition-colors uppercase">
                  View Roadmap <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Activity Section */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="rounded-[32px] border-none shadow-sm bg-white h-full">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-lg font-semibold text-slate-900 uppercase tracking-tight flex items-center gap-2">
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="space-y-3">
                  {assessments.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-sm font-medium italic uppercase tracking-wider">No activity recorded</div>
                  ) : (
                    assessments.map((assessment) => (
                      <div
                        key={assessment.id}
                        className="group flex items-center justify-between p-4 rounded-2xl bg-neutral-50/50 hover:bg-white border border-transparent hover:border-slate-100 hover:shadow-sm transition-all"
                      >
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-0.5">{assessment.type}</span>
                          <h4 className="font-bold text-slate-800 text-sm leading-tight uppercase tracking-tight">{assessment.name}</h4>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">{new Date(assessment.date).toLocaleDateString()}</span>
                        </div>
                        <div className="text-right">
                          {assessment.status === 'completed' ? (
                            <div className="flex flex-col items-end">
                              <span className="text-xl font-black text-slate-900 leading-none">{assessment.score}</span>
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">SCORE</span>
                            </div>
                          ) : (
                            <Badge className="bg-slate-200 text-slate-500 border-none font-bold text-[8px] px-2 uppercase shadow-none">Pending</Badge>
                          )}
                        </div>
                      </div>
                    )))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatMiniCard({ icon: Icon, label, value, color }: { icon: any, label: string, value: string, color: 'indigo' | 'violet' | 'amber' | 'emerald' }) {
  const colorMap = {
    indigo: 'text-indigo-600 bg-indigo-50',
    violet: 'text-violet-600 bg-violet-50',
    amber: 'text-amber-600 bg-amber-50',
    emerald: 'text-emerald-600 bg-emerald-50',
  };

  return (
    <Card className="rounded-[24px] border-none shadow-sm bg-white p-6 hover:-translate-y-1 transition-transform duration-300">
      <div className="flex items-center gap-4">
        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", colorMap[color])}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
          <p className="text-2xl font-medium font-black text-slate-900 leading-none">{value}</p>
        </div>
      </div>
    </Card>
  );
}
