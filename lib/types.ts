export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  priority: number;
  attributesJson?: string;
  createdAt?: string;
}

export interface Worker {
  id: string;
  name: string;
  email?: string;
  skills: string[];
  availability: string;
  maxConcurrentTasks: number;
  hourlyRate?: number;
  preferredPhases?: number[];
  attributesJson?: string;
}

export interface Task {
  id: string;
  name: string;
  clientId: string;
  description?: string;
  priority: number;
  duration: number;
  requiredSkills: string[];
  preferredPhases?: number[];
  dependencies?: string[];
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  estimatedHours?: number;
  attributesJson?: string;
}

export interface ValidationError {
  id: string;
  entityType: 'client' | 'worker' | 'task';
  entityId: string;
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  timestamp: Date;
}

export interface BusinessRule {
  id: string;
  name: string;
  description: string;
  type: 'co-location' | 'slot-restriction' | 'load-limit' | 'phase-window' | 'custom';
  conditions: Record<string, any>;
  actions: Record<string, any>;
  active: boolean;
  createdAt: Date;
}

export interface PrioritizationWeights {
  priorityLevel: number;
  fulfillment: number;
  fairness: number;
  efficiency: number;
  skillMatch: number;
}

export interface DataState {
  clients: Client[];
  workers: Worker[];
  tasks: Task[];
  validationErrors: ValidationError[];
  businessRules: BusinessRule[];
  prioritizationWeights: PrioritizationWeights;
  isLoading: boolean;
  uploadProgress: number;
}