'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Plus, CheckCircle, Video, FileText, Trash2, GripVertical, Sparkles, ChevronDown, Clock, Layers, Award, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

interface ModuleManagerProps {
    courseId: string;
    initialModules?: any[];
    onComplete: () => void;
}

// Helper interface for Assignment
interface Assignment {
    title: string;
    description: string;
    maxScore: number;
    type?: 'task' | 'quiz' | 'video';
    questions?: Array<{
        question: string;
        options: string[];
        correctAnswer: number;
    }>;
}

export function ModuleManager({ courseId, initialModules, onComplete }: ModuleManagerProps) {
    const [modules, setModules] = useState<any[]>(initialModules || []);
    const [isAddingModule, setIsAddingModule] = useState(false);
    const [newModuleName, setNewModuleName] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Lesson state
    const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
    const [newLesson, setNewLesson] = useState({
        name: '',
        content: '',
        videoUrl: '',
        duration: 0,
        assignment: {
            title: '',
            description: '',
            maxScore: 10,
            type: 'task',
            questions: [] as Array<{ question: string; options: string[]; correctAnswer: number; }>
        }
    });

    const handleAddModule = async () => {
        if (!newModuleName.trim()) return;
        setIsSaving(true);
        try {
            const module = await api.createModule({
                courseId,
                name: newModuleName,
                description: 'Academic Module'
            });
            setModules([...modules, { ...module, lessons: [] }]);
            setNewModuleName('');
            setIsAddingModule(false);
            toast.success('Module added to syllabus.');
        } catch (error) {
            toast.error('Failed to register module.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddLesson = async (moduleId: string) => {
        if (!newLesson.name) return;
        setIsSaving(true);
        try {
            const lesson = await api.createLesson({
                moduleId,
                ...newLesson
            });

            const updatedModules = modules.map(m => {
                if (m._id === moduleId) {
                    return { ...m, lessons: [...(m.lessons || []), lesson] };
                }
                return m;
            });
            setModules(updatedModules);

            setNewLesson({
                name: '',
                content: '',
                videoUrl: '',
                duration: 0,
                assignment: { title: '', description: '', maxScore: 10, type: 'task', questions: [] }
            });
            setActiveModuleId(null);
            toast.success('Learning session established.');
        } catch (error) {
            toast.error('Failed to create session.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-10">
            {/* Module Manager Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h2 className="text-2xl font-semibold text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <Layers className="w-5 h-5" />
                        </div>
                        Curriculum Architecture
                    </h2>
                    <p className="text-slate-500 font-medium ml-13">Structure your course into modules and deep-dive sessions.</p>
                </div>
                <Button
                    onClick={() => setIsAddingModule(true)}
                    disabled={isAddingModule}
                    className="h-12 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-100 transition-all active:scale-95 flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Add Module
                </Button>
            </div>

            {/* In-line Add Module Form */}
            {isAddingModule && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                    <Card className="border-2 border-dashed border-indigo-200 bg-indigo-50/30 rounded-[28px] overflow-hidden">
                        <CardContent className="p-8 space-y-4">
                            <Label className="text-xs font-bold uppercase tracking-widest text-indigo-600 ml-1">New Module Title</Label>
                            <div className="flex gap-4">
                                <Input
                                    value={newModuleName}
                                    onChange={(e) => setNewModuleName(e.target.value)}
                                    placeholder="e.g. Fundamental Logic and Structures"
                                    className="h-14 bg-white border-white/50 rounded-2xl focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all font-medium text-slate-900 flex-1 shadow-sm"
                                    autoFocus
                                />
                                <Button
                                    onClick={handleAddModule}
                                    disabled={isSaving || !newModuleName.trim()}
                                    className="h-14 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-900/10 transition-all"
                                >
                                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Module"}
                                </Button>
                                <Button variant="ghost" onClick={() => setIsAddingModule(false)} className="h-14 px-6 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-all">
                                    Cancel
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Curriculum Accordion */}
            <div className="space-y-4">
                {modules.length === 0 && !isAddingModule && (
                    <div className="py-20 bg-white rounded-[32px] border border-dashed border-slate-200 text-center space-y-4">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-300">
                            <Layers className="w-8 h-8" />
                        </div>
                        <div className="max-w-xs mx-auto space-y-2">
                            <p className="font-semibold text-slate-900">No Modules Yet</p>
                            <p className="text-slate-500 text-sm leading-relaxed">Start building your curriculum by adding your first educational module above.</p>
                        </div>
                    </div>
                )}

                <Accordion type="single" collapsible className="space-y-4">
                    {modules.map((module, idx) => (
                        <AccordionItem key={module._id} value={module._id} className="border-none">
                            <Card className="rounded-[28px] border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group">
                                <AccordionTrigger className="p-0 hover:no-underline">
                                    <div className="flex items-center gap-6 p-6 md:p-8 w-full text-left">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-600 font-bold group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm border border-slate-100/50">
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-xl font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{module.name}</h3>
                                            <div className="flex items-center gap-4 mt-1">
                                                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {module.lessons?.length || 0} SESSIONS
                                                </div>
                                                <div className="w-1 h-1 rounded-full bg-slate-300" />
                                                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-500">
                                                    <Layers className="w-3.5 h-3.5" />
                                                    PROVISIONED
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-8 pb-8 pt-0 space-y-6">
                                    <div className="h-px bg-slate-50 w-full mb-6" />

                                    {/* Existing Lessons List */}
                                    <div className="grid gap-3">
                                        {module.lessons?.map((lesson: any, sIdx: number) => (
                                            <div key={lesson._id} className="group/session flex items-center gap-4 p-5 bg-slate-50/50 border border-slate-100 rounded-2xl hover:bg-white hover:shadow-lg hover:shadow-slate-200/50 hover:border-indigo-100 transition-all duration-300">
                                                <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover/session:text-indigo-600 transition-colors shadow-sm">
                                                    {lesson.videoUrl ? <Video className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Session {sIdx + 1}</p>
                                                    <h4 className="font-semibold text-slate-900 truncate uppercase tracking-tight">{lesson.name}</h4>
                                                </div>
                                                {lesson.assignment?.title && (
                                                    <Badge className="bg-amber-50 text-amber-700 border-amber-100 text-[9px] font-bold uppercase tracking-widest px-3 py-1">
                                                        <Award className="w-3 h-3 mr-1.5" />
                                                        {lesson.assignment.type}: {lesson.assignment.title}
                                                    </Badge>
                                                )}
                                                <Button variant="ghost" size="icon" className="text-slate-300 hover:text-rose-500 rounded-xl">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Add Session Area */}
                                    {activeModuleId === module._id ? (
                                        <Card className="bg-indigo-50/20 border-indigo-100 rounded-[24px] overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                                            <CardHeader className="bg-white/50 border-b border-indigo-50 p-6 flex flex-row items-center justify-between">
                                                <div>
                                                    <CardTitle className="text-lg font-bold text-indigo-900">Add Learning Session</CardTitle>
                                                    <CardDescription className="text-xs font-medium text-indigo-600/70">Define a lesson and its corresponding task.</CardDescription>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">{module.lessons?.length + 1}</div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="p-8 space-y-6">
                                                <div className="grid md:grid-cols-2 gap-6">
                                                    <div className="space-y-4">
                                                        <div className="space-y-2">
                                                            <Label className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 ml-1">Session Title</Label>
                                                            <Input value={newLesson.name} onChange={e => setNewLesson({ ...newLesson, name: e.target.value })} placeholder="e.g. Logic Gates & Signal Flow" className="bg-white border-indigo-100 h-12 rounded-xl" />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 ml-1">Video Source URL (Optional)</Label>
                                                            <div className="relative">
                                                                <Video className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-300" />
                                                                <Input value={newLesson.videoUrl} onChange={e => setNewLesson({ ...newLesson, videoUrl: e.target.value })} placeholder="https://vimeo.com/..." className="pl-10 bg-white border-indigo-100 h-12 rounded-xl" />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 ml-1">Session Notes / Resources</Label>
                                                            <div className="bg-white rounded-xl border border-indigo-100 overflow-hidden min-h-[200px]">
                                                                <ReactQuill
                                                                    theme="snow"
                                                                    value={newLesson.content}
                                                                    onChange={content => setNewLesson({ ...newLesson, content })}
                                                                    placeholder="Provide rich details for this session..."
                                                                    className="h-[150px] border-none"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-4 bg-white/60 p-6 rounded-2xl border border-indigo-50 shadow-inner">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Award className="w-4 h-4 text-amber-500" />
                                                            <h4 className="text-sm font-bold text-indigo-900 uppercase tracking-tight">Graduation Task</h4>
                                                        </div>

                                                        <div className="space-y-3">
                                                            <div className="space-y-1.5">
                                                                <Label className="text-[10px] font-bold text-slate-500">Submission Mode</Label>
                                                                <select
                                                                    className="w-full h-11 px-3 rounded-xl border-indigo-100 border text-sm bg-white focus:ring-1 focus:ring-indigo-500 transition-all"
                                                                    value={newLesson.assignment.type || 'task'}
                                                                    onChange={(e) => setNewLesson({
                                                                        ...newLesson,
                                                                        assignment: { ...newLesson.assignment, type: e.target.value as any }
                                                                    })}
                                                                >
                                                                    <option value="task">File Upload Portfolio</option>
                                                                    <option value="quiz">Interactive CBT Quiz</option>
                                                                    <option value="video">Direct Video Pitch</option>
                                                                </select>
                                                            </div>

                                                            <div className="space-y-1.5">
                                                                <Label className="text-[10px] font-bold text-slate-500">Task Title</Label>
                                                                <Input
                                                                    placeholder="e.g. System Diagram Output"
                                                                    value={newLesson.assignment.title}
                                                                    onChange={e => setNewLesson({ ...newLesson, assignment: { ...newLesson.assignment, title: e.target.value } })}
                                                                    className="bg-white border-indigo-100 h-11 rounded-xl"
                                                                />
                                                            </div>

                                                            <div className="space-y-1.5">
                                                                <Label className="text-[10px] font-bold text-slate-500">Brief Overview</Label>
                                                                <Input
                                                                    placeholder="Describe the expected output..."
                                                                    value={newLesson.assignment.description}
                                                                    onChange={e => setNewLesson({ ...newLesson, assignment: { ...newLesson.assignment, description: e.target.value } })}
                                                                    className="bg-white border-indigo-100 h-11 rounded-xl"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* QUIZ BUILDER UI */}
                                                {(newLesson.assignment.type === 'quiz' as any) && (
                                                    <div className="bg-white/80 p-8 rounded-[24px] border border-indigo-100 shadow-xl shadow-indigo-100/30 space-y-6 animate-in slide-in-from-top-2 duration-300">
                                                        <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                                                            <h5 className="text-sm font-bold text-indigo-900 uppercase tracking-widest flex items-center gap-2">
                                                                <Sparkles className="w-4 h-4" /> Quiz Architect
                                                            </h5>
                                                            <p className="text-[10px] font-bold text-slate-400">{(newLesson.assignment.questions || []).length} CHALLENGES ADDED</p>
                                                        </div>

                                                        <div className="space-y-6">
                                                            {(newLesson.assignment.questions || []).map((q: any, qIdx: number) => (
                                                                <div key={qIdx} className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 space-y-4 relative group/quiz">
                                                                    <div className="flex items-center gap-3 mb-2">
                                                                        <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">Q{qIdx + 1}</div>
                                                                        <Input
                                                                            placeholder="Define your question challenge..."
                                                                            value={q.question}
                                                                            onChange={(e) => {
                                                                                const updatedQuestions = [...(newLesson.assignment.questions || [])];
                                                                                updatedQuestions[qIdx].question = e.target.value;
                                                                                setNewLesson({ ...newLesson, assignment: { ...newLesson.assignment, questions: updatedQuestions } });
                                                                            }}
                                                                            className="bg-white border-slate-200 h-12 rounded-xl flex-1 font-semibold"
                                                                        />
                                                                    </div>
                                                                    <div className="grid grid-cols-2 gap-3 pl-10">
                                                                        {q.options.map((opt: string, oIdx: number) => (
                                                                            <div key={oIdx} className="relative">
                                                                                <div className={cn(
                                                                                    "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold transition-all",
                                                                                    q.correctAnswer === oIdx ? "bg-emerald-500 border-emerald-500 text-white" : "bg-slate-50 border-slate-200 text-slate-400"
                                                                                )}>
                                                                                    {String.fromCharCode(65 + oIdx)}
                                                                                </div>
                                                                                <Input
                                                                                    placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                                                                                    value={opt}
                                                                                    onChange={(e) => {
                                                                                        const updatedQuestions = [...(newLesson.assignment.questions || [])];
                                                                                        updatedQuestions[qIdx].options[oIdx] = e.target.value;
                                                                                        setNewLesson({ ...newLesson, assignment: { ...newLesson.assignment, questions: updatedQuestions } });
                                                                                    }}
                                                                                    className={cn(
                                                                                        "pl-10 h-11 rounded-xl transition-all font-medium",
                                                                                        q.correctAnswer === oIdx ? "border-emerald-200 bg-emerald-50/30 ring-1 ring-emerald-500/20" : "bg-white border-slate-200"
                                                                                    )}
                                                                                />
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => {
                                                                                        const updatedQuestions = [...(newLesson.assignment.questions || [])];
                                                                                        updatedQuestions[qIdx].correctAnswer = oIdx;
                                                                                        setNewLesson({ ...newLesson, assignment: { ...newLesson.assignment, questions: updatedQuestions } });
                                                                                    }}
                                                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-400 hover:text-emerald-600 tracking-tighter transition-colors uppercase"
                                                                                >
                                                                                    MARK CORRECT
                                                                                </button>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            disabled={(newLesson.assignment.questions || []).length >= 10}
                                                            className="w-full h-12 border-dashed border-2 border-indigo-100 rounded-xl text-indigo-600 font-bold hover:bg-indigo-50 transition-all border-spacing-4 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            onClick={() => {
                                                                const currentQuestions = newLesson.assignment.questions || [];
                                                                if (currentQuestions.length >= 10) return;
                                                                setNewLesson({
                                                                    ...newLesson,
                                                                    assignment: {
                                                                        ...newLesson.assignment,
                                                                        questions: [...currentQuestions, { question: '', options: ['', '', '', ''], correctAnswer: 0 }]
                                                                    }
                                                                });
                                                            }}
                                                        >
                                                            <Plus className="w-4 h-4 mr-2" />
                                                            {(newLesson.assignment.questions || []).length >= 10 ? 'MAXIMUM 10 QUESTIONS REACHED' : 'Append Challenge Question'}
                                                        </Button>
                                                        {(newLesson.assignment.questions || []).length >= 10 && (
                                                            <p className="text-center text-xs font-bold text-amber-600">
                                                                Maximum of 10 questions allowed per quiz.
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </CardContent>
                                            <CardFooter className="bg-slate-50/50 p-6 flex justify-end gap-3 border-t border-indigo-50">
                                                <Button variant="ghost" onClick={() => setActiveModuleId(null)} className="rounded-xl font-bold text-slate-500">Cancel</Button>
                                                <Button
                                                    onClick={() => handleAddLesson(module._id)}
                                                    disabled={isSaving || !newLesson.name}
                                                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl h-11 px-8 shadow-md"
                                                >
                                                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Establish Session"}
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            className="w-full h-14 border-dashed border-2 border-slate-200 rounded-2xl text-slate-400 font-bold hover:bg-slate-50 hover:border-indigo-200 hover:text-indigo-500 transition-all duration-300"
                                            onClick={() => setActiveModuleId(module._id)}
                                        >
                                            <Plus className="w-5 h-5 mr-3" /> Initialize New Learning Session
                                        </Button>
                                    )}
                                </AccordionContent>
                            </Card>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>

            {/* Completion Section */}
            <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100">
                        <CheckCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Syllabus Complete?</p>
                        <p className="text-slate-500 font-medium text-sm leading-relaxed">Once you finish, the course will be provisioned into the database.</p>
                    </div>
                </div>
                <Button
                    onClick={onComplete}
                    size="lg"
                    className="h-16 px-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-[24px] shadow-xl shadow-emerald-900/10 transition-all active:scale-95 flex items-center gap-3 whitespace-nowrap"
                >
                    Finalize Syllabus Architecture
                    <ArrowRight className="w-5 h-5" />
                </Button>
            </div>
        </div>
    );
}
