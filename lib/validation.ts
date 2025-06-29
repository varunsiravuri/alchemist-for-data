import { Client, Worker, Task, ValidationError } from './types';

export class ValidationEngine {
  private errors: ValidationError[] = [];

  validateClients(clients: Client[]): ValidationError[] {
    this.errors = [];
    const ids = new Set<string>();

    clients.forEach((client, index) => {
      // Check for missing ID
      if (!client.id || client.id.trim() === '') {
        this.addError('client', `row-${index}`, 'id', 'Client ID is required', 'error');
      }

      // Check for duplicate IDs
      if (client.id && ids.has(client.id)) {
        this.addError('client', client.id, 'id', 'Duplicate client ID found', 'error');
      }
      ids.add(client.id);

      // Check for missing name
      if (!client.name || client.name.trim() === '') {
        this.addError('client', client.id, 'name', 'Client name is required', 'error');
      }

      // Validate priority
      if (client.priority < 1 || client.priority > 5) {
        this.addError('client', client.id, 'priority', 'Priority must be between 1 and 5', 'error');
      }

      // Validate JSON attributes
      if (client.attributesJson) {
        try {
          JSON.parse(client.attributesJson);
        } catch (e) {
          this.addError('client', client.id, 'attributesJson', 'Invalid JSON format', 'error');
        }
      }

      // Validate email format
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
      // Check for missing ID
      if (!worker.id || worker.id.trim() === '') {
        this.addError('worker', `row-${index}`, 'id', 'Worker ID is required', 'error');
      }

      // Check for duplicate IDs
      if (worker.id && ids.has(worker.id)) {
        this.addError('worker', worker.id, 'id', 'Duplicate worker ID found', 'error');
      }
      ids.add(worker.id);

      // Check for missing name
      if (!worker.name || worker.name.trim() === '') {
        this.addError('worker', worker.id, 'name', 'Worker name is required', 'error');
      }

      // Validate skills
      if (!worker.skills || worker.skills.length === 0) {
        this.addError('worker', worker.id, 'skills', 'At least one skill is required', 'warning');
      }

      // Validate max concurrent tasks
      if (worker.maxConcurrentTasks < 1) {
        this.addError('worker', worker.id, 'maxConcurrentTasks', 'Max concurrent tasks must be at least 1', 'error');
      }

      // Validate JSON attributes
      if (worker.attributesJson) {
        try {
          JSON.parse(worker.attributesJson);
        } catch (e) {
          this.addError('worker', worker.id, 'attributesJson', 'Invalid JSON format', 'error');
        }
      }

      // Validate email format
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

    tasks.forEach((task, index) => {
      // Check for missing ID
      if (!task.id || task.id.trim() === '') {
        this.addError('task', `row-${index}`, 'id', 'Task ID is required', 'error');
      }

      // Check for duplicate IDs
      if (task.id && ids.has(task.id)) {
        this.addError('task', task.id, 'id', 'Duplicate task ID found', 'error');
      }
      ids.add(task.id);

      // Check for missing name
      if (!task.name || task.name.trim() === '') {
        this.addError('task', task.id, 'name', 'Task name is required', 'error');
      }

      // Validate client reference
      if (!clientIds.has(task.clientId)) {
        this.addError('task', task.id, 'clientId', 'Referenced client does not exist', 'error');
      }

      // Validate priority
      if (task.priority < 1 || task.priority > 5) {
        this.addError('task', task.id, 'priority', 'Priority must be between 1 and 5', 'error');
      }

      // Validate duration
      if (task.duration < 1) {
        this.addError('task', task.id, 'duration', 'Duration must be at least 1', 'error');
      }

      // Check skill availability
      if (task.requiredSkills && task.requiredSkills.length > 0) {
        const missingSkills = task.requiredSkills.filter(skill => !workerSkills.has(skill));
        if (missingSkills.length > 0) {
          this.addError('task', task.id, 'requiredSkills', 
            `No workers available with skills: ${missingSkills.join(', ')}`, 'warning');
        }
      }

      // Validate dependencies
      if (task.dependencies && task.dependencies.length > 0) {
        const invalidDeps = task.dependencies.filter(depId => !ids.has(depId) && depId !== task.id);
        if (invalidDeps.length > 0) {
          this.addError('task', task.id, 'dependencies', 
            `Invalid task dependencies: ${invalidDeps.join(', ')}`, 'error');
        }

        // Check for circular dependencies
        if (task.dependencies.includes(task.id)) {
          this.addError('task', task.id, 'dependencies', 'Task cannot depend on itself', 'error');
        }
      }

      // Validate JSON attributes
      if (task.attributesJson) {
        try {
          JSON.parse(task.attributesJson);
        } catch (e) {
          this.addError('task', task.id, 'attributesJson', 'Invalid JSON format', 'error');
        }
      }
    });

    return this.errors;
  }

  private addError(entityType: 'client' | 'worker' | 'task', entityId: string, field: string, message: string, severity: 'error' | 'warning' | 'info') {
    this.errors.push({
      id: `${entityType}-${entityId}-${field}-${Date.now()}`,
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