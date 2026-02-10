'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { BookOpen, Clock, FileText, ArrowRight, Loader2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CourseFormProps {
    onSuccess: (course: any) => void;
    initialData?: {
        id?: string;
        _id?: string;
        name: string;
        description: string;
        duration: number;
    };
}

export function CourseForm({ onSuccess, initialData }: CourseFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        description: initialData?.description || '',
        duration: initialData?.duration || 0
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const courseId = initialData?.id || initialData?._id;
            let course;
            if (courseId) {
                course = await api.updateCourse(courseId, formData);
                toast.success('Course details updated.');
            } else {
                course = await api.createCourse(formData);
                toast.success('Course fundamentals established.');
            }
            onSuccess(course);
        } catch (error: any) {
            toast.error(error.message || 'Failed to save course');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="border-slate-100 bg-white shadow-xl shadow-slate-200/50 rounded-[32px] overflow-hidden">
            <CardHeader className="p-8 md:p-12 pb-0">
                <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl font-semibold text-slate-900 tracking-tight">Core Details</CardTitle>
                        <CardDescription className="text-slate-500 font-medium">Set the essential information for your new curriculum.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-8 md:p-12 pt-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Course Identity</Label>
                            <div className="relative group">
                                <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                <Input
                                    id="name"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Advanced System Architecture"
                                    className="h-14 pl-12 bg-slate-50/50 border-slate-100 rounded-2xl focus:bg-white focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all font-medium text-slate-900"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="duration" className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Estimated Commitment (Hours)</Label>
                            <div className="relative group">
                                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                <Input
                                    id="duration"
                                    type="number"
                                    min="0"
                                    required
                                    value={formData.duration}
                                    onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                                    className="h-14 pl-12 bg-slate-50/50 border-slate-100 rounded-2xl focus:bg-white focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all font-medium text-slate-900"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Executive Summary</Label>
                            <div className="relative group">
                                <FileText className="absolute left-4 top-4 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                <Textarea
                                    id="description"
                                    required
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Provide a compelling overview of what students will achieve..."
                                    className="min-h-[160px] pl-12 pt-4 bg-slate-50/50 border-slate-100 rounded-2xl focus:bg-white focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all font-medium text-slate-900 leading-relaxed"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 transition-all active:scale-95 group"
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Initialing Setup...
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    Continue to Curriculum Builder
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </div>
                            )}
                        </Button>
                    </div>

                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <Info className="w-5 h-5 text-slate-400" />
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                            Establishing these basics allows students to identify the course. You can refine the syllabus and specific sessions in the next phase.
                        </p>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
