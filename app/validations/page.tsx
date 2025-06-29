'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  X,
  Filter,
  RefreshCw
} from 'lucide-react';
import { useDataStore } from '@/lib/store';
import { ValidationError } from '@/lib/types';
import { cn } from '@/lib/utils';

const severityConfig = {
  error: {
    icon: AlertTriangle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    badgeVariant: 'destructive' as const
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    badgeVariant: 'secondary' as const
  },
  info: {
    icon: Info,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    badgeVariant: 'outline' as const
  }
};

function ValidationItem({ error, onDismiss }: { error: ValidationError; onDismiss: (id: string) => void }) {
  const config = severityConfig[error.severity];
  const Icon = config.icon;

  return (
    <div className={cn(
      'p-4 rounded-lg border',
      config.bgColor,
      config.borderColor
    )}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <Icon className={cn('h-5 w-5 mt-0.5', config.color)} />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant={config.badgeVariant} className="text-xs">
                {error.severity.toUpperCase()}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {error.entityType}
              </Badge>
              <span className="text-sm text-gray-500">
                {error.entityId}
              </span>
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">
              {error.field}: {error.message}
            </p>
            <p className="text-xs text-gray-500">
              {error.timestamp.toLocaleString()}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDismiss(error.id)}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default function ValidationsPage() {
  const { validationErrors, removeValidationError, clients, workers, tasks } = useDataStore();
  
  const errorCount = validationErrors.filter(e => e.severity === 'error').length;
  const warningCount = validationErrors.filter(e => e.severity === 'warning').length;
  const infoCount = validationErrors.filter(e => e.severity === 'info').length;

  const handleDismiss = (id: string) => {
    removeValidationError(id);
  };

  const handleRevalidate = () => {
    // This would trigger a re-validation of all data
    // For now, we'll just show a message
    console.log('Re-validation triggered');
  };

  if (validationErrors.length === 0) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Validations</h2>
              <p className="text-gray-600">
                Review and manage data validation results
              </p>
            </div>
            <Button onClick={handleRevalidate} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Re-validate
            </Button>
          </div>

          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                All Clear!
              </h3>
              <p className="text-gray-600 text-center max-w-md">
                No validation errors found. Your data looks clean and ready for processing.
              </p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Validations</h2>
            <p className="text-gray-600">
              Review and manage data validation results
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button onClick={handleRevalidate} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Re-validate
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{validationErrors.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-600">Errors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{errorCount}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-yellow-600">Warnings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{warningCount}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-600">Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{infoCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Validation Results */}
        <Card>
          <CardHeader>
            <CardTitle>Validation Results</CardTitle>
            <CardDescription>
              Issues found during data validation. Address errors before proceeding.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {validationErrors.map((error) => (
                <ValidationItem
                  key={error.id}
                  error={error}
                  onDismiss={handleDismiss}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Data Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Data Summary</CardTitle>
            <CardDescription>
              Overview of your current data entities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{clients.length}</div>
                <div className="text-sm text-gray-600">Clients</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{workers.length}</div>
                <div className="text-sm text-gray-600">Workers</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{tasks.length}</div>
                <div className="text-sm text-gray-600">Tasks</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}