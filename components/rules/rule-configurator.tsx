'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  X, 
  Plus, 
  Users, 
  Clock, 
  MapPin, 
  Zap,
  Settings
} from 'lucide-react';
import { BusinessRule } from '@/lib/types';
import { useDataStore } from '@/lib/store';

interface RuleConfiguratorProps {
  rule: Partial<BusinessRule>;
  onRuleChange: (rule: Partial<BusinessRule>) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function RuleConfigurator({ rule, onRuleChange, onSave, onCancel }: RuleConfiguratorProps) {
  const { clients, workers, tasks } = useDataStore();
  const [selectedTasks, setSelectedTasks] = useState<string[]>(rule.conditions?.tasks || []);
  const [selectedWorkers, setSelectedWorkers] = useState<string[]>(rule.conditions?.workers || []);
  const [selectedClients, setSelectedClients] = useState<string[]>(rule.conditions?.clients || []);

  const handleConditionChange = (key: string, value: any) => {
    const newConditions = { ...rule.conditions, [key]: value };
    onRuleChange({ ...rule, conditions: newConditions });
  };

  const handleActionChange = (key: string, value: any) => {
    const newActions = { ...rule.actions, [key]: value };
    onRuleChange({ ...rule, actions: newActions });
  };

  const addTask = (taskId: string) => {
    if (!selectedTasks.includes(taskId)) {
      const newTasks = [...selectedTasks, taskId];
      setSelectedTasks(newTasks);
      handleConditionChange('tasks', newTasks);
    }
  };

  const removeTask = (taskId: string) => {
    const newTasks = selectedTasks.filter(id => id !== taskId);
    setSelectedTasks(newTasks);
    handleConditionChange('tasks', newTasks);
  };

  const addWorker = (workerId: string) => {
    if (!selectedWorkers.includes(workerId)) {
      const newWorkers = [...selectedWorkers, workerId];
      setSelectedWorkers(newWorkers);
      handleConditionChange('workers', newWorkers);
    }
  };

  const removeWorker = (workerId: string) => {
    const newWorkers = selectedWorkers.filter(id => id !== workerId);
    setSelectedWorkers(newWorkers);
    handleConditionChange('workers', newWorkers);
  };

  const renderCoLocationConfig = () => (
    <div className="space-y-4">
      <div>
        <Label>Tasks that must run together</Label>
        <div className="mt-2 space-y-2">
          <Select onValueChange={addTask}>
            <SelectTrigger>
              <SelectValue placeholder="Select tasks to group together" />
            </SelectTrigger>
            <SelectContent>
              {tasks.map(task => (
                <SelectItem key={task.id} value={task.id} disabled={selectedTasks.includes(task.id)}>
                  {task.name} ({task.id})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="flex flex-wrap gap-2">
            {selectedTasks.map(taskId => {
              const task = tasks.find(t => t.id === taskId);
              return (
                <Badge key={taskId} variant="secondary" className="flex items-center gap-1">
                  {task?.name || taskId}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeTask(taskId)} />
                </Badge>
              );
            })}
          </div>
        </div>
      </div>
      
      <div>
        <Label htmlFor="location">Required Location</Label>
        <Input
          id="location"
          placeholder="e.g., Same office, Remote, On-site"
          value={rule.conditions?.location || ''}
          onChange={(e) => handleConditionChange('location', e.target.value)}
        />
      </div>
    </div>
  );

  const renderSlotRestrictionConfig = () => (
    <div className="space-y-4">
      <div>
        <Label>Client or Worker Group</Label>
        <Select onValueChange={(value) => handleConditionChange('groupType', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select group type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="clients">Client Group</SelectItem>
            <SelectItem value="workers">Worker Group</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {rule.conditions?.groupType === 'workers' && (
        <div>
          <Label>Select Workers</Label>
          <Select onValueChange={addWorker}>
            <SelectTrigger>
              <SelectValue placeholder="Add workers to group" />
            </SelectTrigger>
            <SelectContent>
              {workers.map(worker => (
                <SelectItem key={worker.id} value={worker.id} disabled={selectedWorkers.includes(worker.id)}>
                  {worker.name} ({worker.id})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedWorkers.map(workerId => {
              const worker = workers.find(w => w.id === workerId);
              return (
                <Badge key={workerId} variant="secondary" className="flex items-center gap-1">
                  {worker?.name || workerId}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeWorker(workerId)} />
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <Label htmlFor="minCommonSlots">Minimum Common Slots</Label>
        <Input
          id="minCommonSlots"
          type="number"
          min="1"
          value={rule.conditions?.minCommonSlots || ''}
          onChange={(e) => handleConditionChange('minCommonSlots', parseInt(e.target.value))}
        />
      </div>

      <div>
        <Label htmlFor="timeWindow">Time Window</Label>
        <Input
          id="timeWindow"
          placeholder="e.g., 9AM-5PM, Weekdays only"
          value={rule.conditions?.timeWindow || ''}
          onChange={(e) => handleConditionChange('timeWindow', e.target.value)}
        />
      </div>
    </div>
  );

  const renderLoadLimitConfig = () => (
    <div className="space-y-4">
      <div>
        <Label>Select Workers for Load Limit</Label>
        <Select onValueChange={addWorker}>
          <SelectTrigger>
            <SelectValue placeholder="Add workers to load limit group" />
          </SelectTrigger>
          <SelectContent>
            {workers.map(worker => (
              <SelectItem key={worker.id} value={worker.id} disabled={selectedWorkers.includes(worker.id)}>
                {worker.name} ({worker.id})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedWorkers.map(workerId => {
            const worker = workers.find(w => w.id === workerId);
            return (
              <Badge key={workerId} variant="secondary" className="flex items-center gap-1">
                {worker?.name || workerId}
                <X className="h-3 w-3 cursor-pointer" onClick={() => removeWorker(workerId)} />
              </Badge>
            );
          })}
        </div>
      </div>

      <div>
        <Label htmlFor="maxSlotsPerPhase">Max Slots Per Phase</Label>
        <Input
          id="maxSlotsPerPhase"
          type="number"
          min="1"
          value={rule.conditions?.maxSlotsPerPhase || ''}
          onChange={(e) => handleConditionChange('maxSlotsPerPhase', parseInt(e.target.value))}
        />
      </div>

      <div>
        <Label htmlFor="phases">Applicable Phases</Label>
        <Input
          id="phases"
          placeholder="e.g., 1,2,3 or leave empty for all phases"
          value={rule.conditions?.phases || ''}
          onChange={(e) => handleConditionChange('phases', e.target.value)}
        />
      </div>
    </div>
  );

  const renderPhaseWindowConfig = () => (
    <div className="space-y-4">
      <div>
        <Label>Select Task</Label>
        <Select onValueChange={(value) => handleConditionChange('taskId', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select task for phase window" />
          </SelectTrigger>
          <SelectContent>
            {tasks.map(task => (
              <SelectItem key={task.id} value={task.id}>
                {task.name} ({task.id})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="allowedPhases">Allowed Phases</Label>
        <Input
          id="allowedPhases"
          placeholder="e.g., 1,2,3"
          value={rule.conditions?.allowedPhases || ''}
          onChange={(e) => handleConditionChange('allowedPhases', e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="phaseRange">Phase Range</Label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            placeholder="Start phase"
            type="number"
            min="1"
            value={rule.conditions?.startPhase || ''}
            onChange={(e) => handleConditionChange('startPhase', parseInt(e.target.value))}
          />
          <Input
            placeholder="End phase"
            type="number"
            min="1"
            value={rule.conditions?.endPhase || ''}
            onChange={(e) => handleConditionChange('endPhase', parseInt(e.target.value))}
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="strict"
          checked={rule.conditions?.strict || false}
          onCheckedChange={(checked) => handleConditionChange('strict', checked)}
        />
        <Label htmlFor="strict">Strict enforcement (no exceptions)</Label>
      </div>
    </div>
  );

  const renderCustomConfig = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="pattern">Pattern/Regex</Label>
        <Input
          id="pattern"
          placeholder="Enter regex pattern or custom logic"
          value={rule.conditions?.pattern || ''}
          onChange={(e) => handleConditionChange('pattern', e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="customConditions">Custom Conditions (JSON)</Label>
        <Textarea
          id="customConditions"
          placeholder='{"field": "value", "operator": "equals"}'
          value={JSON.stringify(rule.conditions || {}, null, 2)}
          onChange={(e) => {
            try {
              const parsed = JSON.parse(e.target.value);
              onRuleChange({ ...rule, conditions: parsed });
            } catch (error) {
              // Invalid JSON, don't update
            }
          }}
          rows={4}
        />
      </div>

      <div>
        <Label htmlFor="customActions">Custom Actions (JSON)</Label>
        <Textarea
          id="customActions"
          placeholder='{"action": "assign", "target": "worker-1"}'
          value={JSON.stringify(rule.actions || {}, null, 2)}
          onChange={(e) => {
            try {
              const parsed = JSON.parse(e.target.value);
              onRuleChange({ ...rule, actions: parsed });
            } catch (error) {
              // Invalid JSON, don't update
            }
          }}
          rows={4}
        />
      </div>
    </div>
  );

  const renderRuleConfig = () => {
    switch (rule.type) {
      case 'co-location':
        return renderCoLocationConfig();
      case 'slot-restriction':
        return renderSlotRestrictionConfig();
      case 'load-limit':
        return renderLoadLimitConfig();
      case 'phase-window':
        return renderPhaseWindowConfig();
      case 'custom':
        return renderCustomConfig();
      default:
        return <div className="text-gray-500">Select a rule type to configure</div>;
    }
  };

  const getRuleIcon = () => {
    switch (rule.type) {
      case 'co-location': return MapPin;
      case 'slot-restriction': return Clock;
      case 'load-limit': return Users;
      case 'phase-window': return Zap;
      case 'custom': return Settings;
      default: return Settings;
    }
  };

  const RuleIcon = getRuleIcon();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RuleIcon className="h-5 w-5" />
          Configure Rule: {rule.name || 'New Rule'}
        </CardTitle>
        <CardDescription>
          Define the specific conditions and actions for this business rule
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {renderRuleConfig()}
        
        <div className="flex gap-2 pt-4 border-t">
          <Button onClick={onSave} className="gap-2">
            <Plus className="h-4 w-4" />
            Save Rule
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}