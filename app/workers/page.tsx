'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { useDataStore } from '@/lib/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  UserCheck, 
  Mail, 
  Star, 
  Clock,
  DollarSign,
  Upload
} from 'lucide-react';
import Link from 'next/link';

export default function WorkersPage() {
  const { workers } = useDataStore();

  if (workers.length === 0) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-full">
          <div className="text-center max-w-md">
            <UserCheck className="h-24 w-24 text-gray-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Workers Found</h2>
            <p className="text-gray-600 mb-8">
              Upload your worker data to get started with resource allocation and task management.
            </p>
            <Link href="/upload">
              <Button size="lg" className="gap-2">
                <Upload className="h-5 w-5" />
                Upload Workers Data
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
            <h2 className="text-2xl font-bold">Workers</h2>
            <p className="text-gray-600">
              Manage your workforce and their skills
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
          {workers.map((worker) => (
            <Card key={worker.id} className="card-hover">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-green-600" />
                  {worker.name}
                </CardTitle>
                <CardDescription>ID: {worker.id}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {worker.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    {worker.email}
                  </div>
                )}
                
                <div className="space-y-2">
                  <div className="text-sm font-medium">Skills</div>
                  <div className="flex flex-wrap gap-1">
                    {worker.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span>{worker.availability}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-600" />
                    <span>{worker.maxConcurrentTasks} max tasks</span>
                  </div>
                </div>

                {worker.hourlyRate && worker.hourlyRate > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span>${worker.hourlyRate}/hour</span>
                  </div>
                )}

                {worker.preferredPhases && worker.preferredPhases.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Preferred Phases</div>
                    <div className="flex flex-wrap gap-1">
                      {worker.preferredPhases.map((phase, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          Phase {phase}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}