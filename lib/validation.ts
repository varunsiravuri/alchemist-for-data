import { Client, Worker, Task, ValidationError } from './types';

export class ValidationEngine {
  private errors: ValidationError[] = [];

  validateClients(clients: Client[]): ValidationError[] {
    this.errors = [];
    const ids = new Set<string>();

    clients.forEach((client, index) => {
      // Check for missing ClientID
      if (!client.id || client.id.trim() === '') {
        this.addError('client', `row-${index}`, 'id', 'ClientID is required', 'error');
      }

      // Check for duplicate ClientIDs
      if (client.id && ids.has(client.id)) {
        this.addError('client', client.id, 'id', 'Duplicate ClientID found', 'error');
      }
      ids.add(client.id);

      // Check for missing ClientName
      if (!client.name || client.name.trim() === '') {
        this.addError('client', client.id, 'name', 'ClientName is required', 'error');
      }

      // Validate PriorityLevel (1-5)
      if (client.priority < 1 || client.priority > 5) {
        this.addError('client', client.id, 'priority', 'PriorityLevel must be between 1 and 5', 'error');
      }

      // Validate RequestedTaskIDs format
      if (client.requestedTaskIds && !Array.isArray(client.requestedTaskIds)) {
        this.addError('client', client.id, 'requestedTaskIds', 'RequestedTaskIDs must be a valid array', 'error');
      }

      // Validate AttributesJSON
      if (client.attributesJson) {
        try {
          JSON.parse(client.attributesJson);
        } catch (e) {
          this.addError('client', client.id, 'attributesJson', 'Invalid JSON format in AttributesJSON', 'error');
        }
      }

      // Validate email format (if provided)
      if (client.email && !this.isValidEmail(client.email)) {
        this.addError('client', client.id, 'email', 'Invalid email format', 'warning');
      }
    });

    return this.errors;
  }

  validateWorkers(workers: Worker[]): ValidationError[] {
    this.errors = [];
    const ids = new Set<string>();

    workers.forEach((worker, index) => {
      // Check for missing WorkerID
      if (!worker.id || worker.id.trim() === '') {
        this.addError('worker', `row-${index}`, 'id', 'WorkerID is required', 'error');
      }

      // Check for duplicate WorkerIDs
      if (worker.id && ids.has(worker.id)) {
        this.addError('worker', worker.id, 'id', 'Duplicate WorkerID found', 'error');
      }
      ids.add(worker.id);

      // Check for missing WorkerName
      if (!worker.name || worker.name.trim() === '') {
        this.addError('worker', worker.id, 'name', 'WorkerName is required', 'error');
      }

      // Validate Skills
      if (!worker.skills || worker.skills.length === 0) {
        this.addError('worker', worker.id, 'skills', 'At least one skill is required', 'warning');
      }

      // Validate AvailableSlots
      if (!worker.availableSlots || worker.availableSlots.length === 0) {
        this.addError('worker', worker.id, 'availableSlots', 'AvailableSlots must contain at least one phase number', 'error');
      } else {
        // Check for valid phase numbers
        const invalidSlots = worker.availableSlots.filter(slot => slot < 1 || !Number.isInteger(slot));
        if (invalidSlots.length > 0) {
          this.addError('worker', worker.id, 'availableSlots', 'AvailableSlots must contain valid phase numbers (≥1)', 'error');
        }
      }

      // Validate MaxLoadPerPhase
      if (worker.maxLoadPerPhase < 1) {
        this.addError('worker', worker.id, 'maxLoadPerPhase', 'MaxLoadPerPhase must be at least 1', 'error');
      }

      // Validate QualificationLevel (if provided)
      if (worker.qualificationLevel !== undefined && worker.qualificationLevel < 0) {
        this.addError('worker', worker.id, 'qualificationLevel', 'QualificationLevel cannot be negative', 'warning');
      }

      // Validate email format (if provided)
      if (worker.email && !this.isValidEmail(worker.email)) {
        this.addError('worker', worker.id, 'email', 'Invalid email format', 'warning');
      }
    });

    return this.errors;
  }

  validateTasks(tasks: Task[], clients: Client[], workers: Worker[]): ValidationError[] {
    this.errors = [];
    const ids = new Set<string>();
    const clientIds = new Set(clients.map(c => c.id));
    const workerSkills = new Set(workers.flatMap(w => w.skills));
    const taskIds = new Set(tasks.map(t => t.id));

    tasks.forEach((task, index) => {
      // Check for missing TaskID
      if (!task.id || task.id.trim() === '') {
        this.addError('task', `row-${index}`, 'id', 'TaskID is required', 'error');
      }

      // Check for duplicate TaskIDs
      if (task.id && ids.has(task.id)) {
        this.addError('task', task.id, 'id', 'Duplicate TaskID found', 'error');
      }
      ids.add(task.id);

      // Check for missing TaskName
      if (!task.name || task.name.trim() === '') {
        this.addError('task', task.id, 'name', 'TaskName is required', 'error');
      }

      // Validate Duration (≥1)
      if (task.duration < 1) {
        this.addError('task', task.id, 'duration', 'Duration must be at least 1 phase', 'error');
      }

      // Validate RequiredSkills
      if (!task.requiredSkills || !Array.isArray(task.requiredSkills)) {
        this.addError('task', task.id, 'requiredSkills', 'RequiredSkills must be a valid array', 'error');
      }

      // Validate MaxConcurrent
      if (task.maxConcurrent < 1) {
        this.addError('task', task.id, 'maxConcurrent', 'MaxConcurrent must be at least 1', 'error');
      }

      // Check skill availability
      if (task.requiredSkills && task.requiredSkills.length > 0) {
        const missingSkills = task.requiredSkills.filter(skill => !workerSkills.has(skill));
        if (missingSkills.length > 0) {
          this.addError('task', task.id, 'requiredSkills', 
            `No workers available with skills: ${missingSkills.join(', ')}`, 'warning');
        }
      }

      // Validate PreferredPhases (if provided)
      if (task.preferredPhases) {
        const invalidPhases = task.preferredPhases.filter(phase => phase < 1 || !Number.isInteger(phase));
        if (invalidPhases.length > 0) {
          this.addError('task', task.id, 'preferredPhases', 'PreferredPhases must contain valid phase numbers (≥1)', 'error');
        }
      }

      // Validate legacy fields if present
      if (task.clientId && !clientIds.has(task.clientId)) {
        this.addError('task', task.id, 'clientId', 'Referenced client does not exist', 'error');
      }

      if (task.priority !== undefined && (task.priority < 1 || task.priority > 5)) {
        this.addError('task', task.id, 'priority', 'Priority must be between 1 and 5', 'error');
      }

      // Validate dependencies
      if (task.dependencies && task.dependencies.length > 0) {
        const invalidDeps = task.dependencies.filter(depId => !taskIds.has(depId));
        if (invalidDeps.length > 0) {
          this.addError('task', task.id, 'dependencies', 
            `Invalid task dependencies: ${invalidDeps.join(', ')}`, 'error');
        }

        // Check for circular dependencies
        if (task.dependencies.includes(task.id)) {
          this.addError('task', task.id, 'dependencies', 'Task cannot depend on itself', 'error');
        }
      }

      // Validate AttributesJSON (if provided)
      if (task.attributesJson) {
        try {
          JSON.parse(task.attributesJson);
        } catch (e) {
          this.addError('task', task.id, 'attributesJson', 'Invalid JSON format in AttributesJSON', 'error');
        }
      }
    });

    // Cross-validate RequestedTaskIDs in clients
    clients.forEach(client => {
      if (client.requestedTaskIds && client.requestedTaskIds.length > 0) {
        const invalidTaskIds = client.requestedTaskIds.filter(taskId => !taskIds.has(taskId));
        if (invalidTaskIds.length > 0) {
          this.addError('client', client.id, 'requestedTaskIds', 
            `RequestedTaskIDs reference non-existent tasks: ${invalidTaskIds.join(', ')}`, 'error');
        }
      }
    });

    return this.errors;
  }

  private addError(entityType: 'client' | 'worker' | 'task', entityId: string, field: string, message: string, severity: 'error' | 'warning' | 'info') {
    this.errors.push({
      id: `${entityType}-${entityId}-${field}-${Date.now()}-${Math.random()}`,
      entityType,
      entityId,
      field,
      message,
      severity,
      timestamp: new Date()
    });
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

export const validationEngine = new ValidationEngine();