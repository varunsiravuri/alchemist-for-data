import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { Client, Worker, Task } from './types';

export class FileParser {
  async parseFile(file: File): Promise<any[]> {
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    if (extension === 'csv') {
      return this.parseCSV(file);
    } else if (extension === 'xlsx' || extension === 'xls') {
      return this.parseExcel(file);
    } else {
      throw new Error('Unsupported file format. Please upload CSV or Excel files.');
    }
  }

  private parseCSV(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            reject(new Error(`CSV parsing error: ${results.errors[0].message}`));
          } else {
            resolve(results.data as any[]);
          }
        },
        error: (error) => {
          reject(new Error(`CSV parsing error: ${error.message}`));
        }
      });
    });
  }

  private async parseExcel(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          resolve(jsonData);
        } catch (error) {
          reject(new Error(`Excel parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`));
        }
      };
      reader.onerror = () => reject(new Error('File reading error'));
      reader.readAsArrayBuffer(file);
    });
  }

  mapToClients(data: any[]): Client[] {
    return data.map((row, index) => ({
      id: this.extractValue(row, ['id', 'client_id', 'clientId', 'Client ID']) || `client-${index + 1}`,
      name: this.extractValue(row, ['name', 'client_name', 'clientName', 'Client Name']) || '',
      email: this.extractValue(row, ['email', 'client_email', 'clientEmail', 'Email']),
      phone: this.extractValue(row, ['phone', 'client_phone', 'clientPhone', 'Phone']),
      address: this.extractValue(row, ['address', 'client_address', 'clientAddress', 'Address']),
      priority: parseInt(this.extractValue(row, ['priority', 'Priority']) || '3'),
      attributesJson: this.extractValue(row, ['attributes', 'attributesJson', 'Attributes']),
      createdAt: this.extractValue(row, ['created_at', 'createdAt', 'Created At'])
    }));
  }

  mapToWorkers(data: any[]): Worker[] {
    return data.map((row, index) => ({
      id: this.extractValue(row, ['id', 'worker_id', 'workerId', 'Worker ID']) || `worker-${index + 1}`,
      name: this.extractValue(row, ['name', 'worker_name', 'workerName', 'Worker Name']) || '',
      email: this.extractValue(row, ['email', 'worker_email', 'workerEmail', 'Email']),
      skills: this.parseArrayField(this.extractValue(row, ['skills', 'Skills', 'worker_skills']) || ''),
      availability: this.extractValue(row, ['availability', 'Availability']) || 'full-time',
      maxConcurrentTasks: parseInt(this.extractValue(row, ['max_concurrent_tasks', 'maxConcurrentTasks', 'Max Concurrent Tasks']) || '3'),
      hourlyRate: parseFloat(this.extractValue(row, ['hourly_rate', 'hourlyRate', 'Hourly Rate']) || '0'),
      preferredPhases: this.parseIntArrayField(this.extractValue(row, ['preferred_phases', 'preferredPhases', 'Preferred Phases']) || ''),
      attributesJson: this.extractValue(row, ['attributes', 'attributesJson', 'Attributes'])
    }));
  }

  mapToTasks(data: any[]): Task[] {
    return data.map((row, index) => ({
      id: this.extractValue(row, ['id', 'task_id', 'taskId', 'Task ID']) || `task-${index + 1}`,
      name: this.extractValue(row, ['name', 'task_name', 'taskName', 'Task Name']) || '',
      clientId: this.extractValue(row, ['client_id', 'clientId', 'Client ID']) || '',
      description: this.extractValue(row, ['description', 'Description']),
      priority: parseInt(this.extractValue(row, ['priority', 'Priority']) || '3'),
      duration: parseInt(this.extractValue(row, ['duration', 'Duration']) || '1'),
      requiredSkills: this.parseArrayField(this.extractValue(row, ['required_skills', 'requiredSkills', 'Required Skills']) || ''),
      preferredPhases: this.parseIntArrayField(this.extractValue(row, ['preferred_phases', 'preferredPhases', 'Preferred Phases']) || ''),
      dependencies: this.parseArrayField(this.extractValue(row, ['dependencies', 'Dependencies']) || ''),
      status: this.extractValue(row, ['status', 'Status']) as 'pending' | 'in-progress' | 'completed' | 'cancelled' || 'pending',
      estimatedHours: parseFloat(this.extractValue(row, ['estimated_hours', 'estimatedHours', 'Estimated Hours']) || '0'),
      attributesJson: this.extractValue(row, ['attributes', 'attributesJson', 'Attributes'])
    }));
  }

  private extractValue(row: any, possibleKeys: string[]): string | undefined {
    for (const key of possibleKeys) {
      if (row[key] !== undefined && row[key] !== null) {
        return String(row[key]).trim();
      }
    }
    return undefined;
  }

  private parseArrayField(value: string): string[] {
    if (!value) return [];
    try {
      // Try parsing as JSON first
      return JSON.parse(value);
    } catch {
      // Fall back to comma-separated values
      return value.split(',').map(v => v.trim()).filter(v => v.length > 0);
    }
  }

  private parseIntArrayField(value: string): number[] {
    if (!value) return [];
    try {
      // Try parsing as JSON first
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.map(Number) : [];
    } catch {
      // Fall back to comma-separated values
      return value.split(',').map(v => parseInt(v.trim())).filter(v => !isNaN(v));
    }
  }
}

export const fileParser = new FileParser();