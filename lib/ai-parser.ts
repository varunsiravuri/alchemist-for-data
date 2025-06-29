import { Client, Worker, Task } from './types';

interface ParsedHeader {
  original: string;
  mapped: string;
  confidence: number;
}

interface AIParsingResult {
  data: any[];
  headerMappings: ParsedHeader[];
  suggestions: string[];
}

export class AIParser {
  private clientFieldMappings = {
    'id': ['id', 'client_id', 'clientid', 'client id', 'customer_id', 'customerid'],
    'name': ['name', 'client_name', 'clientname', 'client name', 'customer_name', 'customer name', 'company', 'organization'],
    'email': ['email', 'email_address', 'emailaddress', 'e-mail', 'client_email', 'contact_email'],
    'phone': ['phone', 'phone_number', 'phonenumber', 'telephone', 'tel', 'mobile', 'contact_number'],
    'address': ['address', 'location', 'street', 'full_address', 'mailing_address', 'physical_address'],
    'priority': ['priority', 'priority_level', 'prioritylevel', 'importance', 'urgency', 'rank']
  };

  private workerFieldMappings = {
    'id': ['id', 'worker_id', 'workerid', 'worker id', 'employee_id', 'employeeid', 'staff_id'],
    'name': ['name', 'worker_name', 'workername', 'worker name', 'employee_name', 'full_name', 'fullname'],
    'email': ['email', 'email_address', 'emailaddress', 'e-mail', 'worker_email', 'employee_email'],
    'skills': ['skills', 'skill_set', 'skillset', 'abilities', 'competencies', 'expertise', 'capabilities'],
    'availability': ['availability', 'available', 'status', 'work_status', 'schedule', 'working_hours'],
    'maxConcurrentTasks': ['max_concurrent_tasks', 'maxconcurrenttasks', 'max_tasks', 'capacity', 'workload_limit', 'concurrent_limit'],
    'hourlyRate': ['hourly_rate', 'hourlyrate', 'rate', 'wage', 'salary', 'cost_per_hour', 'billing_rate']
  };

  private taskFieldMappings = {
    'id': ['id', 'task_id', 'taskid', 'task id', 'job_id', 'jobid', 'ticket_id'],
    'name': ['name', 'task_name', 'taskname', 'task name', 'title', 'description', 'summary'],
    'clientId': ['client_id', 'clientid', 'client id', 'customer_id', 'customerid', 'assigned_client'],
    'description': ['description', 'details', 'notes', 'comments', 'task_description', 'full_description'],
    'priority': ['priority', 'priority_level', 'prioritylevel', 'importance', 'urgency', 'rank'],
    'duration': ['duration', 'estimated_duration', 'time_required', 'hours', 'days', 'effort'],
    'requiredSkills': ['required_skills', 'requiredskills', 'skills_needed', 'skill_requirements', 'competencies'],
    'status': ['status', 'task_status', 'state', 'progress', 'current_status', 'stage']
  };

  intelligentHeaderMapping(headers: string[], entityType: 'clients' | 'workers' | 'tasks'): ParsedHeader[] {
    const mappings = this.getFieldMappings(entityType);
    const results: ParsedHeader[] = [];

    headers.forEach(header => {
      const normalizedHeader = header.toLowerCase().trim();
      let bestMatch = { field: '', confidence: 0 };

      // Exact match first
      for (const [field, variations] of Object.entries(mappings)) {
        if (variations.includes(normalizedHeader)) {
          bestMatch = { field, confidence: 1.0 };
          break;
        }
      }

      // Fuzzy matching if no exact match
      if (bestMatch.confidence === 0) {
        for (const [field, variations] of Object.entries(mappings)) {
          for (const variation of variations) {
            const similarity = this.calculateSimilarity(normalizedHeader, variation);
            if (similarity > bestMatch.confidence && similarity > 0.6) {
              bestMatch = { field, confidence: similarity };
            }
          }
        }
      }

      results.push({
        original: header,
        mapped: bestMatch.field || header,
        confidence: bestMatch.confidence
      });
    });

    return results;
  }

  parseWithAI(rawData: any[], entityType: 'clients' | 'workers' | 'tasks'): AIParsingResult {
    if (rawData.length === 0) {
      return { data: [], headerMappings: [], suggestions: [] };
    }

    const headers = Object.keys(rawData[0]);
    const headerMappings = this.intelligentHeaderMapping(headers, entityType);
    const suggestions: string[] = [];

    // Transform data using mapped headers
    const transformedData = rawData.map(row => {
      const newRow: any = {};
      
      headerMappings.forEach(mapping => {
        const originalValue = row[mapping.original];
        const mappedField = mapping.mapped;

        if (mapping.confidence < 0.8 && mapping.confidence > 0) {
          suggestions.push(`Low confidence mapping: "${mapping.original}" → "${mapping.mapped}" (${Math.round(mapping.confidence * 100)}%)`);
        }

        // Apply field-specific transformations
        newRow[mappedField] = this.transformFieldValue(mappedField, originalValue, entityType);
      });

      return newRow;
    });

    // Add data quality suggestions
    this.addDataQualitySuggestions(transformedData, entityType, suggestions);

    return {
      data: transformedData,
      headerMappings,
      suggestions
    };
  }

  private getFieldMappings(entityType: 'clients' | 'workers' | 'tasks') {
    switch (entityType) {
      case 'clients': return this.clientFieldMappings;
      case 'workers': return this.workerFieldMappings;
      case 'tasks': return this.taskFieldMappings;
      default: return {};
    }
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  private transformFieldValue(field: string, value: any, entityType: string): any {
    if (value === null || value === undefined || value === '') {
      return this.getDefaultValue(field, entityType);
    }

    switch (field) {
      case 'skills':
      case 'requiredSkills':
      case 'dependencies':
        return this.parseArrayField(value);
      
      case 'priority':
      case 'duration':
      case 'maxConcurrentTasks':
        return this.parseIntegerField(value);
      
      case 'hourlyRate':
      case 'estimatedHours':
        return this.parseFloatField(value);
      
      case 'preferredPhases':
        return this.parseIntArrayField(value);
      
      case 'email':
        return this.normalizeEmail(value);
      
      case 'phone':
        return this.normalizePhone(value);
      
      case 'status':
        return this.normalizeStatus(value);
      
      default:
        return String(value).trim();
    }
  }

  private parseArrayField(value: any): string[] {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        return value.split(/[,;|]/).map(s => s.trim()).filter(s => s.length > 0);
      }
    }
    return [];
  }

  private parseIntegerField(value: any): number {
    const parsed = parseInt(String(value));
    return isNaN(parsed) ? 0 : Math.max(0, parsed);
  }

  private parseFloatField(value: any): number {
    const parsed = parseFloat(String(value));
    return isNaN(parsed) ? 0 : Math.max(0, parsed);
  }

  private parseIntArrayField(value: any): number[] {
    if (Array.isArray(value)) return value.map(Number).filter(n => !isNaN(n));
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) return parsed.map(Number).filter(n => !isNaN(n));
      } catch {
        return value.split(/[,;|]/).map(s => parseInt(s.trim())).filter(n => !isNaN(n));
      }
    }
    return [];
  }

  private normalizeEmail(value: any): string {
    const email = String(value).toLowerCase().trim();
    return email.includes('@') ? email : '';
  }

  private normalizePhone(value: any): string {
    return String(value).replace(/[^\d+\-\(\)\s]/g, '').trim();
  }

  private normalizeStatus(value: any): 'pending' | 'in-progress' | 'completed' | 'cancelled' {
    const status = String(value).toLowerCase().trim();
    if (status.includes('progress') || status.includes('active') || status.includes('working')) return 'in-progress';
    if (status.includes('complete') || status.includes('done') || status.includes('finished')) return 'completed';
    if (status.includes('cancel') || status.includes('abort') || status.includes('stopped')) return 'cancelled';
    return 'pending';
  }

  private getDefaultValue(field: string, entityType: string): any {
    switch (field) {
      case 'priority': return 3;
      case 'duration': return 1;
      case 'maxConcurrentTasks': return 3;
      case 'hourlyRate': return 0;
      case 'estimatedHours': return 0;
      case 'skills':
      case 'requiredSkills':
      case 'dependencies':
      case 'preferredPhases': return [];
      case 'availability': return 'full-time';
      case 'status': return 'pending';
      default: return '';
    }
  }

  private addDataQualitySuggestions(data: any[], entityType: string, suggestions: string[]): void {
    const sampleSize = Math.min(data.length, 10);
    const sample = data.slice(0, sampleSize);

    // Check for missing required fields
    const requiredFields = this.getRequiredFields(entityType);
    requiredFields.forEach(field => {
      const missingCount = sample.filter(row => !row[field] || row[field] === '').length;
      if (missingCount > 0) {
        suggestions.push(`${missingCount}/${sampleSize} records missing required field: ${field}`);
      }
    });

    // Check for data consistency
    if (entityType === 'clients' || entityType === 'tasks') {
      const priorities = sample.map(row => row.priority).filter(p => p !== undefined);
      const invalidPriorities = priorities.filter(p => p < 1 || p > 5);
      if (invalidPriorities.length > 0) {
        suggestions.push(`${invalidPriorities.length} records have invalid priority values (should be 1-5)`);
      }
    }

    // Check email formats
    if (entityType === 'clients' || entityType === 'workers') {
      const emails = sample.map(row => row.email).filter(e => e && e !== '');
      const invalidEmails = emails.filter(email => !email.includes('@') || !email.includes('.'));
      if (invalidEmails.length > 0) {
        suggestions.push(`${invalidEmails.length} records have invalid email formats`);
      }
    }
  }

  private getRequiredFields(entityType: string): string[] {
    switch (entityType) {
      case 'clients': return ['id', 'name'];
      case 'workers': return ['id', 'name', 'skills'];
      case 'tasks': return ['id', 'name', 'clientId'];
      default: return [];
    }
  }
}

export const aiParser = new AIParser();