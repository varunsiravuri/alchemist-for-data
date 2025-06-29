'use client';

import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Download, 
  FileText, 
  Users, 
  UserCheck, 
  ClipboardList,
  Settings,
  Zap,
  CheckCircle,
  AlertTriangle,
  Package
} from 'lucide-react';
import { useDataStore } from '@/lib/store';
import { exportService } from '@/lib/export';
import { toast } from 'sonner';

export default function ExportPage() {
  const { 
    clients, 
    workers, 
    tasks, 
    businessRules, 
    prioritizationWeights,
    validationErrors 
  } = useDataStore();
  
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<'csv' | 'excel'>('csv');

  const errorCount = validationErrors.filter(e => e.severity === 'error').length;
  const warningCount = validationErrors.filter(e => e.severity === 'warning').length;
  const hasErrors = errorCount > 0;

  const handleExportClients = async () => {
    if (clients.length === 0) {
      toast.error('No client data to export');
      return;
    }
    
    setIsExporting(true);
    try {
      if (exportType === 'csv') {
        exportService.exportClients(clients);
      } else {
        exportService.exportToExcel(clients, 'cleaned_clients.xlsx');
      }
      toast.success(`Clients exported successfully as ${exportType.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to export clients');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportWorkers = async () => {
    if (workers.length === 0) {
      toast.error('No worker data to export');
      return;
    }
    
    setIsExporting(true);
    try {
      if (exportType === 'csv') {
        exportService.exportWorkers(workers);
      } else {
        exportService.exportToExcel(workers, 'cleaned_workers.xlsx');
      }
      toast.success(`Workers exported successfully as ${exportType.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to export workers');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportTasks = async () => {
    if (tasks.length === 0) {
      toast.error('No task data to export');
      return;
    }
    
    setIsExporting(true);
    try {
      if (exportType === 'csv') {
        exportService.exportTasks(tasks);
      } else {
        exportService.exportToExcel(tasks, 'cleaned_tasks.xlsx');
      }
      toast.success(`Tasks exported successfully as ${exportType.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to export tasks');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportRules = async () => {
    if (businessRules.length === 0) {
      toast.error('No business rules to export');
      return;
    }
    
    setIsExporting(true);
    try {
      exportService.exportRules(businessRules);
      toast.success('Business rules exported successfully');
    } catch (error) {
      toast.error('Failed to export business rules');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPrioritization = async () => {
    setIsExporting(true);
    try {
      exportService.exportPrioritization(prioritizationWeights);
      toast.success('Prioritization weights exported successfully');
    } catch (error) {
      toast.error('Failed to export prioritization weights');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportAll = async () => {
    if (clients.length === 0 && workers.length === 0 && tasks.length === 0) {
      toast.error('No data to export');
      return;
    }
    
    setIsExporting(true);
    try {
      exportService.exportAll(clients, workers, tasks, businessRules, prioritizationWeights);
      toast.success('All data exported successfully');
    } catch (error) {
      toast.error('Failed to export all data');
    } finally {
      setIsExporting(false);
    }
  };

  const totalEntities = clients.length + workers.length + tasks.length;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Export Data</h2>
            <p className="text-gray-600">
              Export your cleaned and validated data in various formats
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={exportType === 'csv' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setExportType('csv')}
            >
              CSV
            </Button>
            <Button
              variant={exportType === 'excel' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setExportType('excel')}
            >
              Excel
            </Button>
          </div>
        </div>

        {/* Data Quality Alert */}
        {hasErrors && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Your data contains {errorCount} error(s) and {warningCount} warning(s). 
              Consider reviewing and fixing these issues before exporting.
            </AlertDescription>
          </Alert>
        )}

        {/* Export Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Entities</p>
                  <p className="text-2xl font-bold">{totalEntities}</p>
                </div>
                <Package className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Clean Records</p>
                  <p className="text-2xl font-bold text-green-600">
                    {totalEntities - errorCount - warningCount}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Business Rules</p>
                  <p className="text-2xl font-bold">{businessRules.length}</p>
                </div>
                <Settings className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Export Format</p>
                  <p className="text-2xl font-bold">{exportType.toUpperCase()}</p>
                </div>
                <FileText className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="individual" className="space-y-4">
          <TabsList>
            <TabsTrigger value="individual">Individual Export</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Export</TabsTrigger>
            <TabsTrigger value="configuration">Configuration</TabsTrigger>
          </TabsList>

          <TabsContent value="individual" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Clients Export */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    Clients
                    <Badge variant="secondary">{clients.length}</Badge>
                  </CardTitle>
                  <CardDescription>
                    Export client data with contact information and priorities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={handleExportClients}
                    disabled={isExporting || clients.length === 0}
                    className="w-full gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export Clients
                  </Button>
                </CardContent>
              </Card>

              {/* Workers Export */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-green-600" />
                    Workers
                    <Badge variant="secondary">{workers.length}</Badge>
                  </CardTitle>
                  <CardDescription>
                    Export worker data with skills and availability
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={handleExportWorkers}
                    disabled={isExporting || workers.length === 0}
                    className="w-full gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export Workers
                  </Button>
                </CardContent>
              </Card>

              {/* Tasks Export */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-purple-600" />
                    Tasks
                    <Badge variant="secondary">{tasks.length}</Badge>
                  </CardTitle>
                  <CardDescription>
                    Export task data with requirements and dependencies
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={handleExportTasks}
                    disabled={isExporting || tasks.length === 0}
                    className="w-full gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export Tasks
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="bulk" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Bulk Export Options</CardTitle>
                <CardDescription>
                  Export multiple data types at once
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={handleExportAll}
                  disabled={isExporting || totalEntities === 0}
                  size="lg"
                  className="w-full gap-2"
                >
                  <Download className="h-5 w-5" />
                  Export All Data
                </Button>
                
                <div className="text-sm text-gray-600">
                  This will download separate files for clients, workers, tasks, business rules, and prioritization weights.
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="configuration" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Business Rules Export */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-gray-600" />
                    Business Rules
                    <Badge variant="secondary">{businessRules.length}</Badge>
                  </CardTitle>
                  <CardDescription>
                    Export business rules configuration as JSON
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={handleExportRules}
                    disabled={isExporting || businessRules.length === 0}
                    variant="outline"
                    className="w-full gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export Rules
                  </Button>
                </CardContent>
              </Card>

              {/* Prioritization Export */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-orange-600" />
                    Prioritization Weights
                  </CardTitle>
                  <CardDescription>
                    Export prioritization configuration as JSON
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={handleExportPrioritization}
                    disabled={isExporting}
                    variant="outline"
                    className="w-full gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export Weights
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Export Guide */}
        <Card>
          <CardHeader>
            <CardTitle>Export Guide</CardTitle>
            <CardDescription>
              Understanding your exported data formats
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    CSV Format
                  </h4>
                  <p className="text-sm text-gray-600">
                    Comma-separated values format, compatible with Excel, Google Sheets, and most data analysis tools.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Excel Format
                  </h4>
                  <p className="text-sm text-gray-600">
                    Native Excel format (.xlsx) with proper formatting and data types preserved.
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    JSON Configuration
                  </h4>
                  <p className="text-sm text-gray-600">
                    Business rules and prioritization weights are exported as JSON for easy import and version control.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Data Quality
                  </h4>
                  <p className="text-sm text-gray-600">
                    Exported data includes all validation fixes and transformations applied during the import process.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}