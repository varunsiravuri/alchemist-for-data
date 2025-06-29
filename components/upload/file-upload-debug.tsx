'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  FileText, 
  AlertTriangle, 
  CheckCircle,
  Info,
  X
} from 'lucide-react';

interface FileUploadDebugProps {
  onFileProcessed: (data: any[], fileName: string) => void;
}

export function FileUploadDebug({ onFileProcessed }: FileUploadDebugProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [fileInfo, setFileInfo] = useState<{
    name: string;
    size: number;
    type: string;
  } | null>(null);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  const addDebugInfo = (message: string) => {
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFile = async (file: File) => {
    try {
      setUploadStatus('processing');
      setErrorMessage('');
      setFileInfo({
        name: file.name,
        size: file.size,
        type: file.type
      });

      addDebugInfo(`Starting to process file: ${file.name}`);
      addDebugInfo(`File size: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
      addDebugInfo(`File type: ${file.type}`);

      // Check file size (50MB limit)
      if (file.size > 50 * 1024 * 1024) {
        throw new Error('File size exceeds 50MB limit');
      }

      // Check file type
      const validTypes = [
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/csv'
      ];
      
      const extension = file.name.split('.').pop()?.toLowerCase();
      const validExtensions = ['csv', 'xlsx', 'xls'];
      
      if (!validExtensions.includes(extension || '')) {
        throw new Error(`Invalid file type. Please upload CSV or Excel files. Got: ${extension}`);
      }

      addDebugInfo('File validation passed');

      // Process CSV files
      if (extension === 'csv') {
        addDebugInfo('Processing CSV file...');
        const text = await file.text();
        addDebugInfo(`File content length: ${text.length} characters`);
        
        // Simple CSV parsing for debugging
        const lines = text.split('\n').filter(line => line.trim());
        addDebugInfo(`Found ${lines.length} lines`);
        
        if (lines.length === 0) {
          throw new Error('CSV file appears to be empty');
        }

        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        addDebugInfo(`Headers: ${headers.join(', ')}`);

        const data = [];
        for (let i = 1; i < Math.min(lines.length, 1000); i++) { // Limit to 1000 rows for debugging
          const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
          const row: any = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          data.push(row);
        }

        addDebugInfo(`Processed ${data.length} data rows`);
        onFileProcessed(data, file.name);
        setUploadStatus('success');
      }
      
      // Process Excel files
      else if (extension === 'xlsx' || extension === 'xls') {
        addDebugInfo('Processing Excel file...');
        
        // Dynamic import to avoid SSR issues
        const XLSX = await import('xlsx');
        addDebugInfo('XLSX library loaded');

        const arrayBuffer = await file.arrayBuffer();
        addDebugInfo(`File read as ArrayBuffer: ${arrayBuffer.byteLength} bytes`);

        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        addDebugInfo(`Workbook loaded with ${workbook.SheetNames.length} sheets`);

        const firstSheetName = workbook.SheetNames[0];
        addDebugInfo(`Processing sheet: ${firstSheetName}`);

        const worksheet = workbook.Sheets[firstSheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, {
          raw: false,
          defval: ''
        });

        addDebugInfo(`Extracted ${data.length} rows from Excel`);
        onFileProcessed(data, file.name);
        setUploadStatus('success');
      }

    } catch (error) {
      console.error('File processing error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error occurred');
      setUploadStatus('error');
      addDebugInfo(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const clearDebug = () => {
    setDebugInfo([]);
    setUploadStatus('idle');
    setErrorMessage('');
    setFileInfo(null);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            File Upload Debugger
          </CardTitle>
          <CardDescription>
            Enhanced file upload with detailed debugging information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            } ${uploadStatus === 'processing' ? 'opacity-50' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <div className="text-lg font-medium mb-2">
              Drop your file here or click to browse
            </div>
            <div className="text-sm text-gray-500 mb-4">
              Supports CSV and Excel files (.csv, .xlsx, .xls) up to 50MB
            </div>
            
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload-debug"
              disabled={uploadStatus === 'processing'}
            />
            <label htmlFor="file-upload-debug">
              <Button 
                variant="outline" 
                className="cursor-pointer"
                disabled={uploadStatus === 'processing'}
              >
                {uploadStatus === 'processing' ? 'Processing...' : 'Choose File'}
              </Button>
            </label>
          </div>

          {/* File Info */}
          {fileInfo && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4" />
                <span className="font-medium">{fileInfo.name}</span>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <div>Size: {(fileInfo.size / 1024 / 1024).toFixed(2)} MB</div>
                <div>Type: {fileInfo.type || 'Unknown'}</div>
              </div>
            </div>
          )}

          {/* Status Messages */}
          {uploadStatus === 'success' && (
            <Alert className="mt-4">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                File processed successfully! Check the debug log below for details.
              </AlertDescription>
            </Alert>
          )}

          {uploadStatus === 'error' && (
            <Alert variant="destructive" className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Error: {errorMessage}
              </AlertDescription>
            </Alert>
          )}

          {uploadStatus === 'processing' && (
            <Alert className="mt-4">
              <Info className="h-4 w-4" />
              <AlertDescription>
                Processing file... Please wait.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Debug Log */}
      {debugInfo.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Debug Log</CardTitle>
              <Button variant="ghost" size="sm" onClick={clearDebug}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-xs max-h-64 overflow-y-auto">
              {debugInfo.map((info, index) => (
                <div key={index} className="mb-1">
                  {info}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Browser Compatibility Check */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Browser Compatibility</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              {typeof window !== 'undefined' && window.File ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <X className="h-4 w-4 text-red-500" />
              )}
              <span>File API Support</span>
            </div>
            <div className="flex items-center gap-2">
              {typeof window !== 'undefined' && window.FileReader ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <X className="h-4 w-4 text-red-500" />
              )}
              <span>FileReader API Support</span>
            </div>
            <div className="flex items-center gap-2">
              {typeof window !== 'undefined' && 'DataTransfer' in window ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <X className="h-4 w-4 text-red-500" />
              )}
              <span>Drag & Drop Support</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}