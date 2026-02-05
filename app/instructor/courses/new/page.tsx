'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CourseForm } from '@/components/instructor/course-builder/course-form';
import { ModuleManager } from '@/components/instructor/course-builder/module-manager';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function CreateCoursePage() {
    const router = useRouter();
    const [step, setStep] = useState<'details' | 'modules'>('details');
    const [courseId, setCourseId] = useState<string | null>(null);

    const handleCourseCreated = (course: any) => {
        setCourseId(course._id);
        setStep('modules');
    };

    const handleFinish = () => {
        router.push('/dashboard');
    };

    return (
        <div className="container mx-auto py-8 max-w-4xl">
            <div className="mb-8">
                <Button variant="ghost" className="mb-4" onClick={() => router.push('/dashboard')}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">Create New Course</h1>
                <p className="text-muted-foreground">
                    {step === 'details'
                        ? 'Step 1: Define the course basics.'
                        : 'Step 2: Structure your course with classes (modules) and sessions (lessons).'}
                </p>
            </div>

            {step === 'details' && (
                <CourseForm onSuccess={handleCourseCreated} />
            )}

            {step === 'modules' && courseId && (
                <ModuleManager courseId={courseId} onComplete={handleFinish} />
            )}
        </div>
    );
}
