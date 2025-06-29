export interface Client {
  id: string; // ClientID
  name: string; // ClientName
  priority: number; // PriorityLevel (1-5)
  requestedTaskIds: string[]; // RequestedTaskIDs (comma-separated)
  groupTag?: string; // GroupTag
  attributesJson?: string; // AttributesJSON
  // Legacy fields for backward compatibility
  email?: string;
  phone?: string;
  address?: string;
  createdAt?: string;
}

export interface Worker {
  id: string; // WorkerID
  name: string; // WorkerName
  skills: string[]; // Skills (comma-separated tags)
  availableSlots: number[]; // AvailableSlots (array of phase numbers)
  maxLoadPerPhase: number; // MaxLoadPerPhase
  workerGroup?: string; // WorkerGroup
  qualificationLevel?: number; // QualificationLevel
  // Legacy fields for backward compatibility
  email?: string;
  availability?: string;
  maxConcurrentTasks?: number;
  hourlyRate?: number;
  preferredPhases?: number[];
  attributesJson?: string;
}

export interface Task {
  id: string; // TaskID
  name: string; // TaskName
  category?: string; // Category
  duration: number; // Duration (number of phases ≥1)
  requiredSkills: string[]; // RequiredSkills (comma-separated tags)
  preferredPhases?: number[]; // PreferredPhases (list or range syntax)
  maxConcurrent: number; // MaxConcurrent (max parallel assignments)
  // Legacy fields for backward compatibility
  clientId?: string;
  description?: string;
  priority?: number;
  dependencies?: string[];
  status?: 'pending' | 'in-progress' | 'completed' | 'cancelled';
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