'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Plus, CheckCircle, CheckCircle2, Video, FileText, Trash2, GripVertical, Sparkles, ChevronDown, Clock, Layers, Award, ArrowRight, Loader2, PlusCircle, Pencil, Save, X, Upload, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);
    const [aiDifficulty, setAiDifficulty] = useState<'easy' | 'hard'>('easy');
    const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
    const [editingModuleName, setEditingModuleName] = useState('');
 
    useEffect(() => {
        if (initialModules) {
            setModules(initialModules);
        }
    }, [initialModules]);

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
    const [editingLessonId, setEditingLessonId] = useState<string | null>(null);

    // Delete confirmation state
    const [deleteConfirm, setDeleteConfirm] = useState<{
        isOpen: boolean;
        type: 'module' | 'lesson';
        moduleId?: string;
        lessonId?: string;
        title: string;
    }>({
        isOpen: false,
        type: 'module',
        title: ''
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

    const handleUpdateModule = async (moduleId: string) => {
        if (!editingModuleName.trim()) return;
        setIsSaving(true);
        try {
            const updatedModule = await api.updateModule(moduleId, {
                name: editingModuleName
            });
            setModules(modules.map(m => m._id === moduleId ? { ...m, name: updatedModule.name } : m));
            setEditingModuleId(null);
            setEditingModuleName('');
            toast.success('Module updated.');
        } catch (error) {
            toast.error('Failed to update module.');
        } finally {
            setIsSaving(false);
        }
    };
    const handleAddLesson = async (moduleId: string) => {
        if (!newLesson.name) return;
        setIsSaving(true);
        try {
            if (editingLessonId) {
                const updatedLesson = await api.updateLesson(editingLessonId, {
                    ...newLesson
                });
                const updatedModules = modules.map(m => {
                    if (m._id === moduleId) {
                        return {
                            ...m,
                            lessons: m.lessons.map((l: any) => l._id === editingLessonId ? updatedLesson : l)
                        };
                    }
                    return m;
                });
                setModules(updatedModules);
                toast.success('Learning session updated.');
            } else {
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
                toast.success('Learning session established.');
            }

            setNewLesson({
                name: '',
                content: '',
                videoUrl: '',
                duration: 0,
                assignment: { title: '', description: '', maxScore: 10, type: 'task', questions: [] }
            });
            setActiveModuleId(null);
            setEditingLessonId(null);
        } catch (error) {
            toast.error(editingLessonId ? 'Failed to update session.' : 'Failed to create session.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteLesson = (moduleId: string, lessonId: string, title: string) => {
        setDeleteConfirm({
            isOpen: true,
            type: 'lesson',
            moduleId,
            lessonId,
            title
        });
    };

    const handleDeleteModule = (moduleId: string, title: string) => {
        setDeleteConfirm({
            isOpen: true,
            type: 'module',
            moduleId,
            title
        });
    };

    const confirmDelete = async () => {
        const { type, moduleId, lessonId } = deleteConfirm;
        setIsSaving(true);
        try {
            if (type === 'module' && moduleId) {
                await api.deleteModule(moduleId);
                setModules(prev => prev.filter(m => m._id !== moduleId));
                toast.success('Module and associated data removed.');
            } else if (type === 'lesson' && lessonId && moduleId) {
                await api.deleteLesson(lessonId);
                setModules(prev => prev.map(m => {
                    if (m._id === moduleId) {
                        return { ...m, lessons: m.lessons.filter((l: any) => l._id !== lessonId) };
                    }
                    return m;
                }));
                toast.success('Session removed.');
            }
        } catch (error) {
            toast.error(`Failed to remove ${type}.`);
        } finally {
            setIsSaving(false);
            setDeleteConfirm(prev => ({ ...prev, isOpen: false }));
        }
    };

    const handleGenerateAIQuiz = async () => {
        setIsGeneratingAI(true);
        try {
            const aiQuestions = await api.generateAIQuiz({
                title: newLesson.name,
                description: newLesson.content,
                difficulty: aiDifficulty
            });

            setNewLesson({
                ...newLesson,
                assignment: {
                    ...newLesson.assignment,
                    questions: aiQuestions
                }
            });
            toast.success(`AI generated ${aiQuestions.length} questions successfully.`);
        } catch (error) {
            toast.error('Failed to generate quiz with AI. Please check your API key/configuration.');
        } finally {
            setIsGeneratingAI(false);
        }
    };

    const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const text = event.target?.result as string;
                if (!text) return;

                const lines = text.split('\n').filter(line => line.trim() !== '');
                if (lines.length < 2) {
                    toast.error('CSV file is empty or missing data.');
                    return;
                }

                // Expected format: question,option1,option2,option3,option4,correctAnswerIndex
                const questions: any[] = lines.slice(1).map(line => {
                    // Handle quoted values if necessary, but simple split for now
                    const parts = line.split(',').map(p => p.trim().replace(/^"|"$/g, ''));
                    if (parts.length < 6) return null;
                    return {
                        question: parts[0],
                        options: [parts[1], parts[2], parts[3], parts[4]],
                        correctAnswer: Math.min(3, Math.max(0, parseInt(parts[5]) || 0))
                    };
                }).filter(q => q !== null);

                if (questions.length > 0) {
                    setNewLesson({
                        ...newLesson,
                        assignment: {
                            ...newLesson.assignment,
                            questions: [...(newLesson.assignment.questions || []), ...questions].slice(0, 10)
                        }
                    });
                    toast.success(`Extracted ${questions.length} questions.`);
                } else {
                    toast.error('Invalid CSV format. Use: question,opt1,opt2,opt3,opt4,correctIndex');
                }
            } catch (err) {
                toast.error('Failed to parse CSV file.');
            }
        };
        reader.readAsText(file);
        // Reset input
        e.target.value = '';
    };

    const downloadSampleCSV = () => {
        const content = "question,option1,option2,option3,option4,correctAnswerIndex\nWhat is the capital of France?,Paris,London,Berlin,Madrid,0\nWhich planet is known as the Red Planet?,Venus,Mars,Jupiter,Saturn,1";
        const blob = new Blob([content], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'quiz_template.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-10">
            {/* Module Manager Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h2 className="text-xl md:text-2xl font-medium text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                            <Layers className="w-5 h-5" />
                        </div>
                        Curriculum Architecture
                    </h2>
                    <p className="text-slate-500 font-medium ml-0 md:ml-13 text-sm md:text-base">Structure your course into modules and deep-dive sessions.</p>
                </div>
                <Button
                    onClick={() => setIsAddingModule(true)}
                    disabled={isAddingModule}
                    className="h-12 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-lg shadow-indigo-100 transition-all active:scale-95 flex items-center gap-2 w-full md:w-auto"
                >
                    <Plus className="w-4 h-4" /> Add Module
                </Button>
            </div>

            {/* In-line Add Module Form */}
            {isAddingModule && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                    <Card className="border-2 border-dashed border-indigo-200 bg-indigo-50/30 rounded-[28px] overflow-hidden">
                        <CardContent className="p-6 md:p-8 space-y-4">
                            <Label className="text-[10px] md:text-xs font-medium uppercase tracking-widest text-indigo-600 ml-1">New Module Title</Label>
                            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                                <Input
                                    value={newModuleName}
                                    onChange={(e) => setNewModuleName(e.target.value)}
                                    placeholder="e.g. Fundamental Logic and Structures"
                                    className="h-12 md:h-14 bg-white border-white/50 rounded-2xl focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all font-medium text-slate-900 flex-1 shadow-sm text-sm md:text-base"
                                    autoFocus
                                />
                                <div className="flex gap-2">
                                    <Button
                                        onClick={handleAddModule}
                                        disabled={isSaving || !newModuleName.trim()}
                                        className="h-12 md:h-14 px-6 md:px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-2xl shadow-lg shadow-indigo-900/10 transition-all flex-1 sm:flex-none text-sm md:text-base"
                                    >
                                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Module"}
                                    </Button>
                                    <Button variant="ghost" onClick={() => setIsAddingModule(false)} className="h-12 md:h-14 px-4 md:px-6 rounded-2xl font-medium text-slate-500 hover:bg-slate-100 transition-all text-sm md:text-base">
                                        Cancel
                                    </Button>
                                </div>
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
                            <p className="font-medium text-slate-900">No Modules Yet</p>
                            <p className="text-slate-500 text-sm leading-relaxed">Start building your curriculum by adding your first educational module above.</p>
                        </div>
                    </div>
                )}

                <Accordion type="single" collapsible className="space-y-4">
                    {modules.map((module, idx) => (
                        <AccordionItem key={module._id} value={module._id} className="border-none">
                            <Card className="rounded-[28px] md:border-slate-100 overflow-hidden md:shadow-sm hover:shadow-md transition-all duration-300 group">
                                <AccordionTrigger className="p-0 hover:no-underline">
                                    <div className="flex items-center gap-4 md:gap-6 p-5 md:p-8 w-full text-left">
                                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-600 font-medium group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 md:shadow-sm md:border md:border-slate-100/50 shrink-0 text-sm md:text-base">
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            {editingModuleId === module._id ? (
                                                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                                    <Input
                                                        value={editingModuleName}
                                                        onChange={(e) => setEditingModuleName(e.target.value)}
                                                        className="h-9 bg-white border-indigo-200 rounded-lg text-sm font-medium"
                                                        autoFocus
                                                    />
                                                    <Button
                                                        size="sm"
                                                        className="h-9 px-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                                                        onClick={() => handleUpdateModule(module._id)}
                                                        disabled={isSaving || !editingModuleName.trim()}
                                                    >
                                                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-9 px-3 text-slate-400"
                                                        onClick={() => {
                                                            setEditingModuleId(null);
                                                            setEditingModuleName('');
                                                        }}
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-between group/title gap-4 flex-1 min-w-0">
                                                    <h3 className="text-lg md:text-xl font-medium text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight truncate flex-1 text-left min-w-0">
                                                        {module.name}
                                                    </h3>
                                                    <div className="flex items-center gap-1 shrink-0">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setEditingModuleId(module._id);
                                                                setEditingModuleName(module.name);
                                                            }}
                                                        >
                                                            <Pencil className="w-3.5 h-3.5" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                                            disabled={isSaving}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteModule(module._id, module.name);
                                                            }}
                                                        >
                                                            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                                                <div className="flex items-center gap-1.5 text-[10px] md:text-xs font-medium text-slate-400">
                                                    <Clock className="w-3 md:w-3.5 h-3 md:h-3.5" />
                                                    {module.lessons?.length || 0} SESSIONS
                                                </div>
                                                <div className="hidden md:block w-1 h-1 rounded-full bg-slate-300" />
                                                <div className="flex items-center gap-1.5 text-[10px] md:text-xs font-medium text-indigo-500">
                                                    <Layers className="w-3 md:w-3.5 h-3 md:h-3.5" />
                                                    PROVISIONED
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="p-2 md:px-8 pb-8 pt-0 space-y-6">
                                    <div className="h-px bg-slate-50 w-full mb-6" />

                                    {/* Existing Lessons List */}
                                    <div className="grid gap-3">
                                        {module.lessons?.map((lesson: any, sIdx: number) => (
                                            <div key={lesson._id} className="group/session flex flex-col justify-start gap-4 p-4 md:p-5 rounded-2xl hover:bg-white hover:shadow-lg hover:shadow-slate-200/50 hover:border-indigo-100 transition-all duration-300 w-full overflow-hidden">
                                                <div className="flex items-center gap-4 flex-1 min-w-0 max-w-full">
                                                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover/session:text-indigo-600 transition-colors shadow-sm shrink-0">
                                                        {lesson.videoUrl ? <Video className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-0.5">Session {sIdx + 1}</p>
                                                        <h4 className="font-medium text-slate-900 truncate uppercase tracking-tight text-sm md:text-base">{lesson.name}</h4>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto shrink-0 min-w-0">
                                                    {lesson.assignment?.title && (
                                                        <Badge className="bg-amber-50 text-amber-700 border-amber-100 text-[9px] font-medium uppercase tracking-widest px-2 md:px-3 py-1 truncate max-w-[150px] md:max-w-[200px] flex items-center">
                                                            <Award className="w-3 h-3 mr-1 md:mr-1.5 shrink-0" />
                                                            <span className="truncate">{lesson.assignment.type}: {lesson.assignment.title}</span>
                                                        </Badge>
                                                    )}
                                                    <div className="flex items-center gap-1 shrink-0">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl h-9 w-9 transition-all"
                                                            onClick={() => {
                                                                setNewLesson({
                                                                    name: lesson.name,
                                                                    content: lesson.content || '',
                                                                    videoUrl: lesson.videoUrl || '',
                                                                    duration: lesson.duration || 0,
                                                                    assignment: lesson.assignment || { title: '', description: '', maxScore: 10, type: 'task', questions: [] }
                                                                });
                                                                setEditingLessonId(lesson._id);
                                                                setActiveModuleId(module._id);
                                                            }}
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl h-9 w-9 transition-all"
                                                            onClick={() => handleDeleteLesson(module._id, lesson._id, lesson.name)}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Add Session Area */}
                                    {activeModuleId === module._id ? (
                                        <Card className="border-0 shadow-0 p-0 md:bg-indigo-50/20 md:border-indigo-100 rounded-[24px] overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                                            <CardHeader className="md:bg-white/50 md:border-b md:border-indigo-50 p-2 md:p-6 flex flex-row items-center justify-between">
                                                <div>
                                                    <CardTitle className="text-lg font-medium text-indigo-900">{editingLessonId ? 'Modify Learning Session' : 'Add Learning Session'}</CardTitle>
                                                    <CardDescription className="text-xs font-medium text-indigo-600/70">{editingLessonId ? 'Update session details and graduation task.' : 'Define a lesson and its corresponding task.'}</CardDescription>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium text-xs">{module.lessons?.length + 1}</div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="p-2 md:p-8 space-y-6">
                                                <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                                                    <div className="space-y-4">
                                                        <div className="space-y-2">
                                                            <Label className="text-[10px] font-medium uppercase tracking-widest text-indigo-400 ml-1">Session Title</Label>
                                                            <Input value={newLesson.name} onChange={e => setNewLesson({ ...newLesson, name: e.target.value })} placeholder="e.g. Logic Gates & Signal Flow" className="bg-white border-indigo-100 h-11 md:h-12 rounded-xl text-sm md:text-base" />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="text-[10px] font-medium uppercase tracking-widest text-indigo-400 ml-1">Video Source URL (Optional)</Label>
                                                            <div className="relative">
                                                                <Video className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-300" />
                                                                <Input value={newLesson.videoUrl} onChange={e => setNewLesson({ ...newLesson, videoUrl: e.target.value })} placeholder="https://vimeo.com/..." className="pl-10 bg-white border-indigo-100 h-11 md:h-12 rounded-xl text-sm md:text-base" />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="text-[10px] font-medium uppercase tracking-widest text-indigo-400 ml-1">Session Notes / Resources</Label>
                                                            <div className="bg-white rounded-xl border border-indigo-100 overflow-hidden min-h-[180px] md:min-h-[400px]">
                                                                <ReactQuill
                                                                    theme="snow"
                                                                    value={newLesson.content}
                                                                    onChange={content => setNewLesson({ ...newLesson, content })}
                                                                    placeholder="Provide rich details for this session..."
                                                                    className="h-[120px] md:h-[350px] border-none"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-4 bg-white/60 p-5 md:p-6 rounded-2xl border border-indigo-50 shadow-inner">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Award className="w-4 h-4 text-amber-500" />
                                                            <h4 className="text-xs md:text-sm font-medium text-indigo-900 uppercase tracking-tight">Graduation Task</h4>
                                                        </div>

                                                        <div className="space-y-3">
                                                            <div className="space-y-1.5">
                                                                <Label className="text-[10px] font-medium text-slate-500">Submission Mode</Label>
                                                                <select
                                                                    className="w-full h-10 md:h-11 px-3 rounded-xl border-indigo-100 border text-xs md:text-sm bg-white focus:ring-1 focus:ring-indigo-500 transition-all outline-none"
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
                                                                <Label className="text-[10px] font-medium text-slate-500">Task Title</Label>
                                                                <Input
                                                                    placeholder="e.g. System Diagram Output"
                                                                    value={newLesson.assignment.title}
                                                                    onChange={e => setNewLesson({ ...newLesson, assignment: { ...newLesson.assignment, title: e.target.value } })}
                                                                    className="bg-white border-indigo-100 h-10 md:h-11 rounded-xl text-xs md:text-sm"
                                                                />
                                                            </div>

                                                            <div className="space-y-1.5">
                                                                <Label className="text-[10px] font-medium text-slate-500">Brief Overview</Label>
                                                                <Input
                                                                    placeholder="Describe the expected output..."
                                                                    value={newLesson.assignment.description}
                                                                    onChange={e => setNewLesson({ ...newLesson, assignment: { ...newLesson.assignment, description: e.target.value } })}
                                                                    className="bg-white border-indigo-100 h-10 md:h-11 rounded-xl text-xs md:text-sm"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* QUIZ BUILDER UI */}
                                                {(newLesson.assignment.type === 'quiz' as any) && (
                                                    <div className="bg-white/80 p-8 rounded-[24px] border border-indigo-100 shadow-xl shadow-indigo-100/30 space-y-6 animate-in slide-in-from-top-2 duration-300">
                                                        <div className="md:flex items-center justify-between border-b border-slate-50 pb-4">
                                                            <div className="space-y-1">
                                                                <h5 className="text-sm font-medium text-indigo-900 uppercase tracking-widest flex items-center gap-2">
                                                                    {/* <Sparkles className="w-4 h-4" />  */}
                                                                    Quiz Architect
                                                                </h5>
                                                                <p className="text-[10px] font-medium text-slate-400">{(newLesson.assignment.questions || []).length} CHALLENGES ADDED</p>
                                                            </div>
                                                            <div className="flex mt-4 md:mt-0 items-center gap-4 bg-indigo-50/50 p-2 rounded-2xl border border-indigo-100/50">
                                                                <div className="flex items-center gap-2 px-2">
                                                                    <Label className="text-[10px] font-medium text-indigo-400 uppercase tracking-tight">Level:</Label>
                                                                    <select
                                                                        value={aiDifficulty}
                                                                        onChange={(e) => setAiDifficulty(e.target.value as any)}
                                                                        className="bg-transparent text-[10px] font-medium text-indigo-600 outline-none cursor-pointer"
                                                                    >
                                                                        <option value="easy">Easy</option>
                                                                        <option value="hard">Hard</option>
                                                                    </select>
                                                                </div>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    disabled={isGeneratingAI || !newLesson.name}
                                                                    onClick={handleGenerateAIQuiz}
                                                                    className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-lg shadow-indigo-900/10 gap-2 transition-all active:scale-95 text-xs"
                                                                >
                                                                    {isGeneratingAI ? (
                                                                        <>
                                                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                                            GENERATING...
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            {/* <Sparkles className="w-3.5 h-3.5" /> */}
                                                                            GENERATE WITH AI
                                                                        </>
                                                                    )}
                                                                </Button>
                                                                
                                                                <div className="w-px h-6 bg-indigo-100 mx-1 hidden md:block" />
                                                                
                                                                <div className="flex items-center gap-2">
                                                                    <input 
                                                                        type="file" 
                                                                        accept=".csv" 
                                                                        className="hidden" 
                                                                        id="csv-upload" 
                                                                        onChange={handleCSVUpload}
                                                                    />
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        className="h-9 px-4 border-indigo-200 text-indigo-600 hover:bg-indigo-50 font-medium rounded-xl gap-2 transition-all text-xs"
                                                                        onClick={() => document.getElementById('csv-upload')?.click()}
                                                                    >
                                                                        <Upload className="w-3.5 h-3.5" />
                                                                        BULK IMPORT
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        className="h-9 w-9 p-0 text-slate-400 hover:text-indigo-600 rounded-xl"
                                                                        title="Download Sample CSV Template"
                                                                        onClick={downloadSampleCSV}
                                                                    >
                                                                        <FileSpreadsheet className="w-4 h-4" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-6 mt-4 md:mt-0">
                                                            {(newLesson.assignment.questions || []).map((q: any, qIdx: number) => (
                                                                <div key={qIdx} className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 space-y-4 relative group/quiz">
                                                                    <div className="flex items-center gap-3 mb-2">
                                                                        <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white text-[10px] font-medium flex items-center justify-center">Q{qIdx + 1}</div>
                                                                        <Input
                                                                            placeholder="Define your question challenge..."
                                                                            value={q.question}
                                                                            onChange={(e) => {
                                                                                const updatedQuestions = [...(newLesson.assignment.questions || [])];
                                                                                updatedQuestions[qIdx].question = e.target.value;
                                                                                setNewLesson({ ...newLesson, assignment: { ...newLesson.assignment, questions: updatedQuestions } });
                                                                            }}
                                                                            className="bg-white border-slate-200 h-12 rounded-xl flex-1 font-medium"
                                                                        />
                                                                    </div>
                                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-0 md:pl-10">
                                                                        {(q.options || []).map((opt: string, oIdx: number) => (
                                                                            <div key={oIdx} className="relative group/opt">
                                                                                <Input
                                                                                    value={opt}
                                                                                    onChange={(e) => {
                                                                                        const newQs = [...(newLesson.assignment.questions || [])];
                                                                                        newQs[qIdx].options[oIdx] = e.target.value;
                                                                                        setNewLesson({ ...newLesson, assignment: { ...newLesson.assignment, questions: newQs } });
                                                                                    }}
                                                                                    placeholder={`Option ${oIdx + 1}`}
                                                                                    className={cn(
                                                                                        "h-10 md:h-11 pl-4 pr-10 bg-white border-slate-100 rounded-xl text-xs transition-all focus:border-indigo-300",
                                                                                        q.correctAnswer === oIdx && "border-indigo-500 bg-indigo-50/30 ring-1 ring-indigo-500/20"
                                                                                    )}
                                                                                />
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => {
                                                                                        const newQs = [...(newLesson.assignment.questions || [])];
                                                                                        newQs[qIdx].correctAnswer = oIdx;
                                                                                        setNewLesson({ ...newLesson, assignment: { ...newLesson.assignment, questions: newQs } });
                                                                                    }}
                                                                                    className={cn(
                                                                                        "absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg flex items-center justify-center transition-all",
                                                                                        q.correctAnswer === oIdx
                                                                                            ? "bg-indigo-600 text-white shadow-md"
                                                                                            : "bg-slate-50 text-slate-300 hover:bg-slate-100 hover:text-slate-400"
                                                                                    )}
                                                                                >
                                                                                    <CheckCircle2 className="w-4 h-4" />
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
                                                            className="w-full border-dashed border-2 border-indigo-100 hover:border-indigo-300 hover:bg-indigo-50/50 rounded-xl h-11 md:h-12 text-indigo-600 font-medium gap-2 text-xs md:text-sm"
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
                                                            <p className="text-center text-xs font-medium text-amber-600">
                                                                Maximum of 10 questions allowed per quiz.
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </CardContent>
                                            <CardFooter className="md:bg-slate-50/50 md:p-6 flex justify-end gap-3 border-t border-indigo-50">
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => {
                                                        setActiveModuleId(null);
                                                        setEditingLessonId(null);
                                                        setNewLesson({
                                                            name: '',
                                                            content: '',
                                                            videoUrl: '',
                                                            duration: 0,
                                                            assignment: { title: '', description: '', maxScore: 10, type: 'task', questions: [] }
                                                        });
                                                    }}
                                                    className="rounded-xl font-medium text-slate-500"
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    onClick={() => handleAddLesson(module._id)}
                                                    disabled={isSaving || !newLesson.name}
                                                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl h-11 px-8 shadow-md"
                                                >
                                                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : (editingLessonId ? "Save Changes" : "Establish Session")}
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            className="w-full h-14 border-dashed border-2 border-slate-200 rounded-2xl text-slate-400 font-medium hover:bg-slate-50 hover:border-indigo-200 hover:text-indigo-500 transition-all duration-300"
                                            onClick={() => {
                                                setEditingLessonId(null);
                                                setActiveModuleId(module._id);
                                            }}
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
            <div className="pt-10 md:pt-12 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
                <div className="flex items-center gap-4 text-slate-500 bg-slate-50/50 px-5 md:px-6 py-3 rounded-2xl border border-slate-100 w-full md:w-auto">
                    {/* <div className="w-8 md:w-10 h-8 md:h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                        <Sparkles className="w-4 md:w-5 h-4 md:h-5" />
                    </div> */}
                    <p className="text-[10px] md:text-sm font-medium leading-tight">
                        You can always return to <span className="text-indigo-600 font-medium">The Architect</span> to refine your curriculum later.
                    </p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Button
                        onClick={onComplete}
                        className="h-12 md:h-14 px-8 md:px-10 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-2xl shadow-lg shadow-indigo-100 transition-all active:scale-95 group text-sm md:text-base flex-1 md:flex-none"
                    >
                        Publish Curriculum
                        <ArrowRight className="w-4 md:w-5 h-4 md:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog 
                open={deleteConfirm.isOpen} 
                onOpenChange={(open) => setDeleteConfirm(prev => ({ ...prev, isOpen: open }))}
            >
                <AlertDialogContent className="rounded-[32px] border-slate-100 shadow-2xl p-8 max-w-md">
                    <AlertDialogHeader className="space-y-4">
                        <div className="w-16 h-16 rounded-3xl bg-rose-50 flex items-center justify-center text-rose-500 mx-auto mb-2">
                            <Trash2 className="w-8 h-8" />
                        </div>
                        <AlertDialogTitle className="text-2xl font-medium text-center text-slate-900">
                            Confirm Removal
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-center text-slate-500 text-base leading-relaxed">
                            Are you sure you want to remove <span className="text-slate-900 font-medium italic">"{deleteConfirm.title}"</span>? 
                            {deleteConfirm.type === 'module' 
                                ? " This will permanently delete all associated sessions, student submissions, and progress data. This action cannot be undone." 
                                : " This will remove all student submissions and progress associated with this session."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col sm:flex-row gap-3 mt-8">
                        <AlertDialogCancel className="h-12 rounded-2xl font-medium text-slate-500 hover:bg-slate-50 border-slate-100 flex-1">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            disabled={isSaving}
                            className="h-12 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-medium shadow-lg shadow-rose-100 border-none flex-1"
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Confirm Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
