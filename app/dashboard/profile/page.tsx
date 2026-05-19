'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api, Profile } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { TopHeader } from '@/components/top-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    User as UserIcon, 
    Mail, 
    MapPin, 
    Phone, 
    Linkedin, 
    Twitter, 
    Github, 
    Globe, 
    Camera, 
    Save, 
    Edit2,
    BookOpen,
    GraduationCap,
    Award,
    Plus,
    X,
    Building2,
    FileText,
    Upload,
    Briefcase,
    Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
    const { user } = useAuth();
    const router = useRouter();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    const [formData, setFormData] = useState<Partial<Profile> & { firstName?: string; lastName?: string }>({});
    const [isUploading, setIsUploading] = useState(false);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsUploading(true);
            const data = new FormData();
            data.append('file', file);
            data.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'ml_default');

            const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
            if (!cloudName) {
                throw new Error('Cloudinary cloud name is not configured');
            }

            const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                method: 'POST',
                body: data
            });

            if (!res.ok) {
                const errData = await res.json();
                console.error('Cloudinary upload error:', errData);
                throw new Error(errData.error?.message || 'Upload failed');
            }
            
            const result = await res.json();
            setFormData(prev => ({ ...prev, avatar: result.secure_url }));
            toast.success('Image uploaded successfully');
        } catch (error) {
            toast.error('Failed to upload image');
            console.error(error);
        } finally {
            setIsUploading(false);
        }
    };

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setIsLoading(true);
            const data = await api.getProfile();
            setProfile(data);
            setFormData({
                ...data,
                firstName: data.userId?.firstName || user?.firstName || '',
                lastName: data.userId?.lastName || user?.lastName || '',
            });
        } catch (error) {
            toast.error('Failed to load profile');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            const updated = await api.updateProfile(formData);
            setProfile(updated);
            toast.success('Profile updated successfully');
            setIsEditing(false);
        } catch (error) {
            toast.error('Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    const addTag = (field: 'learningGoals' | 'interests' | 'expertise' | 'achievements' | 'responsibilities', value: string) => {
        if (!value.trim()) return;
        
        const detailsKey = user?.role === 'learner' ? 'learnerDetails' : 
                         user?.role === 'instructor' ? 'instructorDetails' : 'adminDetails';
        
        const currentDetails = (formData as any)[detailsKey] || {};
        const currentTags = currentDetails[field] || [];
        
        if (currentTags.includes(value)) return;

        setFormData({
            ...formData,
            [detailsKey]: {
                ...currentDetails,
                [field]: [...currentTags, value]
            }
        });
    };

    const removeTag = (field: string, value: string) => {
        const detailsKey = user?.role === 'learner' ? 'learnerDetails' : 
                         user?.role === 'instructor' ? 'instructorDetails' : 'adminDetails';
        
        const currentDetails = (formData as any)[detailsKey] || {};
        const currentTags = currentDetails[field] || [];

        setFormData({
            ...formData,
            [detailsKey]: {
                ...currentDetails,
                [field]: currentTags.filter((t: string) => t !== value)
            }
        });
    };

    if (isLoading || !user) {
        return (
            <div className="min-h-screen bg-neutral-50/50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FDFDFF] pb-20">
            <TopHeader user={{ name: `${user.firstName} ${user.lastName}`, email: user.email }} />
            
            <div className="max-w-6xl mx-auto px-4 md:px-8 mt-12">
                <div className="flex items-center gap-2 mb-10">
                    <div className="w-6 h-1.5 bg-indigo-600 rounded-full" />
                    <h1 className="text-xl font-bold text-slate-800">Profile</h1>
                </div>

                <Card className="rounded-[32px] border-none shadow-[0_8px_30px_rgb(0,0,0,0.02)] bg-white p-12">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                        
                        {/* Left Column: Image & Actions */}
                        <div className="lg:col-span-4 space-y-8">
                            <div className="relative group">
                                <div className="aspect-square rounded-[32px] bg-indigo-50/50 flex items-center justify-center overflow-hidden border-2 border-slate-50 relative">
                                    {formData.avatar ? (
                                        <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <UserIcon className="w-24 h-24 text-slate-200" />
                                    )}
                                    {isEditing ? (
                                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full">
                                                {isUploading ? (
                                                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                                                ) : (
                                                    <Camera className="w-8 h-8 text-white" />
                                                )}
                                                <input 
                                                    type="file" 
                                                    className="hidden" 
                                                    accept="image/*"
                                                    onChange={handleImageUpload}
                                                    disabled={isUploading}
                                                />
                                            </label>
                                        </div>
                                    ) : null}
                                    <div className="absolute top-6 left-6 p-2 bg-white rounded-xl shadow-sm">
                                        <Camera className="w-5 h-5 text-slate-900" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="border-2 border-dashed border-slate-100 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 group hover:border-indigo-200 transition-colors cursor-pointer">
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest group-hover:text-indigo-400">Logo</p>
                                </div>
                                <div className="border-2 border-dashed border-slate-100 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 group hover:border-indigo-200 transition-colors cursor-pointer text-center">
                                    <Upload className="w-5 h-5 text-slate-300 group-hover:text-indigo-400" />
                                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-tight group-hover:text-indigo-400">Learner Documents</p>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Information */}
                        <div className="lg:col-span-8 flex flex-col justify-between">
                            <div className="space-y-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-1">
                                        <p className="text-sm font-bold text-slate-800">Name:</p>
                                        {isEditing ? (
                                            <div className="flex gap-2">
                                                <Input value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="h-10 rounded-xl" />
                                                <Input value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="h-10 rounded-xl" />
                                            </div>
                                        ) : (
                                            <p className="text-slate-500 font-medium">{user.firstName} {user.lastName}</p>
                                        )}
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-sm font-bold text-slate-800">Email:</p>
                                        <p className="text-slate-500 font-medium">{user.email}</p>
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-sm font-bold text-slate-800">Phone Number:</p>
                                        {isEditing ? (
                                            <Input value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} className="h-10 rounded-xl" />
                                        ) : (
                                            <p className="text-slate-500 font-medium">{profile?.phoneNumber || 'Not provided'}</p>
                                        )}
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-sm font-bold text-slate-800">Address:</p>
                                        {isEditing ? (
                                            <Input value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="h-10 rounded-xl" />
                                        ) : (
                                            <p className="text-slate-500 font-medium">{profile?.location || 'Not provided'}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-8 border-t border-slate-50 space-y-6">
                                    <div className="space-y-2">
                                        <p className="text-sm font-bold text-slate-800">Bio:</p>
                                        {isEditing ? (
                                            <Textarea value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} className="rounded-2xl bg-slate-50 border-none min-h-[100px]" />
                                        ) : (
                                            <p className="text-slate-500 font-medium leading-relaxed">{profile?.bio || 'Professional background details...'}</p>
                                        )}
                                    </div>

                                    {/* Role Specific Details */}
                                    {user.role === 'learner' && (
                                        <div className="grid grid-cols-2 gap-8">
                                            <div className="space-y-3">
                                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Learning Goals</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {(formData.learnerDetails?.learningGoals || []).map(goal => (
                                                        <Badge key={goal} className="bg-indigo-50 text-indigo-600 border-none rounded-lg px-3 py-1">
                                                            {goal}
                                                            {isEditing && <X className="w-3 h-3 ml-2 cursor-pointer" onClick={() => removeTag('learningGoals', goal)} />}
                                                        </Badge>
                                                    ))}
                                                    {isEditing && <Input placeholder="+" className="w-16 h-7 text-[10px]" onKeyDown={e => e.key === 'Enter' && (addTag('learningGoals', e.currentTarget.value), e.currentTarget.value = '')} />}
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Interests</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {(formData.learnerDetails?.interests || []).map(interest => (
                                                        <Badge key={interest} className="bg-emerald-50 text-emerald-600 border-none rounded-lg px-3 py-1">
                                                            {interest}
                                                            {isEditing && <X className="w-3 h-3 ml-2 cursor-pointer" onClick={() => removeTag('interests', interest)} />}
                                                        </Badge>
                                                    ))}
                                                    {isEditing && <Input placeholder="+" className="w-16 h-7 text-[10px]" onKeyDown={e => e.key === 'Enter' && (addTag('interests', e.currentTarget.value), e.currentTarget.value = '')} />}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {user.role === 'instructor' && (
                                        <div className="space-y-6">
                                            <div className="space-y-3">
                                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Expertise</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {(formData.instructorDetails?.expertise || []).map(skill => (
                                                        <Badge key={skill} className="bg-indigo-50 text-indigo-600 border-none rounded-lg px-3 py-1">
                                                            {skill}
                                                            {isEditing && <X className="w-3 h-3 ml-2 cursor-pointer" onClick={() => removeTag('expertise', skill)} />}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Philosophy</p>
                                                <p className="text-slate-500 italic">"{profile?.instructorDetails?.teachingPhilosophy || 'Share your approach...'}"</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end pt-12">
                                {isEditing ? (
                                    <div className="flex gap-3">
                                        <Button variant="ghost" onClick={() => setIsEditing(false)} className="rounded-xl h-12 px-8 font-bold text-slate-400">Cancel</Button>
                                        <Button onClick={handleSave} disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-12 px-8 font-bold shadow-lg shadow-indigo-100">
                                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                            Save Changes
                                        </Button>
                                    </div>
                                ) : (
                                    <Button 
                                        variant="outline" 
                                        onClick={() => setIsEditing(true)}
                                        className="rounded-2xl h-14 px-10 border-indigo-200 text-indigo-600 font-bold hover:bg-indigo-50 transition-all gap-3"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                        EDIT PROFILE
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Social Links Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
                    {[
                        { id: 'linkedin', icon: Linkedin, color: 'text-blue-600', label: 'LinkedIn' },
                        { id: 'twitter', icon: Twitter, color: 'text-sky-500', label: 'Twitter' },
                        { id: 'github', icon: Github, color: 'text-slate-900', label: 'GitHub' },
                        { id: 'website', icon: Globe, color: 'text-emerald-500', label: 'Website' }
                    ].map((social) => (
                        <div key={social.id} className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-50 flex items-center gap-4 group hover:shadow-md transition-all">
                            <div className={cn("w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center transition-transform group-hover:scale-110", social.color)}>
                                <social.icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{social.label}</p>
                                {isEditing ? (
                                    <Input 
                                        value={(formData.socialLinks as any)?.[social.id] || ''}
                                        onChange={(e) => setFormData({
                                            ...formData, 
                                            socialLinks: { ...formData.socialLinks, [social.id]: e.target.value }
                                        })}
                                        className="h-6 p-0 border-none shadow-none text-xs font-bold focus-visible:ring-0"
                                    />
                                ) : (
                                    <p className="text-xs font-bold text-slate-800 truncate">{(profile?.socialLinks as any)?.[social.id] || 'Not set'}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
