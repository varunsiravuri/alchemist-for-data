'use client';

import React, { useState, useCallback } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  FileText, 
  Users, 
  UserCheck, 
  ClipboardList,
  CheckCircle,
  AlertTriangle,
  X
} from 'lucide-react';
import { useDataStore } from '@/lib/store';
import { fileParser } from '@/lib/file-parser';
import { validationEngine } from '@/lib/validation';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  entityType: 'clients' | 'workers' | 'tasks';
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  onUpload: (file: File) => Promise<void>;
  isUploading: boolean;
  uploadedCount: number;
}

function FileUpload({ entityType, title, description, icon: Icon, onUpload, isUploading, uploadedCount }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  }, []);

  const handleUpload = async () => {
    if (!file) return;
    
    try {
      await onUpload(file);
      setFile(null);
      toast.success(`${title} uploaded successfully!`);
    } catch (error) {
      toast.error(`Failed to upload ${title.toLowerCase()}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const clearFile = () => {
    setFile(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          {title}
          {uploadedCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {uploadedCount} uploaded
            </Badge>
          )}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
              dragActive ? "border-primary bg-primary/5" : "border-gray-300",
              "hover:border-primary hover:bg-primary/5"
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <div className="text-lg font-medium mb-2">
              Drop your {entityType} file here
            </div>
            <div className="text-sm text-gray-500 mb-4">
              Supports CSV and Excel files (.csv, .xlsx, .xls)
            </div>
            
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
              id={`file-${entityType}`}
            />
            <label htmlFor={`file-${entityType}`}>
              <Button variant="outline" className="cursor-pointer">
                Choose File
              </Button>
            </label>
          </div>

          {file && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">{file.name}</span>
                <span className="text-xs text-gray-500">
                  ({(file.size / 1024).toFixed(1)} KB)
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleUpload}
                  disabled={isUploading}
                >
                  {isUploading ? 'Uploading...' : 'Upload'}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={clearFile}
                  disabled={isUploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function UploadPage() {
  const { 
    clients, 
    workers, 
    tasks, 
    setClients, 
    setWorkers, 
    setTasks, 
    setValidationErrors,
    isLoading,
    uploadProgress,
    setLoading,
    setUploadProgress
  } = useDataStore();

  const [uploadingEntity, setUploadingEntity] = useState<string | null>(null);

  const uploadClients = async (file: File) => {
    setUploadingEntity('clients');
    setLoading(true);
    setUploadProgress(0);

    try {
      const rawData = await fileParser.parseFile(file);
      setUploadProgress(50);
      
      const clientData = fileParser.mapToClients(rawData);
      setClients(clientData);
      setUploadProgress(75);
      
      const errors = validationEngine.validateClients(clientData);
      setValidationErrors(errors);
      setUploadProgress(100);
      
    } finally {
      setLoading(false);
      setUploadingEntity(null);
      setUploadProgress(0);
    }
  };

  const uploadWorkers = async (file: File) => {
    setUploadingEntity('workers');
    setLoading(true);
    setUploadProgress(0);

    try {
      const rawData = await fileParser.parseFile(file);
      setUploadProgress(50);
      
      const workerData = fileParser.mapToWorkers(rawData);
      setWorkers(workerData);
      setUploadProgress(75);
      
      const errors = validationEngine.validateWorkers(workerData);
      setValidationErrors(errors);
      setUploadProgress(100);
      
    } finally {
      setLoading(false);
      setUploadingEntity(null);
      setUploadProgress(0);
    }
  };

  const uploadTasks = async (file: File) => {
    setUploadingEntity('tasks');
    setLoading(true);
    setUploadProgress(0);

    try {
      const rawData = await fileParser.parseFile(file);
      setUploadProgress(40);
      
      const taskData = fileParser.mapToTasks(rawData);
      setTasks(taskData);
      setUploadProgress(60);
      
      const errors = validationEngine.validateTasks(taskData, clients, workers);
      setValidationErrors(errors);
      setUploadProgress(100);
      
    } finally {
      setLoading(false);
      setUploadingEntity(null);
      setUploadProgress(0);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Upload Data</h2>
            <p className="text-gray-600">
              Upload your CSV or Excel files to get started with data transformation
            </p>
          </div>
        </div>

        {isLoading && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <div>Processing {uploadingEntity}... Please wait.</div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="individual" className="space-y-4">
          <TabsList>
            <TabsTrigger value="individual">Individual Upload</TabsTrigger>
            <TabsTrigger value="batch">Batch Upload</TabsTrigger>
          </TabsList>

          <TabsContent value="individual" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <FileUpload
                entityType="clients"
                title="Clients"
                description="Upload client data with IDs, names, priorities, and contact information"
                icon={Users}
                onUpload={uploadClients}
                isUploading={uploadingEntity === 'clients'}
                uploadedCount={clients.length}
              />
              
              <FileUpload
                entityType="workers"
                title="Workers"
                description="Upload worker data with skills, availability, and capacity information"
                icon={UserCheck}
                onUpload={uploadWorkers}
                isUploading={uploadingEntity === 'workers'}
                uploadedCount={workers.length}
              />
              
              <FileUpload
                entityType="tasks"
                title="Tasks"
                description="Upload task data with requirements, priorities, and dependencies"
                icon={ClipboardList}
                onUpload={uploadTasks}
                isUploading={uploadingEntity === 'tasks'}
                uploadedCount={tasks.length}
              />
            </div>
          </TabsContent>

          <TabsContent value="batch" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Batch Upload</CardTitle>
                <CardDescription>
                  Upload multiple files at once for faster processing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Batch upload feature is coming soon. For now, please use individual upload.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Upload Guide */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Guidelines</CardTitle>
            <CardDescription>
              Follow these guidelines for best results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Clients File
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Required: ID, Name, Priority (1-5)</li>
                  <li>• Optional: Email, Phone, Address</li>
                  <li>• Attributes can be JSON format</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <UserCheck className="h-4 w-4" />
                  Workers File
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Required: ID, Name, Skills</li>
                  <li>• Skills can be comma-separated</li>
                  <li>• Include max concurrent tasks</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <ClipboardList className="h-4 w-4" />
                  Tasks File
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Required: ID, Name, Client ID</li>
                  <li>• Include priority and duration</li>
                  <li>• Dependencies as comma-separated</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}