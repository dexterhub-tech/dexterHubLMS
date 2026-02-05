'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Upload, Video, FileText, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

// MOCK DATA FOR DEMO
const MOCK_QUIZ = {
    title: 'CBT Exam: Advanced HTML & Accessibility',
    description: 'Complete this multipy-choice exam to demonstrate your understanding of semantic HTML and ARIA.',
    type: 'quiz',
    questions: [
        {
            question: 'What does ARIA stand for?',
            options: ['Accessible Rich Internet Applications', 'Advanced Responsive Interface Areas', 'Automated Rendering Interface Agent', 'Application Rich Interaction Areas'],
            correctAnswer: 0
        },
        {
            question: 'Which tag is best for navigation links?',
            options: ['<div class="nav">', '<navigation>', '<nav>', '<links>'],
            correctAnswer: 2
        },
        {
            question: 'What is the correct way to hide an element visually but keep it available for screen readers?',
            options: ['display: none', 'visibility: hidden', 'width: 0; height: 0', 'sr-only class (clip-path pattern)'],
            correctAnswer: 3
        }
    ]
};

const MOCK_UPLOAD = {
    title: 'Project Submission: Portfolio Website',
    description: 'Upload a ZIP file containing your final portfolio project source code.',
    type: 'task'
};

const MOCK_VIDEO = {
    title: 'Video Presentation: Self Introduction',
    description: 'Record a 2-minute video introducing yourself and your coding goals.',
    type: 'video'
};

export default function TaskDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();

    // Demo State
    const [task, setTask] = useState<any>(MOCK_QUIZ);
    const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [file, setFile] = useState<File | null>(null);

    // Initialize quiz answers
    useEffect(() => {
        if (task.type === 'quiz' && task.questions) {
            setQuizAnswers(new Array(task.questions.length).fill(-1));
        }
    }, [task]);

    const handleQuizOptionSelect = (qIdx: number, oIdx: number) => {
        const newAnswers = [...quizAnswers];
        newAnswers[qIdx] = oIdx;
        setQuizAnswers(newAnswers);
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            if (task.type === 'quiz') {
                const score = quizAnswers.reduce((acc, ans, idx) => {
                    return ans === task.questions[idx].correctAnswer ? acc + 1 : acc;
                }, 0);
                const percentage = Math.round((score / task.questions.length) * 100);
                toast.success(`Exam Completed! Score: ${percentage}%`);
                if (percentage >= 70) {
                    router.push('/dashboard/tasks');
                }
            } else {
                toast.success('Submission Received!');
                router.push('/dashboard/tasks');
            }
        } catch (error) {
            toast.error('Submission failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50/50 p-6">
            <div className="max-w-3xl mx-auto space-y-6">
                <Button variant="ghost" onClick={() => router.push('/dashboard/tasks')}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Tasks
                </Button>

                {/* Demo Controls */}
                <div className="bg-slate-900 text-white p-4 rounded-xl flex items-center justify-between shadow-lg">
                    <span className="font-mono text-sm">DEV MODE: Switch Task Format</span>
                    <div className="flex gap-2">
                        <Button size="sm" variant="secondary" onClick={() => setTask(MOCK_QUIZ)}>CBT Mode</Button>
                        <Button size="sm" variant="secondary" onClick={() => setTask(MOCK_UPLOAD)}>File Upload</Button>
                        <Button size="sm" variant="secondary" onClick={() => setTask(MOCK_VIDEO)}>Video Task</Button>
                    </div>
                </div>

                <Card className="border-0 shadow-sm">
                    <CardHeader className="border-b bg-white rounded-t-xl pb-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <Badge variant="outline" className="mb-2 capitalize">{task.type}</Badge>
                                <CardTitle className="text-2xl">{task.title}</CardTitle>
                                <CardDescription className="text-base mt-2">{task.description}</CardDescription>
                            </div>
                            <div className="flex items-center gap-1 text-slate-500 text-sm">
                                <Clock className="w-4 h-4" /> Due Tomorrow
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 md:p-8 bg-white min-h-[400px]">

                        {/* CBT VIEW */}
                        {task.type === 'quiz' && (
                            <div className="space-y-8">
                                {task.questions.map((q: any, qIdx: number) => (
                                    <div key={qIdx} className="space-y-4">
                                        <h3 className="font-medium text-lg flex gap-3">
                                            <span className="text-muted-foreground w-6">{qIdx + 1}.</span>
                                            {q.question}
                                        </h3>
                                        <div className="space-y-3 pl-9">
                                            {q.options.map((opt: string, oIdx: number) => (
                                                <div
                                                    key={oIdx}
                                                    className={`
                                                        flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all
                                                        ${quizAnswers[qIdx] === oIdx
                                                            ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600'
                                                            : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'}
                                                    `}
                                                    onClick={() => handleQuizOptionSelect(qIdx, oIdx)}
                                                >
                                                    <div className={`
                                                        w-5 h-5 rounded-full border flex items-center justify-center
                                                        ${quizAnswers[qIdx] === oIdx ? 'border-indigo-600 bg-indigo-600' : 'border-slate-400'}
                                                    `}>
                                                        {quizAnswers[qIdx] === oIdx && <div className="w-2 h-2 rounded-full bg-white" />}
                                                    </div>
                                                    <span>{opt}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* FILE UPLOAD VIEW */}
                        {task.type === 'task' && (
                            <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                                    <Upload className="w-8 h-8 text-indigo-600" />
                                </div>
                                <h3 className="text-lg font-medium text-slate-900">Upload Project File</h3>
                                <p className="text-slate-500 mt-1 mb-6">Drag and drop or browse to upload (ZIP, PDF, DOCX)</p>
                                <Button>Choose File</Button>
                            </div>
                        )}

                        {/* VIDEO UPLOAD VIEW */}
                        {task.type === 'video' && (
                            <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                                    <Video className="w-8 h-8 text-rose-600" />
                                </div>
                                <h3 className="text-lg font-medium text-slate-900">Submit Video Response</h3>
                                <p className="text-slate-500 mt-1 mb-6">Upload a video file or provide a link</p>
                                <div className="w-full max-w-md space-y-4">
                                    <input
                                        type="text"
                                        placeholder="Paste video URL (YouTube, Vimeo, Drive)..."
                                        className="w-full p-3 rounded-lg border focus:ring-2 focus:ring-rose-500/20 outline-none"
                                    />
                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-slate-50 px-2 text-muted-foreground">Or</span></div>
                                    </div>
                                    <Button className="w-full" variant="outline">Upload Video File</Button>
                                </div>
                            </div>
                        )}

                    </CardContent>
                    <div className="p-6 border-t bg-slate-50/50 rounded-b-xl flex justify-end">
                        <Button
                            size="lg"
                            className="w-full md:w-auto min-w-[200px]"
                            onClick={handleSubmit}
                            disabled={isSubmitting || (task.type === 'quiz' && quizAnswers.includes(-1))}
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Task'}
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
}
