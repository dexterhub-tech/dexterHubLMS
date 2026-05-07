'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { TopHeader } from '@/components/top-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
    Plus, 
    Search, 
    Edit3, 
    Trash2, 
    BookOpen, 
    Users, 
    ChevronRight, 
    MoreVertical,
    AlertCircle,
    Loader2,
    LayoutGrid,
    List as ListIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AdminCoursesPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [courses, setCourses] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // Delete Confirmation
    const [courseToDelete, setCourseToDelete] = useState<any>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (user?.role !== 'admin' && user?.role !== 'super-admin') {
            router.push('/dashboard');
            return;
        }
        fetchCourses();
    }, [user, router]);

    const fetchCourses = async () => {
        try {
            setIsLoading(true);
            const data = await api.getCourses();
            setCourses(data);
        } catch (error) {
            console.error('Failed to fetch courses:', error);
            toast.error('Failed to load courses');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteCourse = async () => {
        if (!courseToDelete) return;

        try {
            setIsDeleting(true);
            await api.deleteCourse(courseToDelete._id);
            toast.success('Course deleted successfully');
            setCourses(courses.filter(c => c._id !== courseToDelete._id));
            setCourseToDelete(null);
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete course');
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredCourses = courses.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="min-h-screen bg-neutral-50/50">
                <TopHeader user={user ? { name: `${user.firstName} ${user.lastName}`, email: user.email } : undefined} />
                <div className="flex h-[calc(100vh-80px)] items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50/50">
            <TopHeader user={user ? { name: `${user.firstName} ${user.lastName}`, email: user.email } : undefined} />

            <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200/60">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-1">
                            <Badge className="bg-indigo-50/80 text-indigo-700 border-indigo-100 px-2.5 py-0.5 text-[9px] font-medium tracking-wider uppercase backdrop-blur-sm">Admin Portal</Badge>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-slate-900">Course Manager</h1>
                        <p className="text-slate-500 max-w-xl text-sm md:text-lg font-light leading-relaxed">
                            Oversee the entire educational catalog, manage curriculum standards, and track deployment status.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                         <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-sm mr-2">
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => setViewMode('grid')}
                                className={cn("h-8 w-8 p-0 rounded-lg", viewMode === 'grid' && "bg-slate-100")}
                            >
                                <LayoutGrid className="w-4 h-4" />
                            </Button>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => setViewMode('list')}
                                className={cn("h-8 w-8 p-0 rounded-lg", viewMode === 'list' && "bg-slate-100")}
                            >
                                <ListIcon className="w-4 h-4" />
                            </Button>
                        </div>
                        <Button 
                            onClick={() => router.push('/instructor/courses/new')}
                            className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all hover:shadow-xl active:scale-95 h-12 rounded-xl px-6 font-bold text-xs uppercase tracking-widest"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            New Course
                        </Button>
                    </div>
                </div>

                {/* Search & Filter Bar */}
                <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-3 rounded-[24px] border border-slate-100 shadow-sm">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input 
                            placeholder="Search courses by name or description..." 
                            className="pl-11 h-12 border-none bg-transparent shadow-none focus-visible:ring-0 text-slate-700 font-medium"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="h-8 w-px bg-slate-100 hidden md:block" />
                    <div className="px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                        {filteredCourses.length} Courses Found
                    </div>
                </div>

                {/* Courses Display */}
                {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCourses.map((course) => (
                            <div key={course._id} className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 flex flex-col h-full group">
                                <div className="flex justify-between items-start mb-6">
                                    <div className={cn(
                                        "w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm border transition-transform group-hover:rotate-6",
                                        course.color === 'mint' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                        course.color === 'peach' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                        course.color === 'lavender' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                                        'bg-amber-50 text-amber-600 border-amber-100'
                                    )}>
                                        {course.icon || '📚'}
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0 rounded-full hover:bg-slate-50">
                                                <MoreVertical className="w-4 h-4 text-slate-400" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="rounded-xl border-slate-100 shadow-xl p-1 w-40">
                                            <DropdownMenuItem onClick={() => router.push(`/dashboard/courses/${course._id}`)} className="rounded-lg py-2 cursor-pointer font-medium text-slate-600">
                                                <BookOpen className="w-4 h-4 mr-2 opacity-50" />
                                                View Course
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => router.push(`/instructor/courses/edit/${course._id}`)} className="rounded-lg py-2 cursor-pointer font-medium text-slate-600">
                                                <Edit3 className="w-4 h-4 mr-2 opacity-50" />
                                                Edit Content
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setCourseToDelete(course)} className="rounded-lg py-2 cursor-pointer font-medium text-rose-600 focus:bg-rose-50 focus:text-rose-700">
                                                <Trash2 className="w-4 h-4 mr-2 opacity-50" />
                                                Delete Course
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <div className="space-y-2 flex-1">
                                    <h3 className="text-xl font-bold text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">
                                        {course.name}
                                    </h3>
                                    <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                                        {course.description}
                                    </p>
                                </div>

                                <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                                    <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        <div className="flex items-center gap-1.5">
                                            <Users className="w-3.5 h-3.5" />
                                            {course.registrarsCount || 0} Learners
                                        </div>
                                    </div>
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={() => router.push(`/instructor/courses/edit/${course._id}`)}
                                        className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50/50 rounded-xl font-bold text-[10px] uppercase tracking-widest"
                                    >
                                        Manage
                                        <ChevronRight className="w-3.5 h-3.5 ml-1" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Course Information</th>
                                    <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Enrolled</th>
                                    <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredCourses.map((course) => (
                                    <tr key={course._id} className="hover:bg-slate-50/30 transition-colors">
                                        <td className="px-8 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm border",
                                                    course.color === 'mint' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                    course.color === 'peach' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                                    course.color === 'lavender' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                                                    'bg-amber-50 text-amber-600 border-amber-100'
                                                )}>
                                                    {course.icon || '📚'}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 leading-none mb-1">{course.name}</p>
                                                    <p className="text-xs text-slate-400 line-clamp-1 max-w-xs">{course.description}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-slate-600 font-medium">
                                                <Users className="w-4 h-4 opacity-40" />
                                                {course.registrarsCount || 0}
                                            </div>
                                        </td>
                                        <td className="px-8 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    onClick={() => router.push(`/instructor/courses/edit/${course._id}`)}
                                                    className="h-9 w-9 p-0 rounded-xl hover:bg-indigo-50 hover:text-indigo-600"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    onClick={() => setCourseToDelete(course)}
                                                    className="h-9 w-9 p-0 rounded-xl hover:bg-rose-50 hover:text-rose-600"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {filteredCourses.length === 0 && !isLoading && (
                    <div className="py-24 text-center space-y-6 animate-in fade-in duration-500">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto border border-slate-200/50">
                            <BookOpen className="w-10 h-10 text-slate-300" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-slate-900">No Courses Found</h3>
                            <p className="text-slate-500 max-w-sm mx-auto font-light">
                                We couldn't find any courses matching your search. Try adjusting your filters or create a new curriculum.
                            </p>
                        </div>
                        <Button 
                            variant="outline" 
                            onClick={() => setSearchQuery('')}
                            className="rounded-xl font-bold text-xs uppercase tracking-widest px-8"
                        >
                            Clear Search
                        </Button>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!courseToDelete} onOpenChange={(open) => !open && setCourseToDelete(null)}>
                <DialogContent className="sm:max-w-[450px] rounded-[32px] border-none shadow-2xl p-0 overflow-hidden bg-white">
                    <div className="p-8 space-y-6">
                        <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 mx-auto border border-rose-100">
                            <Trash2 className="w-8 h-8" />
                        </div>
                        
                        <div className="text-center space-y-2">
                            <DialogTitle className="text-2xl font-bold text-slate-900">Delete Course?</DialogTitle>
                            <DialogDescription className="text-slate-500 leading-relaxed">
                                You are about to permanently delete <span className="font-bold text-slate-900">"{courseToDelete?.name}"</span>. 
                                This action will also remove all associated modules, lessons, and student submissions.
                            </DialogDescription>
                        </div>

                        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 flex gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
                                This action is irreversible. All academic data linked to this course will be purged from the system.
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="bg-slate-50 p-8 pt-6 flex flex-row gap-3">
                        <Button
                            variant="ghost"
                            onClick={() => setCourseToDelete(null)}
                            className="flex-1 h-14 rounded-2xl font-bold text-slate-500 hover:bg-slate-100"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleDeleteCourse}
                            disabled={isDeleting}
                            className="flex-1 h-14 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold tracking-widest shadow-xl shadow-rose-100 transition-all active:scale-95"
                        >
                            {isDeleting ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                'DELETE NOW'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
