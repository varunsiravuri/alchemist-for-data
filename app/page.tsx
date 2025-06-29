'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { useDataStore } from '@/lib/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  UserCheck, 
  ClipboardList, 
  AlertTriangle, 
  CheckCircle,
  Upload,
  Database,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const { clients, workers, tasks, validationErrors, isLoading } = useDataStore();
  
  const totalEntities = clients.length + workers.length + tasks.length;
  const errorCount = validationErrors.filter(e => e.severity === 'error').length;
  const warningCount = validationErrors.filter(e => e.severity === 'warning').length;
  const healthScore = totalEntities > 0 ? Math.max(0, 100 - (errorCount * 10) - (warningCount * 5)) : 0;

  const stats = [
    {
      title: 'Clients',
      value: clients.length,
      icon: Users,
      color: 'text-blue-600',
      href: '/clients'
    },
    {
      title: 'Workers',
      value: workers.length,
      icon: UserCheck,
      color: 'text-green-600',
      href: '/workers'
    },
    {
      title: 'Tasks',
      value: tasks.length,
      icon: ClipboardList,
      color: 'text-purple-600',
      href: '/tasks'
    },
    {
      title: 'Validations',
      value: errorCount + warningCount,
      icon: AlertTriangle,
      color: errorCount > 0 ? 'text-red-600' : warningCount > 0 ? 'text-yellow-600' : 'text-green-600',
      href: '/validations'
    }
  ];

  if (totalEntities === 0) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-full">
          <div className="text-center max-w-md">
            <Database className="h-24 w-24 text-gray-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Data Alchemist</h2>
            <p className="text-gray-600 mb-8">
              Transform your messy CSV and Excel data into clean, validated resources with intelligent AI-powered allocation. 
              Start by uploading your client, worker, and task data.
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/upload">
                <Button size="lg" className="gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Your Data
                </Button>
              </Link>
              <Link href="/ai-assistant">
                <Button size="lg" variant="outline" className="gap-2">
                  <Sparkles className="h-5 w-5" />
                  Try AI Assistant
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="gradient-bg rounded-lg p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">Dashboard Overview</h2>
          <p className="text-white/90">
            Monitor your data quality and manage resource allocation efficiently with AI assistance
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Link key={stat.title} href={stat.href}>
              <Card className="card-hover cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Data Health Score */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Data Health Score
            </CardTitle>
            <CardDescription>
              Overall quality and completeness of your uploaded data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Health Score</span>
                <span className="text-2xl font-bold">{healthScore}%</span>
              </div>
              <Progress value={healthScore} className="h-2" />
              <div className="flex justify-between text-sm">
                <span className="text-green-600 flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  {totalEntities - errorCount - warningCount} Clean Records
                </span>
                {warningCount > 0 && (
                  <span className="text-yellow-600 flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4" />
                    {warningCount} Warnings
                  </span>
                )}
                {errorCount > 0 && (
                  <span className="text-red-600 flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4" />
                    {errorCount} Errors
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Summary</CardTitle>
              <CardDescription>Overview of your current data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Total Entities</span>
                <Badge variant="secondary">{totalEntities}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Active Tasks</span>
                <Badge variant="secondary">
                  {tasks.filter(t => t.status === 'pending' || t.status === 'in-progress').length}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Available Workers</span>
                <Badge variant="secondary">{workers.length}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>High Priority Tasks</span>
                <Badge variant="secondary">
                  {tasks.filter(t => t.priority >= 4).length}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks to get you started</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/upload">
                <Button variant="outline" className="w-full justify-start">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload More Data
                </Button>
              </Link>
              <Link href="/ai-assistant">
                <Button variant="outline" className="w-full justify-start">
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI Assistant
                </Button>
              </Link>
              <Link href="/validations">
                <Button variant="outline" className="w-full justify-start">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Review Validations
                </Button>
              </Link>
              <Link href="/rules">
                <Button variant="outline" className="w-full justify-start">
                  <Database className="h-4 w-4 mr-2" />
                  Create Business Rules
                </Button>
              </Link>
              <Link href="/export">
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Export Clean Data
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}