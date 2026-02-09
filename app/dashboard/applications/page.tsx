'use client';

import { ApplicationsList } from '@/components/applications-list';

export default function ApplicationsPage() {
    return <ApplicationsList backLink="/dashboard" backLabel="Back to Dashboard" />;
}
