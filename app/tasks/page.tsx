'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { useDataStore } from '@/lib/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ClipboardList, 
  User, 
  Clock, 
  AlertCircle,
  CheckCircle,
  Pause,
  X,
  Upload
} from 'lucide-react';
import Link from 'next/link';

const statusIcons = {
  'pending': AlertCircle,
  'in-progress': Clock,
  'completed': CheckCircle,
  'cancelled': X
};

const statusColors = {
  'pending': 'text-yellow-600',
  'in-progress': 'text-blue-600',
  'completed': 'text-green-600',
  'cancelled': 'text-red-600'
};

const priorityColors = {
  1: 'bg-gray-100 text-gray-800',
  2: 'bg-blue-100 text-blue-800',
  3: 'bg-yellow-100 text-yellow-800',
  4: 'bg-orange-100 text-orange-800',
  5: 'bg-red-100 text-red-800'
};

export default function TasksPage() {
  const { tasks, clients } = useDataStore();

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client?.name || clientId;
  };

  if (tasks.length === 0) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-full">
          <div className="text-center max-w-md">
            <ClipboardList className="h-24 w-24 text-gray-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Tasks Found</h2>
            <p className="text-gray-600 mb-8">
              Upload your task data to start managing and allocating work to your team.
            </p>
            <Link href="/upload">
              <Button size="lg" className="gap-2">
                <Upload className="h-5 w-5" />
                Upload Tasks Data
              </Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Tasks</h2>
            <p className="text-gray-600">
              Manage and track your project tasks
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/upload">
              <Button variant="outline" className="gap-2">
                <Upload className="h-4 w-4" />
                Upload More
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task) => {
            const StatusIcon = statusIcons[task.status];
            return (
              <Card key={task.id} className="card-hover">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-purple-600" />
                    {task.name}
                  </CardTitle>
                  <CardDescription>ID: {task.id}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-gray-500" />
                    <span>Client: {getClientName(task.clientId)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <StatusIcon className={`h-4 w-4 ${statusColors[task.status]}`} />
                      <span className="text-sm capitalize">{task.status.replace('-', ' ')}</span>
                    </div>
                    <Badge 
                      className={`text-xs ${priorityColors[task.priority as keyof typeof priorityColors] || 'bg-gray-100 text-gray-800'}`}
                    >
                      Priority {task.priority}
                    </Badge>
                  </div>

                  {task.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {task.description}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span>{task.duration} days</span>
                    </div>
                    {task.estimatedHours && task.estimatedHours > 0 && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-green-600" />
                        <span>{task.estimatedHours}h</span>
                      </div>
                    )}
                  </div>

                  {task.requiredSkills && task.requiredSkills.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Required Skills</div>
                      <div className="flex flex-wrap gap-1">
                        {task.requiredSkills.map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {task.preferredPhases && task.preferredPhases.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Preferred Phases</div>
                      <div className="flex flex-wrap gap-1">
                        {task.preferredPhases.map((phase, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            Phase {phase}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {task.dependencies && task.dependencies.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Dependencies</div>
                      <div className="flex flex-wrap gap-1">
                        {task.dependencies.map((dep, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {dep}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
}