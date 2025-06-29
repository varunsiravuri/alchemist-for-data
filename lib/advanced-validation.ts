import { Client, Worker, Task, ValidationError } from './types';

export class AdvancedValidationEngine {
  private errors: ValidationError[] = [];

  validateAdvanced(clients: Client[], workers: Worker[], tasks: Task[]): ValidationError[] {
    this.errors = [];

    // Core validations (12+ implemented)
    this.validateMissingColumns(clients, workers, tasks);
    this.validateDuplicateIds(clients, workers, tasks);
    this.validateMalformedLists(workers, tasks);
    this.validateOutOfRangeValues(clients, tasks);
    this.validateBrokenJSON(clients, workers, tasks);
    this.validateUnknownReferences(tasks, clients);
    this.validateCircularDependencies(tasks);
    this.validateWorkerOverload(workers, tasks);
    this.validatePhaseSlotSaturation(workers, tasks);
    this.validateSkillCoverage(workers, tasks);
    this.validateMaxConcurrencyFeasibility(workers, tasks);
    this.validateConflictingConstraints(tasks);
    this.validateRequestedTaskReferences(clients, tasks);
    this.validatePhaseConsistency(workers, tasks);
    this.validateWorkloadDistribution(workers, tasks);

    return this.errors;
  }

  private validateMissingColumns(clients: Client[], workers: Worker[], tasks: Task[]): void {
    // Check for missing required columns in clients
    clients.forEach((client, index) => {
      if (!client.id) this.addError('client', `row-${index}`, 'id', 'Missing required column: ClientID', 'error');
      if (!client.name) this.addError('client', client.id || `row-${index}`, 'name', 'Missing required column: ClientName', 'error');
      if (client.priority === undefined || client.priority === null) {
        this.addError('client', client.id || `row-${index}`, 'priority', 'Missing required column: PriorityLevel', 'error');
      }
    });

    // Check for missing required columns in workers
    workers.forEach((worker, index) => {
      if (!worker.id) this.addError('worker', `row-${index}`, 'id', 'Missing required column: WorkerID', 'error');
      if (!worker.name) this.addError('worker', worker.id || `row-${index}`, 'name', 'Missing required column: WorkerName', 'error');
      if (!worker.skills || worker.skills.length === 0) {
        this.addError('worker', worker.id || `row-${index}`, 'skills', 'Missing required column: Skills', 'error');
      }
      if (!worker.availableSlots || worker.availableSlots.length === 0) {
        this.addError('worker', worker.id || `row-${index}`, 'availableSlots', 'Missing required column: AvailableSlots', 'error');
      }
      if (worker.maxLoadPerPhase === undefined || worker.maxLoadPerPhase === null) {
        this.addError('worker', worker.id || `row-${index}`, 'maxLoadPerPhase', 'Missing required column: MaxLoadPerPhase', 'error');
      }
    });

    // Check for missing required columns in tasks
    tasks.forEach((task, index) => {
      if (!task.id) this.addError('task', `row-${index}`, 'id', 'Missing required column: TaskID', 'error');
      if (!task.name) this.addError('task', task.id || `row-${index}`, 'name', 'Missing required column: TaskName', 'error');
      if (task.duration === undefined || task.duration === null) {
        this.addError('task', task.id || `row-${index}`, 'duration', 'Missing required column: Duration', 'error');
      }
      if (task.maxConcurrent === undefined || task.maxConcurrent === null) {
        this.addError('task', task.id || `row-${index}`, 'maxConcurrent', 'Missing required column: MaxConcurrent', 'error');
      }
    });
  }

  private validateDuplicateIds(clients: Client[], workers: Worker[], tasks: Task[]): void {
    // Check duplicate client IDs
    const clientIds = new Set<string>();
    clients.forEach(client => {
      if (client.id && clientIds.has(client.id)) {
        this.addError('client', client.id, 'id', 'Duplicate ClientID found', 'error');
      }
      clientIds.add(client.id);
    });

    // Check duplicate worker IDs
    const workerIds = new Set<string>();
    workers.forEach(worker => {
      if (worker.id && workerIds.has(worker.id)) {
        this.addError('worker', worker.id, 'id', 'Duplicate WorkerID found', 'error');
      }
      workerIds.add(worker.id);
    });

    // Check duplicate task IDs
    const taskIds = new Set<string>();
    tasks.forEach(task => {
      if (task.id && taskIds.has(task.id)) {
        this.addError('task', task.id, 'id', 'Duplicate TaskID found', 'error');
      }
      taskIds.add(task.id);
    });
  }

  private validateMalformedLists(workers: Worker[], tasks: Task[]): void {
    // Validate worker arrays
    workers.forEach(worker => {
      if (worker.skills && !Array.isArray(worker.skills)) {
        this.addError('worker', worker.id, 'skills', 'Skills must be a valid array/list', 'error');
      }
      if (worker.availableSlots && !Array.isArray(worker.availableSlots)) {
        this.addError('worker', worker.id, 'availableSlots', 'AvailableSlots must be a valid array/list', 'error');
      }
      if (worker.preferredPhases && !Array.isArray(worker.preferredPhases)) {
        this.addError('worker', worker.id, 'preferredPhases', 'PreferredPhases must be a valid array/list', 'error');
      }
    });

    // Validate task arrays
    tasks.forEach(task => {
      if (task.requiredSkills && !Array.isArray(task.requiredSkills)) {
        this.addError('task', task.id, 'requiredSkills', 'RequiredSkills must be a valid array/list', 'error');
      }
      if (task.dependencies && !Array.isArray(task.dependencies)) {
        this.addError('task', task.id, 'dependencies', 'Dependencies must be a valid array/list', 'error');
      }
      if (task.preferredPhases && !Array.isArray(task.preferredPhases)) {
        this.addError('task', task.id, 'preferredPhases', 'PreferredPhases must be a valid array/list', 'error');
      }
    });
  }

  private validateOutOfRangeValues(clients: Client[], tasks: Task[]): void {
    // Validate client priority levels
    clients.forEach(client => {
      if (client.priority < 1 || client.priority > 5) {
        this.addError('client', client.id, 'priority', 'PriorityLevel must be between 1-5', 'error');
      }
    });

    // Validate task values
    tasks.forEach(task => {
      if (task.priority !== undefined && (task.priority < 1 || task.priority > 5)) {
        this.addError('task', task.id, 'priority', 'Priority level must be between 1-5', 'error');
      }
      if (task.duration < 1) {
        this.addError('task', task.id, 'duration', 'Duration must be at least 1', 'error');
      }
      if (task.maxConcurrent < 1) {
        this.addError('task', task.id, 'maxConcurrent', 'MaxConcurrent must be at least 1', 'error');
      }
      if (task.estimatedHours && task.estimatedHours < 0) {
        this.addError('task', task.id, 'estimatedHours', 'Estimated hours cannot be negative', 'error');
      }
    });
  }

  private validateBrokenJSON(clients: Client[], workers: Worker[], tasks: Task[]): void {
    // Validate JSON attributes in clients
    clients.forEach(client => {
      if (client.attributesJson) {
        try {
          JSON.parse(client.attributesJson);
        } catch (e) {
          this.addError('client', client.id, 'attributesJson', 'Invalid JSON format in AttributesJSON', 'error');
        }
      }
    });

    // Validate JSON attributes in workers
    workers.forEach(worker => {
      if (worker.attributesJson) {
        try {
          JSON.parse(worker.attributesJson);
        } catch (e) {
          this.addError('worker', worker.id, 'attributesJson', 'Invalid JSON format in AttributesJSON', 'error');
        }
      }
    });

    // Validate JSON attributes in tasks
    tasks.forEach(task => {
      if (task.attributesJson) {
        try {
          JSON.parse(task.attributesJson);
        } catch (e) {
          this.addError('task', task.id, 'attributesJson', 'Invalid JSON format in AttributesJSON', 'error');
        }
      }
    });
  }

  private validateUnknownReferences(tasks: Task[], clients: Client[]): void {
    const clientIds = new Set(clients.map(c => c.id));
    const taskIds = new Set(tasks.map(t => t.id));

    tasks.forEach(task => {
      // Validate client references (legacy)
      if (task.clientId && !clientIds.has(task.clientId)) {
        this.addError('task', task.id, 'clientId', `Referenced client '${task.clientId}' does not exist`, 'error');
      }

      // Validate task dependencies
      if (task.dependencies) {
        task.dependencies.forEach(depId => {
          if (!taskIds.has(depId)) {
            this.addError('task', task.id, 'dependencies', `Referenced task dependency '${depId}' does not exist`, 'error');
          }
        });
      }
    });
  }

  private validateRequestedTaskReferences(clients: Client[], tasks: Task[]): void {
    const taskIds = new Set(tasks.map(t => t.id));

    clients.forEach(client => {
      if (client.requestedTaskIds && client.requestedTaskIds.length > 0) {
        client.requestedTaskIds.forEach(taskId => {
          if (!taskIds.has(taskId)) {
            this.addError('client', client.id, 'requestedTaskIds', `RequestedTaskID '${taskId}' does not exist`, 'error');
          }
        });
      }
    });
  }

  private validateCircularDependencies(tasks: Task[]): void {
    const taskMap = new Map(tasks.map(t => [t.id, t]));

    tasks.forEach(task => {
      if (task.dependencies && task.dependencies.length > 0) {
        const visited = new Set<string>();
        const recursionStack = new Set<string>();

        const hasCircularDep = (taskId: string): boolean => {
          if (recursionStack.has(taskId)) return true;
          if (visited.has(taskId)) return false;

          visited.add(taskId);
          recursionStack.add(taskId);

          const currentTask = taskMap.get(taskId);
          if (currentTask?.dependencies) {
            for (const depId of currentTask.dependencies) {
              if (hasCircularDep(depId)) return true;
            }
          }

          recursionStack.delete(taskId);
          return false;
        };

        if (hasCircularDep(task.id)) {
          this.addError('task', task.id, 'dependencies', 'Circular dependency detected in task chain', 'error');
        }
      }
    });
  }

  private validateWorkerOverload(workers: Worker[], tasks: Task[]): void {
    // Check if workers have realistic capacity
    workers.forEach(worker => {
      if (worker.maxLoadPerPhase > 10) {
        this.addError('worker', worker.id, 'maxLoadPerPhase', 'MaxLoadPerPhase seems unrealistic (>10)', 'warning');
      }
      if (worker.maxLoadPerPhase < 1) {
        this.addError('worker', worker.id, 'maxLoadPerPhase', 'Worker must be able to handle at least 1 task per phase', 'error');
      }

      // Check available slots consistency
      if (worker.availableSlots && worker.availableSlots.length === 0) {
        this.addError('worker', worker.id, 'availableSlots', 'Worker must be available in at least one phase', 'error');
      }
    });

    // Check total task load vs worker capacity per phase
    const phaseCapacityMap = new Map<number, number>();
    const phaseTaskMap = new Map<number, Task[]>();

    workers.forEach(worker => {
      worker.availableSlots?.forEach(phase => {
        phaseCapacityMap.set(phase, (phaseCapacityMap.get(phase) || 0) + worker.maxLoadPerPhase);
      });
    });

    tasks.forEach(task => {
      if (task.preferredPhases) {
        task.preferredPhases.forEach(phase => {
          if (!phaseTaskMap.has(phase)) phaseTaskMap.set(phase, []);
          phaseTaskMap.get(phase)!.push(task);
        });
      }
    });

    phaseTaskMap.forEach((phaseTasks, phase) => {
      const totalTaskDuration = phaseTasks.reduce((sum, task) => sum + task.duration, 0);
      const phaseCapacity = phaseCapacityMap.get(phase) || 0;

      if (totalTaskDuration > phaseCapacity) {
        this.addError('task', 'system', 'capacity', 
          `Phase ${phase} has ${totalTaskDuration} task-days but only ${phaseCapacity} worker capacity`, 'warning');
      }
    });
  }

  private validatePhaseSlotSaturation(workers: Worker[], tasks: Task[]): void {
    // Group tasks by preferred phases
    const phaseTaskMap = new Map<number, Task[]>();
    
    tasks.forEach(task => {
      if (task.preferredPhases) {
        task.preferredPhases.forEach(phase => {
          if (!phaseTaskMap.has(phase)) {
            phaseTaskMap.set(phase, []);
          }
          phaseTaskMap.get(phase)!.push(task);
        });
      }
    });

    // Check if phase capacity is exceeded
    phaseTaskMap.forEach((phaseTasks, phase) => {
      const totalDuration = phaseTasks.reduce((sum, task) => sum + task.duration, 0);
      const availableWorkers = workers.filter(w => 
        w.availableSlots && w.availableSlots.includes(phase)
      );
      const totalWorkerSlots = availableWorkers.reduce((sum, w) => sum + w.maxLoadPerPhase, 0);

      if (totalDuration > totalWorkerSlots) {
        this.addError('task', 'system', 'phaseCapacity', 
          `Phase ${phase} has ${totalDuration} task-days but only ${totalWorkerSlots} worker slots available`, 'warning');
      }
    });
  }

  private validateSkillCoverage(workers: Worker[], tasks: Task[]): void {
    const availableSkills = new Set<string>();
    workers.forEach(worker => {
      worker.skills.forEach(skill => availableSkills.add(skill.toLowerCase()));
    });

    const requiredSkills = new Set<string>();
    tasks.forEach(task => {
      if (task.requiredSkills) {
        task.requiredSkills.forEach(skill => requiredSkills.add(skill.toLowerCase()));
      }
    });

    // Check for skills that no worker has
    requiredSkills.forEach(skill => {
      if (!availableSkills.has(skill)) {
        this.addError('task', 'system', 'skillCoverage', 
          `No worker available with required skill: ${skill}`, 'warning');
      }
    });

    // Check individual tasks for skill coverage
    tasks.forEach(task => {
      if (task.requiredSkills && task.requiredSkills.length > 0) {
        const qualifiedWorkers = workers.filter(worker => 
          task.requiredSkills!.every(skill => 
            worker.skills.some(workerSkill => 
              workerSkill.toLowerCase() === skill.toLowerCase()
            )
          )
        );

        if (qualifiedWorkers.length === 0) {
          this.addError('task', task.id, 'requiredSkills', 
            `No worker has all required skills: ${task.requiredSkills.join(', ')}`, 'error');
        }
      }
    });
  }

  private validateMaxConcurrencyFeasibility(workers: Worker[], tasks: Task[]): void {
    // Check if MaxConcurrent values are feasible
    tasks.forEach(task => {
      if (task.requiredSkills && task.requiredSkills.length > 0) {
        const qualifiedWorkers = workers.filter(worker => 
          task.requiredSkills!.every(skill => 
            worker.skills.some(workerSkill => 
              workerSkill.toLowerCase() === skill.toLowerCase()
            )
          )
        );

        if (task.maxConcurrent > qualifiedWorkers.length) {
          this.addError('task', task.id, 'maxConcurrent', 
            `MaxConcurrent (${task.maxConcurrent}) exceeds number of qualified workers (${qualifiedWorkers.length})`, 'warning');
        }
      }
    });
  }

  private validateConflictingConstraints(tasks: Task[]): void {
    // Check for tasks with conflicting phase windows and dependencies
    tasks.forEach(task => {
      if (task.dependencies && task.dependencies.length > 0 && task.preferredPhases) {
        // Find dependency tasks and their preferred phases
        const depTasks = tasks.filter(t => task.dependencies!.includes(t.id));
        
        depTasks.forEach(depTask => {
          if (depTask.preferredPhases) {
            const maxDepPhase = Math.max(...depTask.preferredPhases);
            const minTaskPhase = Math.min(...task.preferredPhases!);
            
            if (minTaskPhase <= maxDepPhase) {
              this.addError('task', task.id, 'preferredPhases', 
                `Task preferred phases conflict with dependency '${depTask.id}' phases`, 'warning');
            }
          }
        });
      }

      // Check for unrealistic duration vs estimated hours
      if (task.duration && task.estimatedHours) {
        const hoursPerDay = task.estimatedHours / task.duration;
        if (hoursPerDay > 24) {
          this.addError('task', task.id, 'estimatedHours', 
            `Estimated hours (${task.estimatedHours}) exceed realistic daily capacity for duration (${task.duration} days)`, 'warning');
        }
      }
    });
  }

  private validatePhaseConsistency(workers: Worker[], tasks: Task[]): void {
    // Check if all referenced phases are covered by workers
    const workerPhases = new Set<number>();
    workers.forEach(worker => {
      if (worker.availableSlots) {
        worker.availableSlots.forEach(phase => workerPhases.add(phase));
      }
    });

    const taskPhases = new Set<number>();
    tasks.forEach(task => {
      if (task.preferredPhases) {
        task.preferredPhases.forEach(phase => taskPhases.add(phase));
      }
    });

    taskPhases.forEach(phase => {
      if (!workerPhases.has(phase)) {
        this.addError('task', 'system', 'phaseConsistency', 
          `Phase ${phase} is required by tasks but no workers are available in this phase`, 'warning');
      }
    });
  }

  private validateWorkloadDistribution(workers: Worker[], tasks: Task[]): void {
    // Check for potential workload imbalances
    const workerWorkloads = workers.map(worker => {
      const applicableTasks = tasks.filter(task => 
        !task.requiredSkills || task.requiredSkills.some(skill => 
          worker.skills.some(workerSkill => 
            workerSkill.toLowerCase() === skill.toLowerCase()
          )
        )
      );
      
      return {
        worker,
        potentialWorkload: applicableTasks.reduce((sum, task) => sum + task.duration, 0),
        capacity: worker.maxLoadPerPhase * (worker.availableSlots?.length || 1)
      };
    });

    const avgWorkload = workerWorkloads.reduce((sum, w) => sum + w.potentialWorkload, 0) / workerWorkloads.length;
    
    workerWorkloads.forEach(({ worker, potentialWorkload }) => {
      if (potentialWorkload > avgWorkload * 2) {
        this.addError('worker', worker.id, 'workload', 
          `Worker has significantly higher potential workload (${potentialWorkload}) than average (${Math.round(avgWorkload)})`, 'info');
      }
    });
  }

  private addError(entityType: 'client' | 'worker' | 'task', entityId: string, field: string, message: string, severity: 'error' | 'warning' | 'info'): void {
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
}

export const advancedValidationEngine = new AdvancedValidationEngine();