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
        transformHeader: (header) => header.trim(),
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
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            raw: false,
            defval: ''
          });
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
      id: this.extractValue(row, ['ClientID', 'id', 'client_id', 'clientId', 'Client ID', 'ID']) || `client-${index + 1}`,
      name: this.extractValue(row, ['ClientName', 'name', 'client_name', 'clientName', 'Client Name', 'Name']) || '',
      priority: parseInt(this.extractValue(row, ['PriorityLevel', 'priority', 'Priority']) || '3'),
      requestedTaskIds: this.parseArrayField(this.extractValue(row, ['RequestedTaskIDs', 'requestedTaskIds', 'requested_task_ids', 'Requested Task IDs']) || ''),
      groupTag: this.extractValue(row, ['GroupTag', 'groupTag', 'group_tag', 'Group Tag']),
      attributesJson: this.extractValue(row, ['AttributesJSON', 'attributesJson', 'attributes_json', 'Attributes JSON', 'attributes']),
      // Legacy fields for backward compatibility
      email: this.extractValue(row, ['email', 'client_email', 'clientEmail', 'Email']),
      phone: this.extractValue(row, ['phone', 'client_phone', 'clientPhone', 'Phone']),
      address: this.extractValue(row, ['address', 'client_address', 'clientAddress', 'Address']),
      createdAt: this.extractValue(row, ['created_at', 'createdAt', 'Created At'])
    }));
  }

  mapToWorkers(data: any[]): Worker[] {
    return data.map((row, index) => ({
      id: this.extractValue(row, ['WorkerID', 'id', 'worker_id', 'workerId', 'Worker ID', 'ID']) || `worker-${index + 1}`,
      name: this.extractValue(row, ['WorkerName', 'name', 'worker_name', 'workerName', 'Worker Name', 'Name']) || '',
      skills: this.parseArrayField(this.extractValue(row, ['Skills', 'skills', 'worker_skills']) || ''),
      availableSlots: this.parseIntArrayField(this.extractValue(row, ['AvailableSlots', 'availableSlots', 'available_slots', 'Available Slots']) || ''),
      maxLoadPerPhase: parseInt(this.extractValue(row, ['MaxLoadPerPhase', 'maxLoadPerPhase', 'max_load_per_phase', 'Max Load Per Phase']) || '3'),
      workerGroup: this.extractValue(row, ['WorkerGroup', 'workerGroup', 'worker_group', 'Worker Group']),
      qualificationLevel: parseInt(this.extractValue(row, ['QualificationLevel', 'qualificationLevel', 'qualification_level', 'Qualification Level']) || '0'),
      // Legacy fields for backward compatibility
      email: this.extractValue(row, ['email', 'worker_email', 'workerEmail', 'Email']),
      availability: this.extractValue(row, ['availability', 'Availability']) || 'full-time',
      maxConcurrentTasks: parseInt(this.extractValue(row, ['max_concurrent_tasks', 'maxConcurrentTasks', 'Max Concurrent Tasks']) || '3'),
      hourlyRate: parseFloat(this.extractValue(row, ['hourly_rate', 'hourlyRate', 'Hourly Rate']) || '0'),
      preferredPhases: this.parseIntArrayField(this.extractValue(row, ['preferred_phases', 'preferredPhases', 'Preferred Phases']) || ''),
      attributesJson: this.extractValue(row, ['attributes', 'attributesJson', 'Attributes'])
    }));
  }

  mapToTasks(data: any[]): Task[] {
    return data.map((row, index) => ({
      id: this.extractValue(row, ['TaskID', 'id', 'task_id', 'taskId', 'Task ID', 'ID']) || `task-${index + 1}`,
      name: this.extractValue(row, ['TaskName', 'name', 'task_name', 'taskName', 'Task Name', 'Name']) || '',
      category: this.extractValue(row, ['Category', 'category']),
      duration: parseInt(this.extractValue(row, ['Duration', 'duration']) || '1'),
      requiredSkills: this.parseArrayField(this.extractValue(row, ['RequiredSkills', 'requiredSkills', 'required_skills', 'Required Skills']) || ''),
      preferredPhases: this.parsePhaseField(this.extractValue(row, ['PreferredPhases', 'preferredPhases', 'preferred_phases', 'Preferred Phases']) || ''),
      maxConcurrent: parseInt(this.extractValue(row, ['MaxConcurrent', 'maxConcurrent', 'max_concurrent', 'Max Concurrent']) || '1'),
      // Legacy fields for backward compatibility
      clientId: this.extractValue(row, ['client_id', 'clientId', 'Client ID']),
      description: this.extractValue(row, ['description', 'Description']),
      priority: parseInt(this.extractValue(row, ['priority', 'Priority']) || '3'),
      dependencies: this.parseArrayField(this.extractValue(row, ['dependencies', 'Dependencies']) || ''),
      status: this.extractValue(row, ['status', 'Status']) as 'pending' | 'in-progress' | 'completed' | 'cancelled' || 'pending',
      estimatedHours: parseFloat(this.extractValue(row, ['estimated_hours', 'estimatedHours', 'Estimated Hours']) || '0'),
      attributesJson: this.extractValue(row, ['attributes', 'attributesJson', 'Attributes'])
    }));
  }

  private extractValue(row: any, possibleKeys: string[]): string | undefined {
    for (const key of possibleKeys) {
      if (row[key] !== undefined && row[key] !== null && row[key] !== '') {
        return String(row[key]).trim();
      }
    }
    return undefined;
  }

  private parseArrayField(value: string): string[] {
    if (!value) return [];
    try {
      // Try parsing as JSON first
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // Fall back to comma-separated values
      return value.split(/[,;|]/).map(v => v.trim()).filter(v => v.length > 0);
    }
    return [];
  }

  private parseIntArrayField(value: string): number[] {
    if (!value) return [];
    try {
      // Try parsing as JSON first
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.map(Number).filter(n => !isNaN(n));
    } catch {
      // Fall back to comma-separated values
      return value.split(/[,;|]/).map(v => parseInt(v.trim())).filter(n => !isNaN(n));
    }
    return [];
  }

  private parsePhaseField(value: string): number[] {
    if (!value) return [];
    
    // Handle range syntax like "1-3"
    if (value.includes('-')) {
      const [start, end] = value.split('-').map(v => parseInt(v.trim()));
      if (!isNaN(start) && !isNaN(end)) {
        const phases = [];
        for (let i = start; i <= end; i++) {
          phases.push(i);
        }
        return phases;
      }
    }
    
    // Handle array format
    return this.parseIntArrayField(value);
  }
}

export const fileParser = new FileParser();