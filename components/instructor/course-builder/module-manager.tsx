'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Plus, CheckCircle, Video, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';

interface ModuleManagerProps {
    courseId: string;
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

export function ModuleManager({ courseId, onComplete }: ModuleManagerProps) {
    const [modules, setModules] = useState<any[]>([]);
    const [isAddingModule, setIsAddingModule] = useState(false);
    const [newModuleName, setNewModuleName] = useState('');

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
            maxScore: 100,
            type: 'task',
            questions: []
        }
    });

    const handleAddModule = async () => {
        if (!newModuleName.trim()) return;
        try {
            const module = await api.createModule({
                courseId,
                name: newModuleName,
                description: 'Module layer'
            });
            setModules([...modules, { ...module, lessons: [] }]);
            setNewModuleName('');
            setIsAddingModule(false);
            toast.success('Class (Module) added');
        } catch (error) {
            toast.error('Failed to add module');
        }
    };

    const handleAddLesson = async (moduleId: string) => {
        if (!newLesson.name) return;
        try {
            const lesson = await api.createLesson({
                moduleId,
                ...newLesson
            });

            // Update local state
            const updatedModules = modules.map(m => {
                if (m._id === moduleId) {
                    return { ...m, lessons: [...(m.lessons || []), lesson] };
                }
                return m;
            });
            setModules(updatedModules);

            // Reset form
            setNewLesson({
                name: '',
                content: '',
                videoUrl: '',
                duration: 0,
                assignment: { title: '', description: '', maxScore: 100, type: 'task', questions: [] }
            });
            setActiveModuleId(null);
            toast.success('Session (Lesson) added');
        } catch (error) {
            toast.error('Failed to add session');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Course Classes</h2>
                <Button onClick={() => setIsAddingModule(true)} disabled={isAddingModule}>
                    <Plus className="w-4 h-4 mr-2" /> Add Class
                </Button>
            </div>

            {isAddingModule && (
                <Card className="border-dashed border-2">
                    <CardContent className="pt-6 flex gap-4">
                        <Input
                            value={newModuleName}
                            onChange={(e) => setNewModuleName(e.target.value)}
                            placeholder="Class Name (e.g., HTML Fundamentals)"
                        />
                        <Button onClick={handleAddModule}>Save</Button>
                        <Button variant="ghost" onClick={() => setIsAddingModule(false)}>Cancel</Button>
                    </CardContent>
                </Card>
            )}

            <Accordion type="single" collapsible className="w-full">
                {modules.map((module) => (
                    <AccordionItem key={module._id} value={module._id}>
                        <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold">{module.name}</span>
                                <span className="text-muted-foreground text-sm">({module.lessons?.length || 0} Sessions)</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4 px-4 py-2 bg-muted/20 rounded-b-lg">
                            {/* Existing Lessons */}
                            <div className="space-y-2">
                                {module.lessons?.map((lesson: any) => (
                                    <div key={lesson._id} className="flex justify-between items-center p-3 bg-card rounded border">
                                        <div className="flex items-center gap-2">
                                            {lesson.videoUrl ? <Video className="w-4 h-4 text-blue-500" /> : <FileText className="w-4 h-4" />}
                                            <span>{lesson.name}</span>
                                            {lesson.assignment?.title && (
                                                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                                                    Task: {lesson.assignment.title}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Add Lesson Form */}
                            {activeModuleId === module._id ? (
                                <Card className="mt-4">
                                    <CardHeader><CardTitle className="text-base">New Session</CardTitle></CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid gap-2">
                                            <Label>Session Title</Label>
                                            <Input value={newLesson.name} onChange={e => setNewLesson({ ...newLesson, name: e.target.value })} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Video URL (Optional)</Label>
                                            <Input value={newLesson.videoUrl} onChange={e => setNewLesson({ ...newLesson, videoUrl: e.target.value })} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Content/Notes</Label>
                                            <Input value={newLesson.content} onChange={e => setNewLesson({ ...newLesson, content: e.target.value })} />
                                        </div>

                                        <div className="border-t pt-4 mt-2">
                                            <Label className="font-semibold text-primary">Class Task (Graduation Requirement)</Label>
                                            <CardDescription className="mb-2">Learners pass this class by completing these tasks.</CardDescription>

                                            <div className="grid gap-3">
                                                <div className="flex gap-4">
                                                    <div className="flex-1">
                                                        <Label className="text-xs mb-1 block">Task Type</Label>
                                                        <select
                                                            className="w-full p-2 rounded-md border text-sm bg-background"
                                                            value={newLesson.assignment.type || 'task'}
                                                            onChange={(e) => setNewLesson({
                                                                ...newLesson,
                                                                assignment: { ...newLesson.assignment, type: e.target.value as any }
                                                            })}
                                                        >
                                                            <option value="task">File Upload</option>
                                                            <option value="quiz">CBT / Quiz</option>
                                                            <option value="video">Video Submission</option>
                                                        </select>
                                                    </div>
                                                    <div className="flex-[2]">
                                                        <Label className="text-xs mb-1 block">Title</Label>
                                                        <Input
                                                            placeholder="Task Title"
                                                            value={newLesson.assignment.title}
                                                            onChange={e => setNewLesson({ ...newLesson, assignment: { ...newLesson.assignment, title: e.target.value } })}
                                                        />
                                                    </div>
                                                </div>

                                                <Input
                                                    placeholder="Task Description"
                                                    value={newLesson.assignment.description}
                                                    onChange={e => setNewLesson({ ...newLesson, assignment: { ...newLesson.assignment, description: e.target.value } })}
                                                />

                                                {/* QUIZ BUILDER */}
                                                {(newLesson.assignment.type === 'quiz' as any) && (
                                                    <div className="bg-slate-50 p-4 rounded-lg border space-y-4">
                                                        <Label>Quiz Questions</Label>
                                                        {(newLesson.assignment.questions || []).map((q: any, qIdx: number) => (
                                                            <div key={qIdx} className="bg-white p-3 rounded border space-y-2">
                                                                <Input
                                                                    placeholder={`Question ${qIdx + 1}`}
                                                                    value={q.question}
                                                                    onChange={(e) => {
                                                                        const updatedQuestions = [...(newLesson.assignment.questions || [])];
                                                                        updatedQuestions[qIdx].question = e.target.value;
                                                                        setNewLesson({ ...newLesson, assignment: { ...newLesson.assignment, questions: updatedQuestions } });
                                                                    }}
                                                                />
                                                                <div className="grid grid-cols-2 gap-2">
                                                                    {q.options.map((opt: string, oIdx: number) => (
                                                                        <Input
                                                                            key={oIdx}
                                                                            placeholder={`Option ${oIdx + 1}`}
                                                                            value={opt}
                                                                            onChange={(e) => {
                                                                                const updatedQuestions = [...(newLesson.assignment.questions || [])];
                                                                                updatedQuestions[qIdx].options[oIdx] = e.target.value;
                                                                                setNewLesson({ ...newLesson, assignment: { ...newLesson.assignment, questions: updatedQuestions } });
                                                                            }}
                                                                            className={q.correctAnswer === oIdx ? "border-green-500 ring-1 ring-green-500" : ""}
                                                                        />
                                                                    ))}
                                                                </div>
                                                                <div className="flex justify-end gap-2">
                                                                    <select
                                                                        className="text-xs p-1 border rounded"
                                                                        value={q.correctAnswer}
                                                                        onChange={(e) => {
                                                                            const updatedQuestions = [...(newLesson.assignment.questions || [])];
                                                                            updatedQuestions[qIdx].correctAnswer = parseInt(e.target.value);
                                                                            setNewLesson({ ...newLesson, assignment: { ...newLesson.assignment, questions: updatedQuestions } });
                                                                        }}
                                                                    >
                                                                        {q.options.map((_: any, idx: number) => (
                                                                            <option key={idx} value={idx}>Correct Answer: Option {idx + 1}</option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        <Button
                                                            size="sm" variant="outline"
                                                            onClick={() => {
                                                                const currentQuestions = newLesson.assignment.questions || [];
                                                                setNewLesson({
                                                                    ...newLesson,
                                                                    assignment: {
                                                                        ...newLesson.assignment,
                                                                        questions: [...currentQuestions, { question: '', options: ['', '', '', ''], correctAnswer: 0 }]
                                                                    }
                                                                });
                                                            }}
                                                        >
                                                            Add Question
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex justify-end gap-2 mt-4">
                                            <Button variant="ghost" onClick={() => setActiveModuleId(null)}>Cancel</Button>
                                            <Button onClick={() => handleAddLesson(module._id)}>Add Session</Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full border-dashed"
                                    onClick={() => setActiveModuleId(module._id)}
                                >
                                    <Plus className="w-4 h-4 mr-2" /> Add Session
                                </Button>
                            )}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>

            <div className="flex justify-end pt-8 border-t">
                <Button onClick={onComplete} size="lg" className="bg-green-600 hover:bg-green-700">
                    <CheckCircle className="w-4 h-4 mr-2" /> Finish Course Setup
                </Button>
            </div>
        </div>
    );
}
