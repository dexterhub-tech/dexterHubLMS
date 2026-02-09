'use client';

import { ApplicationsList } from '@/components/applications-list';

export default function ApplicationsPage() {
    return <ApplicationsList backLink="/admin" backLabel="Back to Admin Dashboard" />;
}
