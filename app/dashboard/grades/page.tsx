'use client';

import React, { useState, useEffect } from 'react';
import { TopHeader } from '@/components/top-header';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';
import {
  GraduationCap,
  Award,
  Zap,
  Target,
  Trophy,
  AlertTriangle,
  CheckCircle,
  MessageSquare,
  Clock,
  User,
  Calendar,
  ChevronRight,
  TrendingUp,
  FileText,
  Bookmark,
  Percent
} from 'lucide-react';

export default function GradesPage() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'graded' | 'pending'>('all');

  useEffect(() => {
    const fetchGradesData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const gradesData = await api.getLearnerGradesAndReview(user.id);
        setData(gradesData);
      } catch (error) {
        console.error('Failed to fetch grades and review data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGradesData();
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm font-medium uppercase tracking-widest animate-pulse">Loading Academic Records...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8 rounded-3xl shadow-lg border-slate-200/60 bg-white">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900">No Grades Found</h3>
          <p className="text-slate-500 mt-2 text-sm">
            We couldn't find any active course enrollment or grading records for your account. Please check back later or contact your instructor.
          </p>
        </Card>
      </div>
    );
  }

  // Filter tasks based on selected filter tab
  const filteredTasks = data.tasks.filter((task: any) => {
    if (activeTab === 'graded') return task.status === 'graded';
    if (activeTab === 'pending') return task.status === 'submitted' || task.status === 'pending';
    return true;
  });

  // Prepare Distribution Data for Chart
  const distributionData = [
    { name: 'A (85-100%)', count: data.analytics.gradeDistribution.A, color: '#6366f1' },
    { name: 'B (70-84%)', count: data.analytics.gradeDistribution.B, color: '#8b5cf6' },
    { name: 'C (50-69%)', count: data.analytics.gradeDistribution.C, color: '#f59e0b' },
    { name: 'F (<50%)', count: data.analytics.gradeDistribution.F, color: '#ef4444' }
  ];

  // Prepare Module Progress Data for Chart
  const moduleData = data.analytics.moduleProgress.map((mp: any) => ({
    name: mp.moduleName.length > 15 ? `${mp.moduleName.substring(0, 15)}...` : mp.moduleName,
    score: parseFloat((mp.averageScore * 10).toFixed(1)) // convert avg score (out of 10) to %
  }));

  // Banner details based on type
  const isWarning = data.messageType === 'warning';
  const isSuccess = data.messageType === 'success';

  return (
    <div className="min-h-screen bg-neutral-50/40 pb-16">
      <TopHeader user={user ? { name: `${user.firstName} ${user.lastName}`, email: user.email } : undefined} />

      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        
        {/* Title and Cohort Details */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200/60">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs uppercase tracking-wider mb-1.5">
              <Bookmark className="w-4 h-4" />
              <span>{data.courseName}</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Grade & Review</h1>
            <p className="text-slate-500 mt-1 text-sm md:text-base">
              Monitor your task submissions, instructor evaluations, and overall performance in <span className="font-semibold text-slate-800">{data.cohortName}</span>.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Enrollment Status</span>
              <Badge className={cn(
                "mt-1 text-xs font-bold px-3 py-1 rounded-full uppercase border-none shadow-none",
                data.status === 'on-track' ? "bg-emerald-50 text-emerald-700" :
                data.status === 'at-risk' ? "bg-amber-50 text-amber-700" :
                data.status === 'under-review' ? "bg-indigo-50 text-indigo-700" :
                "bg-red-50 text-red-700"
              )}>
                {data.status}
              </Badge>
            </div>
          </div>
        </div>

        {/* Dynamic Warning or Encouraging Banner */}
        <div className={cn(
          "relative overflow-hidden rounded-[24px] border p-6 md:p-8 shadow-sm transition-all duration-300",
          isWarning ? "bg-gradient-to-r from-red-500/10 via-orange-500/5 to-transparent border-red-500/20 text-red-950" :
          isSuccess ? "bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent border-indigo-500/20 text-indigo-950" :
          "bg-gradient-to-r from-slate-500/10 via-blue-500/5 to-transparent border-slate-500/20 text-slate-950"
        )}>
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-10 blur-2xl bg-current" />
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative z-10">
            <div className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
              isWarning ? "bg-red-100 text-red-600" :
              isSuccess ? "bg-indigo-100 text-indigo-600" :
              "bg-slate-100 text-slate-600"
            )}>
              {isWarning ? <AlertTriangle className="w-7 h-7" /> : isSuccess ? <Award className="w-7 h-7" /> : <Zap className="w-7 h-7" />}
            </div>
            <div className="flex-1 space-y-1">
              <h3 className="text-lg font-bold tracking-tight">
                {isWarning ? "Academic Notice" : isSuccess ? "Academic Excellence" : "Progress Summary"}
              </h3>
              <p className="text-sm font-medium leading-relaxed opacity-90">
                {data.feedbackMessage}
              </p>
            </div>
            <div className="bg-white/80 backdrop-blur-md px-6 py-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 shrink-0 self-stretch md:self-auto justify-center">
              <Percent className="w-5 h-5 text-indigo-600" />
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Grade Score</p>
                <p className="text-2xl font-black text-slate-800 leading-tight mt-0.5">{data.currentScore}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Course Tasks"
            value={data.analytics.totalTasks}
            description="Assigned program tasks"
            icon={FileText}
            gradient="indigo"
          />
          <StatCard
            title="Graded Tasks"
            value={data.analytics.gradedTasksCount}
            description={`${data.analytics.submittedTasksCount} submitted in total`}
            icon={CheckCircle}
            gradient="emerald"
          />
          <StatCard
            title="Average Grade"
            value={`${data.analytics.averageGrade}/10`}
            description="Relative to graded tasks"
            icon={Target}
            gradient="violet"
          />
          <StatCard
            title="Pending Tasks"
            value={data.analytics.totalTasks - data.analytics.gradedTasksCount}
            description="Awaiting submission or grading"
            icon={Clock}
            gradient="amber"
          />
        </div>

        {/* Main Section Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Grade Analytics Charts */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="rounded-[24px] border border-slate-200 shadow-sm bg-white overflow-hidden">
              <CardHeader className="p-6 pb-4">
                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-600" />
                  Grade Analytics
                </CardTitle>
                <CardDescription className="text-xs">Visual breakdown of your academic stats</CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-8">
                
                {/* Module progress chart */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Module Performance (%)</h4>
                  {moduleData.length === 0 ? (
                    <div className="h-40 flex items-center justify-center text-slate-400 text-sm font-medium italic bg-slate-50 rounded-2xl">
                      No modules recorded
                    </div>
                  ) : (
                    <div className="h-44 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={moduleData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 600 }} tickLine={false} axisLine={false} />
                          <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 600 }} tickLine={false} axisLine={false} />
                          <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                            labelStyle={{ fontWeight: 'bold', fontSize: 11 }}
                            itemStyle={{ fontSize: 11 }}
                          />
                          <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, strokeWidth: 0, fill: '#6366f1' }} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                {/* Grade distribution chart */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Grade Distribution</h4>
                  <div className="h-40 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={distributionData} layout="vertical" margin={{ left: -10, right: 10, top: 0, bottom: 0 }}>
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" tick={{ fill: '#475569', fontSize: 10, fontWeight: 600 }} tickLine={false} axisLine={false} width={80} />
                        <Tooltip
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                          itemStyle={{ fontSize: 11 }}
                          labelStyle={{ display: 'none' }}
                        />
                        <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={12}>
                          {distributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Legend list */}
                <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                    <div className="w-2.5 h-2.5 rounded bg-indigo-500" />
                    <span>A Grade: {data.analytics.gradeDistribution.A}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                    <div className="w-2.5 h-2.5 rounded bg-purple-500" />
                    <span>B Grade: {data.analytics.gradeDistribution.B}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                    <div className="w-2.5 h-2.5 rounded bg-amber-500" />
                    <span>C Grade: {data.analytics.gradeDistribution.C}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                    <div className="w-2.5 h-2.5 rounded bg-red-500" />
                    <span>F Grade: {data.analytics.gradeDistribution.F}</span>
                  </div>
                </div>

              </CardContent>
            </Card>

            {/* Leaderboard Card - temporarily hidden */}
            {/* <Card className="rounded-[24px] border border-slate-200 shadow-sm bg-white overflow-hidden">
              <CardHeader className="p-6 pb-4">
                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  Cohort Leaderboard
                </CardTitle>
                <CardDescription className="text-xs">Ranks based on overall course performance score</CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                {data.leaderboard.map((learner: any, idx) => {
                  const isGold = learner.rank === 1;
                  const isSilver = learner.rank === 2;
                  const isBronze = learner.rank === 3;
                  return (
                    <div
                      key={`${learner.id ?? learner.email}-${idx}`}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-2xl border transition-all duration-200",
                        learner.isCurrentUser
                          ? "bg-indigo-50/50 border-indigo-200 shadow-sm"
                          : "bg-neutral-50/40 border-transparent hover:bg-neutral-50 hover:border-slate-100"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 flex items-center justify-center shrink-0">
                          {isGold ? (
                            <Trophy className="w-5 h-5 text-amber-500 fill-amber-100" />
                          ) : isSilver ? (
                            <Trophy className="w-5 h-5 text-slate-400 fill-slate-100" />
                          ) : isBronze ? (
                            <Trophy className="w-5 h-5 text-amber-700 fill-amber-50" />
                          ) : (
                            <span className="text-xs font-bold text-slate-400">#{learner.rank}</span>
                          )}
                        </div>
                        <div className={cn(
                          "w-8 h-8 rounded-xl font-bold flex items-center justify-center text-xs shrink-0 shadow-sm border border-white",
                          learner.isCurrentUser ? "bg-indigo-600 text-white" : "bg-white text-slate-700"
                        )}>
                          {learner.name[0]}
                        </div>
                        <div className="max-w-[130px]">
                          <p className={cn(
                            "text-xs font-semibold truncate",
                            learner.isCurrentUser ? "text-indigo-950 font-bold" : "text-slate-800"
                          )}>
                            {learner.name} {learner.isCurrentUser && <span className="text-[10px] text-indigo-500 font-medium">(You)</span>}
                          </p>
                          <p className="text-[9px] text-slate-400 truncate">{learner.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={cn(
                          "text-sm font-extrabold",
                          learner.isCurrentUser ? "text-indigo-600" : "text-slate-700"
                        )}>
                          {learner.currentScore}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card> */}

          </div>

          {/* Right Column: Grades and Feedback List */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="rounded-[24px] border border-slate-200 shadow-sm bg-white overflow-hidden">
              <CardHeader className="p-6 md:p-8 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg font-bold text-slate-900">Task Performance Details</CardTitle>
                    <CardDescription className="text-xs">Your graded tasks and individual feedback comments</CardDescription>
                  </div>

                  {/* Filter tabs */}
                  <div className="flex bg-slate-100 p-1 rounded-xl w-fit self-start sm:self-auto border border-slate-200/50">
                    <button
                      onClick={() => setActiveTab('all')}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                        activeTab === 'all'
                          ? "bg-white text-indigo-600 shadow-sm"
                          : "text-slate-500 hover:text-slate-800"
                      )}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setActiveTab('graded')}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                        activeTab === 'graded'
                          ? "bg-white text-indigo-600 shadow-sm"
                          : "text-slate-500 hover:text-slate-800"
                      )}
                    >
                      Graded
                    </button>
                    <button
                      onClick={() => setActiveTab('pending')}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                        activeTab === 'pending'
                          ? "bg-white text-indigo-600 shadow-sm"
                          : "text-slate-500 hover:text-slate-800"
                      )}
                    >
                      Pending
                    </button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6 md:p-8 pt-0">
                <div className="space-y-4">
                  {filteredTasks.length === 0 ? (
                    <div className="text-center py-16 text-slate-400 text-sm font-medium italic border-2 border-dashed border-slate-100 rounded-2xl bg-neutral-50/30">
                      No tasks found in this category
                    </div>
                  ) : (
                    filteredTasks.map((task: any) => {
                      const isGraded = task.status === 'graded';
                      const isSubmitted = task.status === 'submitted';

                      return (
                        <div
                          key={`${task.lessonId}-${task.moduleName || ''}`}
                          className="group border border-slate-100 hover:border-slate-200/80 rounded-2xl p-5 hover:bg-neutral-50/30 transition-all duration-200 flex flex-col gap-4 bg-white"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div className="flex items-start gap-3.5">
                              <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border",
                                isGraded ? "bg-emerald-50 border-emerald-100 text-emerald-600" :
                                isSubmitted ? "bg-amber-50 border-amber-100 text-amber-600" :
                                "bg-slate-50 border-slate-100 text-slate-400"
                              )}>
                                <GraduationCap className="w-5 h-5" />
                              </div>
                              <div>
                                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest leading-none block mb-1">
                                  {task.moduleName}
                                </span>
                                <h3 className="font-bold text-slate-900 text-sm md:text-base leading-tight">
                                  {task.title}
                                </h3>
                                {task.description && (
                                  <p className="text-xs text-slate-400 line-clamp-1 mt-1 font-medium max-w-md">
                                    {task.description}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-4 shrink-0">
                              <Badge className={cn(
                                "border-none text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full shadow-none",
                                isGraded ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50" :
                                isSubmitted ? "bg-amber-50 text-amber-700 hover:bg-amber-50" :
                                "bg-slate-100 text-slate-500 hover:bg-slate-100"
                              )}>
                                {task.status}
                              </Badge>

                              <div className="text-right">
                                {isGraded ? (
                                  <div className="flex flex-col items-end">
                                    <div className="flex items-baseline gap-0.5">
                                      <span className="text-xl font-black text-slate-800 leading-none">
                                        {task.grade}
                                      </span>
                                      <span className="text-xs font-semibold text-slate-400">
                                        /{task.maxScore}
                                      </span>
                                    </div>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1 block">
                                      Score
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                    {isSubmitted ? "Ungraded" : "No Submission"}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Instructor Comments Section */}
                          {isGraded && (
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col gap-3">
                              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold border-b border-slate-200/50 pb-2">
                                <div className="flex items-center gap-1.5">
                                  <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
                                  <span>Instructor Evaluation</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  {task.gradedBy && (
                                    <span className="flex items-center gap-1">
                                      <User className="w-3 h-3" />
                                      {task.gradedBy}
                                    </span>
                                  )}
                                  {task.gradedAt && (
                                    <span className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      {new Date(task.gradedAt).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                                {task.feedback || "Good effort on this task. Excellent demonstration of coding practices. No specific review comments were left."}
                              </p>
                            </div>
                          )}

                          {isSubmitted && (
                            <div className="bg-slate-50/50 border border-dashed border-slate-200 rounded-xl p-4 flex items-center justify-between">
                              <span className="text-xs text-slate-500 font-medium flex items-center gap-2">
                                <Clock className="w-4 h-4 text-amber-500" />
                                Submitted on {task.submittedAt ? new Date(task.submittedAt).toLocaleDateString() : 'recent date'}. Waiting for instructor evaluation.
                              </span>
                              <span className="text-[10px] text-slate-400 font-bold uppercase">Pending Review</span>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

        </div>

      </div>
    </div>
  );
}

// Sub-component for Stat card
function StatCard({ title, value, description, icon: Icon, gradient }: { title: string, value: string | number, description: string, icon: any, gradient: 'indigo' | 'emerald' | 'violet' | 'amber' }) {
  const gradientMap = {
    indigo: 'from-indigo-600 to-indigo-700 bg-indigo-50 text-indigo-600',
    emerald: 'from-emerald-600 to-emerald-700 bg-emerald-50 text-emerald-600',
    violet: 'from-violet-600 to-violet-700 bg-violet-50 text-violet-600',
    amber: 'from-amber-50 to-amber-100 bg-amber-50 text-amber-600',
  };

  return (
    <Card className="rounded-[24px] border border-slate-200 shadow-sm bg-white overflow-hidden p-6 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300">
      <div className="flex items-center gap-4">
        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-transparent", gradientMap[gradient].split(' ').slice(2).join(' '))}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="space-y-0.5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{title}</p>
          <p className="text-2xl font-black text-slate-900 leading-tight">{value}</p>
          <p className="text-[10px] text-slate-400 font-medium">{description}</p>
        </div>
      </div>
    </Card>
  );
}
