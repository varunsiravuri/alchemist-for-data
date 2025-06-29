import { create } from 'zustand';
import { DataState, Client, Worker, Task, ValidationError, BusinessRule, PrioritizationWeights } from './types';

interface DataStore extends DataState {
  // Actions
  setClients: (clients: Client[]) => void;
  setWorkers: (workers: Worker[]) => void;
  setTasks: (tasks: Task[]) => void;
  updateClient: (id: string, updates: Partial<Client>) => void;
  updateWorker: (id: string, updates: Partial<Worker>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  setValidationErrors: (errors: ValidationError[]) => void;
  addValidationError: (error: ValidationError) => void;
  removeValidationError: (id: string) => void;
  setBusinessRules: (rules: BusinessRule[]) => void;
  addBusinessRule: (rule: BusinessRule) => void;
  updateBusinessRule: (id: string, updates: Partial<BusinessRule>) => void;
  removeBusinessRule: (id: string) => void;
  setPrioritizationWeights: (weights: PrioritizationWeights) => void;
  setLoading: (loading: boolean) => void;
  setUploadProgress: (progress: number) => void;
  resetData: () => void;
}

const initialState: DataState = {
  clients: [],
  workers: [],
  tasks: [],
  validationErrors: [],
  businessRules: [],
  prioritizationWeights: {
    priorityLevel: 30,
    fulfillment: 25,
    fairness: 20,
    efficiency: 15,
    skillMatch: 10,
  },
  isLoading: false,
  uploadProgress: 0,
};

export const useDataStore = create<DataStore>((set, get) => ({
  ...initialState,
  
  setClients: (clients) => set({ clients }),
  setWorkers: (workers) => set({ workers }),
  setTasks: (tasks) => set({ tasks }),
  
  updateClient: (id, updates) => {
    const clients = get().clients.map(client => 
      client.id === id ? { ...client, ...updates } : client
    );
    set({ clients });
  },
  
  updateWorker: (id, updates) => {
    const workers = get().workers.map(worker => 
      worker.id === id ? { ...worker, ...updates } : worker
    );
    set({ workers });
  },
  
  updateTask: (id, updates) => {
    const tasks = get().tasks.map(task => 
      task.id === id ? { ...task, ...updates } : task
    );
    set({ tasks });
  },
  
  setValidationErrors: (validationErrors) => set({ validationErrors }),
  
  addValidationError: (error) => {
    const validationErrors = [...get().validationErrors, error];
    set({ validationErrors });
  },
  
  removeValidationError: (id) => {
    const validationErrors = get().validationErrors.filter(error => error.id !== id);
    set({ validationErrors });
  },
  
  setBusinessRules: (businessRules) => set({ businessRules }),
  
  addBusinessRule: (rule) => {
    const businessRules = [...get().businessRules, rule];
    set({ businessRules });
  },
  
  updateBusinessRule: (id, updates) => {
    const businessRules = get().businessRules.map(rule => 
      rule.id === id ? { ...rule, ...updates } : rule
    );
    set({ businessRules });
  },
  
  removeBusinessRule: (id) => {
    const businessRules = get().businessRules.filter(rule => rule.id !== id);
    set({ businessRules });
  },
  
  setPrioritizationWeights: (prioritizationWeights) => set({ prioritizationWeights }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setUploadProgress: (uploadProgress) => set({ uploadProgress }),
  
  resetData: () => set(initialState),
}));