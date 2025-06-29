import * as XLSX from 'xlsx';
import { Client, Worker, Task, BusinessRule, PrioritizationWeights } from './types';

export class ExportService {
  exportToCSV(data: any[], filename: string): void {
    const csv = this.convertToCSV(data);
    this.downloadFile(csv, filename, 'text/csv');
  }

  exportToExcel(data: any[], filename: string): void {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    XLSX.writeFile(workbook, filename);
  }

  exportClients(clients: Client[]): void {
    const cleanedClients = clients.map(client => ({
      ...client,
      skills: undefined, // Remove fields that don't belong to clients
      requiredSkills: undefined,
      dependencies: undefined
    }));
    this.exportToCSV(cleanedClients, 'cleaned_clients.csv');
  }

  exportWorkers(workers: Worker[]): void {
    const cleanedWorkers = workers.map(worker => ({
      ...worker,
      skills: JSON.stringify(worker.skills),
      preferredPhases: JSON.stringify(worker.preferredPhases || [])
    }));
    this.exportToCSV(cleanedWorkers, 'cleaned_workers.csv');
  }

  exportTasks(tasks: Task[]): void {
    const cleanedTasks = tasks.map(task => ({
      ...task,
      requiredSkills: JSON.stringify(task.requiredSkills),
      preferredPhases: JSON.stringify(task.preferredPhases || []),
      dependencies: JSON.stringify(task.dependencies || [])
    }));
    this.exportToCSV(cleanedTasks, 'cleaned_tasks.csv');
  }

  exportRules(rules: BusinessRule[]): void {
    const rulesData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      rules: rules.map(rule => ({
        id: rule.id,
        name: rule.name,
        description: rule.description,
        type: rule.type,
        conditions: rule.conditions,
        actions: rule.actions,
        active: rule.active,
        createdAt: rule.createdAt.toISOString()
      }))
    };
    
    const json = JSON.stringify(rulesData, null, 2);
    this.downloadFile(json, 'rules.json', 'application/json');
  }

  exportPrioritization(weights: PrioritizationWeights): void {
    const prioritizationData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      weights: weights
    };
    
    const json = JSON.stringify(prioritizationData, null, 2);
    this.downloadFile(json, 'prioritization.json', 'application/json');
  }

  exportAll(
    clients: Client[], 
    workers: Worker[], 
    tasks: Task[], 
    rules: BusinessRule[], 
    weights: PrioritizationWeights
  ): void {
    // Create a zip-like structure by downloading all files
    setTimeout(() => this.exportClients(clients), 100);
    setTimeout(() => this.exportWorkers(workers), 200);
    setTimeout(() => this.exportTasks(tasks), 300);
    setTimeout(() => this.exportRules(rules), 400);
    setTimeout(() => this.exportPrioritization(weights), 500);
  }

  private convertToCSV(data: any[]): string {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [];
    
    // Add headers
    csvRows.push(headers.join(','));
    
    // Add data rows
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        // Escape commas and quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value || '';
      });
      csvRows.push(values.join(','));
    }
    
    return csvRows.join('\n');
  }

  private downloadFile(content: string, filename: string, contentType: string): void {
    const blob = new Blob([content], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}

export const exportService = new ExportService();