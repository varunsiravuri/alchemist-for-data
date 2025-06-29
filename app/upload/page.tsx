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
  X,
  Sparkles,
  Eye,
  Bug
} from 'lucide-react';
import { useDataStore } from '@/lib/store';
import { fileParser } from '@/lib/file-parser';
import { aiParser } from '@/lib/ai-parser';
import { validationEngine } from '@/lib/validation';
import { advancedValidationEngine } from '@/lib/advanced-validation';
import { DataGrid } from '@/components/data-grid/data-grid';
import { NaturalLanguageSearch } from '@/components/natural-language/nl-search';
import { FileUploadDebug } from '@/components/upload/file-upload-debug';
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
  const [useAIParsing, setUseAIParsing] = useState(true);

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
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`ai-parsing-${entityType}`}
              checked={useAIParsing}
              onChange={(e) => setUseAIParsing(e.target.checked)}
              className="rounded"
            />
            <label htmlFor={`ai-parsing-${entityType}`} className="text-sm flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-purple-500" />
              Use AI-powered parsing
            </label>
          </div>

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
              {useAIParsing && (
                <div className="flex items-center justify-center gap-1 mt-1 text-purple-600">
                  <Sparkles className="h-3 w-3" />
                  <span>AI will intelligently map your columns</span>
                </div>
              )}
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
  const [showDataGrids, setShowDataGrids] = useState(false);
  const [aiParsingSuggestions, setAiParsingSuggestions] = useState<string[]>([]);
  const [showDebugMode, setShowDebugMode] = useState(false);

  const uploadClients = async (file: File) => {
    setUploadingEntity('clients');
    setLoading(true);
    setUploadProgress(0);

    try {
      const rawData = await fileParser.parseFile(file);
      setUploadProgress(25);
      
      // Use AI parsing for better column mapping
      const aiResult = aiParser.parseWithAI(rawData, 'clients');
      setUploadProgress(50);
      
      const clientData = fileParser.mapToClients(aiResult.data);
      setClients(clientData);
      setUploadProgress(75);
      
      // Run both basic and advanced validations
      const basicErrors = validationEngine.validateClients(clientData);
      const advancedErrors = advancedValidationEngine.validateAdvanced(clientData, workers, tasks);
      setValidationErrors([...basicErrors, ...advancedErrors]);
      
      setAiParsingSuggestions(aiResult.suggestions);
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
      setUploadProgress(25);
      
      const aiResult = aiParser.parseWithAI(rawData, 'workers');
      setUploadProgress(50);
      
      const workerData = fileParser.mapToWorkers(aiResult.data);
      setWorkers(workerData);
      setUploadProgress(75);
      
      const basicErrors = validationEngine.validateWorkers(workerData);
      const advancedErrors = advancedValidationEngine.validateAdvanced(clients, workerData, tasks);
      setValidationErrors([...basicErrors, ...advancedErrors]);
      
      setAiParsingSuggestions(aiResult.suggestions);
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
      setUploadProgress(25);
      
      const aiResult = aiParser.parseWithAI(rawData, 'tasks');
      setUploadProgress(50);
      
      const taskData = fileParser.mapToTasks(aiResult.data);
      setTasks(taskData);
      setUploadProgress(75);
      
      const basicErrors = validationEngine.validateTasks(taskData, clients, workers);
      const advancedErrors = advancedValidationEngine.validateAdvanced(clients, workers, taskData);
      setValidationErrors([...basicErrors, ...advancedErrors]);
      
      setAiParsingSuggestions(aiResult.suggestions);
      setUploadProgress(100);
      
    } finally {
      setLoading(false);
      setUploadingEntity(null);
      setUploadProgress(0);
    }
  };

  const handleDebugFileProcessed = (data: any[], fileName: string) => {
    // Determine entity type from filename or let user choose
    const entityType = fileName.toLowerCase().includes('client') ? 'clients' :
                      fileName.toLowerCase().includes('worker') ? 'workers' :
                      fileName.toLowerCase().includes('task') ? 'tasks' : 'clients';
    
    try {
      if (entityType === 'clients') {
        const clientData = fileParser.mapToClients(data);
        setClients(clientData);
        const errors = validationEngine.validateClients(clientData);
        setValidationErrors(errors);
      } else if (entityType === 'workers') {
        const workerData = fileParser.mapToWorkers(data);
        setWorkers(workerData);
        const errors = validationEngine.validateWorkers(workerData);
        setValidationErrors(errors);
      } else if (entityType === 'tasks') {
        const taskData = fileParser.mapToTasks(data);
        setTasks(taskData);
        const errors = validationEngine.validateTasks(taskData, clients, workers);
        setValidationErrors(errors);
      }
      
      toast.success(`${entityType} data processed successfully!`);
    } catch (error) {
      toast.error(`Failed to process ${entityType}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const totalEntities = clients.length + workers.length + tasks.length;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Upload Data</h2>
            <p className="text-gray-600">
              Upload your CSV or Excel files with AI-powered parsing and real-time validation
            </p>
          </div>
          <div className="flex gap-2">
            {totalEntities > 0 && (
              <Button
                variant="outline"
                onClick={() => setShowDataGrids(!showDataGrids)}
                className="gap-2"
              >
                <Eye className="h-4 w-4" />
                {showDataGrids ? 'Hide' : 'Show'} Data Grids
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => setShowDebugMode(!showDebugMode)}
              className="gap-2"
            >
              <Bug className="h-4 w-4" />
              {showDebugMode ? 'Hide' : 'Show'} Debug Mode
            </Button>
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

        {aiParsingSuggestions.length > 0 && (
          <Alert>
            <Sparkles className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <strong>AI Parsing Insights:</strong>
                <ul className="list-disc list-inside space-y-1">
                  {aiParsingSuggestions.map((suggestion, index) => (
                    <li key={index} className="text-sm">{suggestion}</li>
                  ))}
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue={showDebugMode ? "debug" : "upload"} className="space-y-4">
          <TabsList>
            <TabsTrigger value="upload">File Upload</TabsTrigger>
            <TabsTrigger value="debug">Debug Mode</TabsTrigger>
            {totalEntities > 0 && <TabsTrigger value="grids">Data Grids</TabsTrigger>}
            {totalEntities > 0 && <TabsTrigger value="search">Natural Language Search</TabsTrigger>}
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
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

            {/* Upload Guide */}
            <Card>
              <CardHeader>
                <CardTitle>Upload Guidelines</CardTitle>
                <CardDescription>
                  Follow these guidelines for best results with AI-powered parsing
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
                      <li>• Required: ClientID, ClientName, PriorityLevel (1-5)</li>
                      <li>• Optional: RequestedTaskIDs, GroupTag, Email</li>
                      <li>• AI can map various column names</li>
                      <li>• Attributes can be JSON format</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <UserCheck className="h-4 w-4" />
                      Workers File
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Required: WorkerID, WorkerName, Skills, AvailableSlots</li>
                      <li>• Skills can be comma-separated</li>
                      <li>• Include MaxLoadPerPhase</li>
                      <li>• AI recognizes skill variations</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <ClipboardList className="h-4 w-4" />
                      Tasks File
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Required: TaskID, TaskName, Duration, MaxConcurrent</li>
                      <li>• Include RequiredSkills and PreferredPhases</li>
                      <li>• Dependencies as comma-separated</li>
                      <li>• AI maps complex relationships</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="debug" className="space-y-6">
            <FileUploadDebug onFileProcessed={handleDebugFileProcessed} />
          </TabsContent>

          {totalEntities > 0 && (
            <TabsContent value="grids" className="space-y-6">
              {clients.length > 0 && (
                <DataGrid
                  entityType="clients"
                  data={clients}
                  onDataChange={setClients}
                />
              )}
              
              {workers.length > 0 && (
                <DataGrid
                  entityType="workers"
                  data={workers}
                  onDataChange={setWorkers}
                />
              )}
              
              {tasks.length > 0 && (
                <DataGrid
                  entityType="tasks"
                  data={tasks}
                  onDataChange={setTasks}
                />
              )}
            </TabsContent>
          )}

          {totalEntities > 0 && (
            <TabsContent value="search" className="space-y-6">
              <NaturalLanguageSearch />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </MainLayout>
  );
}