'use client';

import { useEffect, useState } from 'react';
import { api, Cohort } from '@/lib/api';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export function JoinCohortView({ onJoinSuccess }: { onJoinSuccess: () => void }) {
    const [cohorts, setCohorts] = useState<Cohort[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isJoining, setIsJoining] = useState<string | null>(null);

    useEffect(() => {
        const loadCohorts = async () => {
            try {
                const data = await api.getCohorts();
                // Filter for upcoming or active cohorts only
                const available = data.filter(c => c.status === 'upcoming' || c.status === 'active');
                setCohorts(available);
            } catch (error) {
                console.error('Error loading cohorts:', error);
                toast.error('Failed to load available cohorts');
            } finally {
                setIsLoading(false);
            }
        };

        loadCohorts();
    }, []);

    const handleJoin = async (cohortId: string) => {
        setIsJoining(cohortId);
        try {
            await api.joinCohort(cohortId);
            toast.success('Successfully joined the cohort!');
            onJoinSuccess();
        } catch (error: any) {
            toast.error(error.message || 'Failed to join cohort');
        } finally {
            setIsJoining(null);
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center">Loading available cohorts...</div>;
    }

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <div className="mb-8 text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Join a Cohort</h1>
                <p className="text-muted-foreground">Select a cohort to start your learning journey.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {cohorts.map((cohort) => (
                    <Card key={cohort._id} className="flex flex-col">
                        <CardHeader>
                            <div className="flex justify-between items-start mb-2">
                                <Badge variant={cohort.status === 'active' ? 'default' : 'secondary'}>
                                    {cohort.status === 'active' ? 'Active' : 'Upcoming'}
                                </Badge>
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    {cohort.learnerIds?.length || 0} Learners
                                </span>
                            </div>
                            <CardTitle>{cohort.name}</CardTitle>
                            <CardDescription className="line-clamp-2">{cohort.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                <Calendar className="w-4 h-4" />
                                <span>Starts: {new Date(cohort.startDate).toLocaleDateString()}</span>
                            </div>
                            {/* Add more details here later if needed */}
                        </CardContent>
                        <CardFooter>
                            <Button
                                className="w-full"
                                onClick={() => handleJoin(cohort._id)}
                                disabled={!!isJoining}
                            >
                                {isJoining === cohort._id ? 'Joining...' : 'Join Cohort'}
                                {!isJoining && <ArrowRight className="w-4 h-4 ml-2" />}
                            </Button>
                        </CardFooter>
                    </Card>
                ))}

                {cohorts.length === 0 && (
                    <div className="col-span-full text-center py-12 bg-muted/20 rounded-lg">
                        <p className="text-muted-foreground">No open cohorts available at the moment.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
