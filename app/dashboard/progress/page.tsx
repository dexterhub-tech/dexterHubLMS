'use client';

import React, { useState, useEffect } from 'react';
import { TopHeader } from '@/components/top-header';
import { StatCard } from '@/components/stat-card';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import {
  TrendingUp,
  Target,
  Activity,
  Award,
  Calendar,
  ChevronRight,
  Star,
  Zap,
  Clock
} from 'lucide-react';
// ... imports ...

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
      if (!user) return;
      try {
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

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-indigo-100 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Use fetched data in render
  // const scoreData = chartData; // Map if necessary, but backend format matches
  const scoreData = chartData.length > 0 ? chartData : [
    { week: 'W1', score: 0 }, { week: 'W8', score: 0 }
  ];


  // Custom Gradient Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/80 backdrop-blur-md border border-slate-200 p-3 rounded-2xl shadow-xl">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">{label}</p>
          <p className="text-sm font-semibold text-indigo-600">{payload[0].value}% Score</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <TopHeader user={user ? { name: `${user.firstName} ${user.lastName}`, email: user.email } : undefined} />

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Glassmorphic Hero Section */}
        <section className="relative overflow-hidden rounded-[40px] bg-slate-900 p-8 md:p-12 text-white shadow-2xl">
          {/* Animated background blobs */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-indigo-500 rounded-full blur-[120px] opacity-30 animate-pulse" />
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-96 h-96 bg-violet-600 rounded-full blur-[120px] opacity-20" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-4">
              <Badge className="bg-white/10 text-white border-white/20 px-3 py-1 backdrop-blur-md rounded-full text-[10px] font-semibold tracking-widest uppercase">
                Active Learner
              </Badge>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                Powering Through <br />Your Journey.
              </h1>
              <p className="text-slate-300 max-w-lg text-lg leading-relaxed">
                You've reached <span className="text-white font-semibold">{stats.velocity}% of your target</span> this month. Keep up the momentum to reach your goals.
              </p>
            </div>

            <div className="flex gap-4">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[32px] w-40 text-center space-y-2">
                <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-widest">Global Rank</p>
                <p className="text-4xl font-black">#12</p>
                <div className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold leading-none">
                  <TrendingUp className="w-3 h-3" /> +3
                </div>
              </div>
              <div className="bg-indigo-600 p-6 rounded-[32px] w-40 text-center space-y-2 shadow-xl shadow-indigo-900/40">
                <p className="text-indigo-200 text-[10px] font-semibold uppercase tracking-widest">Total XP</p>
                <p className="text-4xl font-black">4.8k</p>
                <p className="text-[10px] text-indigo-400 font-semibold leading-none">Next level at 5k</p>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Insights Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={TrendingUp}
            label="Learning Velocity"
            value={`${stats.velocity}%`}
            iconColor="text-indigo-600"
            iconBgColor="bg-indigo-50"
            trend={{ value: "Based on recent output", isPositive: true }}
          />
          <StatCard
            icon={Clock}
            label="Hours Invested"
            value={`${stats.hours}h`}
            iconColor="text-violet-600"
            iconBgColor="bg-violet-50"
            trend={{ value: "Total tracked time", isPositive: true }}
          />
          <StatCard
            icon={Zap}
            label="Current Streak"
            value={`${stats.streak} Days`}
            iconColor="text-amber-600"
            iconBgColor="bg-amber-50"
            trend={{ value: "Keep it up!", isPositive: true }}
          />
          <StatCard
            icon={Award}
            label="Certificates"
            value={`${stats.certificates}`}
            iconColor="text-emerald-600"
            iconBgColor="bg-emerald-50"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart Area */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="rounded-[32px] border-slate-100 shadow-sm overflow-hidden bg-white">
              <CardHeader className="p-8 pb-0">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl font-semibold">Performance Analytics</CardTitle>
                    <CardDescription className="text-slate-500 mt-1">Consistency tracking across last 8 weeks</CardDescription>
                  </div>
                  <select className="bg-slate-50 border-none rounded-xl text-xs font-semibold p-2 outline-none cursor-pointer">
                    <option>Last 8 Weeks</option>
                    <option>This Semester</option>
                  </select>
                </div>
              </CardHeader>
              <CardContent className="p-8 pt-4">
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={scoreData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
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
                      <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4' }} />
                      <Area
                        type="monotone"
                        dataKey="score"
                        stroke="#6366f1"
                        strokeWidth={4}
                        fillOpacity={1}
                        fill="url(#scoreGradient)"
                        animationDuration={2000}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Performance Summary (Horizontal Layout) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="rounded-[32px] border-slate-100 shadow-sm bg-white p-8 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <Target className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-lg">Goal Progression</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-2">
                      <span className="text-slate-400">COURSE COMPLETION</span>
                      <span className="text-indigo-600">75%</span>
                    </div>
                    <Progress value={75} className="h-2 bg-slate-50" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-2">
                      <span className="text-slate-400">ASSIGNMENT ACCURACY</span>
                      <span className="text-violet-600">92%</span>
                    </div>
                    <Progress value={92} className="h-2 bg-slate-50" indicatorClassName="bg-violet-600" />
                  </div>
                </div>
              </Card>

              <Card className="rounded-[32px] border-slate-100 shadow-sm bg-white p-8 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                    <Award className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-lg">Milestones</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-indigo-50 text-indigo-600 border-indigo-100 py-1.5 px-3 rounded-xl text-[10px] font-semibold">Fast Learner</Badge>
                  <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 py-1.5 px-3 rounded-xl text-[10px] font-semibold">Code Master</Badge>
                  <Badge className="bg-violet-50 text-violet-600 border-violet-100 py-1.5 px-3 rounded-xl text-[10px] font-semibold">Helper</Badge>
                  <Badge className="bg-rose-50 text-rose-600 border-rose-100 py-1.5 px-3 rounded-xl text-[10px] font-semibold">Night Owl</Badge>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">Unlocked 12/24 total platform badges</p>
              </Card>
            </div>
          </div>

          {/* Assessment History Area */}
          <div className="space-y-6">
            <Card className="rounded-[32px] border-slate-100 shadow-sm bg-white overflow-hidden h-full flex flex-col">
              <CardHeader className="p-8 pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold">Evaluations</CardTitle>
                  <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">View All</button>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0 flex-1">
                <div className="space-y-4">
                  {assessments.map((assessment) => (
                    <div
                      key={assessment.id}
                      className="group p-4 rounded-2xl border border-slate-50 hover:border-indigo-100 hover:bg-slate-50/50 transition-all cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge className={cn(
                          "text-[9px] font-black uppercase px-2 py-0.5 rounded-lg border-none shadow-none",
                          assessment.type === 'Quiz' ? "bg-amber-100 text-amber-600" :
                            assessment.type === 'Exam' ? "bg-rose-100 text-rose-600" :
                              "bg-indigo-100 text-indigo-600"
                        )}>
                          {assessment.type}
                        </Badge>
                        <span className="text-[10px] font-semibold text-slate-400">
                          {new Date(assessment.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-end justify-between">
                        <div>
                          <h4 className="font-semibold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">
                            {assessment.name}
                          </h4>
                        </div>
                        <div className="text-right">
                          {assessment.status === 'completed' ? (
                            <div className="font-black text-lg text-slate-900 leading-none">
                              {assessment.score}<span className="text-xs text-slate-400 font-semibold ml-0.5">/100</span>
                            </div>
                          ) : (
                            <Badge className="bg-slate-100 text-slate-500 border-none font-semibold text-[9px] px-2">PENDING</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary Widget */}
                <div className="mt-8 p-6 rounded-[24px] bg-indigo-600 text-white space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                      <Star className="w-4 h-4 fill-white" />
                    </div>
                    <h4 className="font-semibold">Next Milestone</h4>
                  </div>
                  <p className="text-xs text-indigo-100 leading-relaxed">
                    Complete your <span className="font-semibold text-white">Final Portfolio Project</span> to earn the "Professional Developer" certificate.
                  </p>
                  <button className="w-full bg-white py-2 rounded-xl text-indigo-600 text-xs font-black hover:bg-indigo-50 transition-colors">
                    EXPLORE REQUIREMENTS
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
