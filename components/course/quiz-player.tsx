'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { CheckCircle, XCircle, ChevronRight, ChevronLeft, Award, HelpCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Question {
    question: string;
    options: string[];
    correctAnswer: number;
}

interface QuizPlayerProps {
    quiz: {
        title: string;
        description: string;
        questions: Question[];
        maxScore: number;
    };
    onComplete: (score: number) => Promise<void>;
}

export function QuizPlayer({ quiz, onComplete }: QuizPlayerProps) {
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<number[]>(new Array(quiz.questions.length).fill(-1));
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [score, setScore] = useState(0);

    const handleSelect = (optionIdx: number) => {
        if (isSubmitted) return;
        const newAnswers = [...selectedAnswers];
        newAnswers[currentQuestionIdx] = optionIdx;
        setSelectedAnswers(newAnswers);
    };

    const calculateScore = () => {
        let correctCount = 0;
        quiz.questions.forEach((q, idx) => {
            if (selectedAnswers[idx] === q.correctAnswer) {
                correctCount++;
            }
        });
        return Math.round((correctCount / quiz.questions.length) * quiz.maxScore);
    };

    const handleSubmit = async () => {
        if (selectedAnswers.includes(-1)) {
            toast.error('Please answer all questions before submitting.');
            return;
        }

        const finalScore = calculateScore();
        setScore(finalScore);
        setIsSubmitted(true);

        setIsSubmitting(true);
        try {
            await onComplete(finalScore);
            toast.success('Quiz submitted successfully!');
        } catch (error) {
            console.error('Failed to submit quiz score:', error);
            toast.error('Failed to register quiz score, but your result is shown.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const currentQuestion = quiz.questions[currentQuestionIdx];
    const isLastQuestion = currentQuestionIdx === quiz.questions.length - 1;

    if (isSubmitted) {
        const percentage = (score / quiz.maxScore) * 100;
        return (
            <Card className="border-indigo-100 shadow-xl overflow-hidden animate-in zoom-in-95 duration-500">
                <div className={cn(
                    "p-8 text-center text-white",
                    percentage >= 70 ? "bg-emerald-600" : "bg-amber-600"
                )}>
                    <Award className="w-16 h-16 mx-auto mb-4 animate-bounce" />
                    <h3 className="text-2xl font-bold mb-2">Quiz Completed!</h3>
                    <p className="opacity-90 font-medium">You scored {score} out of {quiz.maxScore}</p>
                </div>
                <CardContent className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Percentage</p>
                            <p className="text-2xl font-bold text-slate-900">{percentage}%</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                            <p className={cn("text-2xl font-bold", percentage >= 70 ? "text-emerald-600" : "text-amber-600")}>
                                {percentage >= 70 ? 'PASSED' : 'RETRY NEEDED'}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Review Your Challenges</p>
                        {quiz.questions.map((q, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-white border border-slate-100">
                                {selectedAnswers[idx] === q.correctAnswer ? (
                                    <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                                ) : (
                                    <XCircle className="w-5 h-5 text-rose-500 mt-0.5 flex-shrink-0" />
                                )}
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold text-slate-800">{q.question}</p>
                                    <p className="text-xs text-slate-500">
                                        Your answer: <span className="font-bold">{q.options[selectedAnswers[idx]]}</span>
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
                <CardFooter className="p-8 bg-slate-50 border-t border-slate-100 flex justify-center">
                    <Button
                        variant="outline"
                        onClick={() => {
                            setIsSubmitted(false);
                            setSelectedAnswers(new Array(quiz.questions.length).fill(-1));
                            setCurrentQuestionIdx(0);
                        }}
                        className="rounded-xl font-bold border-slate-200"
                    >
                        Try Again
                    </Button>
                </CardFooter>
            </Card>
        );
    }

    return (
        <Card className="border-indigo-100 shadow-xl overflow-hidden">
            <CardHeader className="bg-indigo-50/50 p-6 md:p-8 flex flex-row items-center justify-between border-b border-indigo-100/50">
                <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-wider mb-2">
                        <HelpCircle className="w-3 h-3" /> Question {currentQuestionIdx + 1} of {quiz.questions.length}
                    </div>
                    <CardTitle className="text-xl font-bold text-slate-900">{quiz.title}</CardTitle>
                </div>
                <div className="hidden md:block">
                    <div className="w-16 h-16 rounded-2xl bg-white border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xl shadow-sm">
                        {Math.round(((currentQuestionIdx + 1) / quiz.questions.length) * 100)}%
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-6 md:p-10 space-y-8">
                <div className="space-y-4">
                    <h4 className="text-lg md:text-xl font-semibold text-slate-800 leading-tight">
                        {currentQuestion.question}
                    </h4>
                </div>

                <div className="grid gap-4">
                    {currentQuestion.options.map((option, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleSelect(idx)}
                            className={cn(
                                "flex items-center gap-4 p-5 rounded-2xl border-2 text-left transition-all duration-300",
                                selectedAnswers[currentQuestionIdx] === idx
                                    ? "bg-indigo-50 border-indigo-500 shadow-md shadow-indigo-100"
                                    : "bg-white border-slate-100 hover:border-indigo-200 hover:bg-slate-50"
                            )}
                        >
                            <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-colors",
                                selectedAnswers[currentQuestionIdx] === idx
                                    ? "bg-indigo-600 text-white"
                                    : "bg-slate-100 text-slate-500"
                            )}>
                                {String.fromCharCode(65 + idx)}
                            </div>
                            <span className={cn(
                                "font-medium flex-1",
                                selectedAnswers[currentQuestionIdx] === idx ? "text-indigo-900" : "text-slate-700"
                            )}>
                                {option}
                            </span>
                        </button>
                    ))}
                </div>
            </CardContent>
            <CardFooter className="p-6 md:p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <Button
                    variant="ghost"
                    disabled={currentQuestionIdx === 0}
                    onClick={() => setCurrentQuestionIdx(prev => prev - 1)}
                    className="rounded-xl font-bold text-slate-500"
                >
                    <ChevronLeft className="w-4 h-4 mr-2" /> Previous
                </Button>

                {isLastQuestion ? (
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || selectedAnswers[currentQuestionIdx] === -1}
                        className="rounded-xl px-10 h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-100"
                    >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Finalize & Submit'}
                    </Button>
                ) : (
                    <Button
                        onClick={() => setCurrentQuestionIdx(prev => prev + 1)}
                        disabled={selectedAnswers[currentQuestionIdx] === -1}
                        className="rounded-xl px-8 h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-100 group"
                    >
                        Next Challenge <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
