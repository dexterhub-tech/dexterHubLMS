'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity, Filter } from 'lucide-react';
import { toast } from 'sonner';

interface AuditLog {
  _id: string;
  actor: string;
  action: string;
  targetUser?: string;
  targetCohort?: string;
  details: any;
  timestamp: string;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const data = await api.getAuditLogs();
        setLogs(data);
      } catch (error) {
        console.error('Error loading audit logs:', error);
        toast.error('Failed to load audit logs');
      } finally {
        setIsLoading(false);
      }
    };

    loadLogs();
  }, []);

  const getActionColor = (action: string) => {
    if (action.includes('create') || action.includes('Create'))
      return 'bg-green-500/10 text-green-700 dark:text-green-400';
    if (action.includes('update') || action.includes('Update'))
      return 'bg-blue-500/10 text-blue-700 dark:text-blue-400';
    if (action.includes('delete') || action.includes('Delete'))
      return 'bg-red-500/10 text-red-700 dark:text-red-400';
    if (action.includes('approve') || action.includes('Approve'))
      return 'bg-green-500/10 text-green-700 dark:text-green-400';
    if (action.includes('reject') || action.includes('Reject'))
      return 'bg-red-500/10 text-red-700 dark:text-red-400';
    return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
  };

  const uniqueActions = ['all', ...new Set(logs.map((log) => log.action))];

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAction = actionFilter === 'all' || log.action === actionFilter;

    return matchesSearch && matchesAction;
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-muted animate-pulse rounded w-1/3" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Audit Logs</h1>
        <p className="text-muted-foreground mt-2">System activity and administrative actions</p>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-col md:flex-row">
        <Input
          placeholder="Search by actor or action..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 max-w-sm"
        />
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {uniqueActions.map((action) => (
              <SelectItem key={action} value={action}>
                {action === 'all' ? 'All Actions' : action}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Logs Timeline */}
      <div className="space-y-2">
        {filteredLogs.length === 0 ? (
          <Card className="border-border/50">
            <CardContent className="pt-12 text-center space-y-3">
              <Activity className="w-12 h-12 text-muted-foreground mx-auto opacity-50" />
              <p className="text-muted-foreground">No audit logs found</p>
            </CardContent>
          </Card>
        ) : (
          filteredLogs.map((log, index) => (
            <div
              key={log._id}
              className="flex gap-4 pb-4 border-b border-border/50 last:border-b-0"
            >
              {/* Timeline Dot */}
              <div className="flex flex-col items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary mt-2" />
                {index < filteredLogs.length - 1 && (
                  <div className="w-0.5 h-16 bg-border/50" />
                )}
              </div>

              {/* Log Content */}
              <div className="flex-1 pt-1">
                <Card className="border-border/50">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge className={`${getActionColor(log.action)} border`}>
                          {log.action}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground">Actor</p>
                          <p className="font-medium text-foreground">{log.actor}</p>
                        </div>
                        {log.targetUser && (
                          <div>
                            <p className="text-xs text-muted-foreground">Target User</p>
                            <p className="font-medium text-foreground">{log.targetUser}</p>
                          </div>
                        )}
                        {log.targetCohort && (
                          <div>
                            <p className="text-xs text-muted-foreground">Target Cohort</p>
                            <p className="font-medium text-foreground">{log.targetCohort}</p>
                          </div>
                        )}
                      </div>

                      {log.details && Object.keys(log.details).length > 0 && (
                        <div className="mt-3 pt-3 border-t border-border/50">
                          <p className="text-xs text-muted-foreground mb-2">Details</p>
                          <div className="bg-muted/50 p-2 rounded text-xs font-mono text-foreground">
                            <pre>{JSON.stringify(log.details, null, 2)}</pre>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
