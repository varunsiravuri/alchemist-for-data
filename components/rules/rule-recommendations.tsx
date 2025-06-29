'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Lightbulb, 
  CheckCircle, 
  X, 
  RefreshCw,
  TrendingUp,
  Users,
  Clock,
  Zap
} from 'lucide-react';
import { useDataStore } from '@/lib/store';
import { BusinessRule } from '@/lib/types';
import { toast } from 'sonner';

interface RuleRecommendation {
  id: string;
  type: 'co-location' | 'load-limit' | 'skill-match' | 'phase-optimization';
  title: string;
  description: string;
  confidence: number;
  data: any;
  suggestedRule: Partial<BusinessRule>;
}

export function RuleRecommendations() {
  const { clients, workers, tasks, addBusinessRule } = useDataStore();
  const [recommendations, setRecommendations] = useState<RuleRecommendation[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const analyzeDataForRecommendations = () => {
    setIsAnalyzing(true);
    
    setTimeout(() => {
      const newRecommendations: RuleRecommendation[] = [];

      // Analyze for co-location patterns
      const tasksByClient = tasks.reduce((acc, task) => {
        if (!acc[task.clientId]) acc[task.clientId] = [];
        acc[task.clientId].push(task);
        return acc;
      }, {} as Record<string, typeof tasks>);

      Object.entries(tasksByClient).forEach(([clientId, clientTasks]) => {
        if (clientTasks.length >= 2) {
          const client = clients.find(c => c.id === clientId);
          if (client && client.priority >= 4) {
            newRecommendations.push({
              id: `co-location-${clientId}`,
              type: 'co-location',
              title: `Co-locate tasks for high-priority client ${client.name}`,
              description: `Client ${client.name} has ${clientTasks.length} tasks with priority ${client.priority}. Consider grouping these tasks to run together for better coordination.`,
              confidence: 0.8,
              data: { clientId, tasks: clientTasks.map(t => t.id) },
              suggestedRule: {
                name: `Co-location for ${client.name}`,
                description: `Group tasks for high-priority client ${client.name}`,
                type: 'co-location',
                conditions: { tasks: clientTasks.map(t => t.id), location: 'same-team' },
                actions: { enforce: true }
              }
            });
          }
        }
      });

      // Analyze for worker overload
      const workerTaskCounts = workers.map(worker => {
        const assignedTasks = tasks.filter(task => 
          task.requiredSkills.some(skill => worker.skills.includes(skill)) &&
          (task.status === 'pending' || task.status === 'in-progress')
        );
        return { worker, taskCount: assignedTasks.length, tasks: assignedTasks };
      });

      const overloadedWorkers = workerTaskCounts.filter(wt => 
        wt.taskCount > wt.worker.maxConcurrentTasks
      );

      overloadedWorkers.forEach(({ worker, taskCount }) => {
        newRecommendations.push({
          id: `load-limit-${worker.id}`,
          type: 'load-limit',
          title: `Set load limit for overloaded worker ${worker.name}`,
          description: `${worker.name} has ${taskCount} potential tasks but can only handle ${worker.maxConcurrentTasks} concurrent tasks. Consider setting a load limit rule.`,
          confidence: 0.9,
          data: { workerId: worker.id, currentLoad: taskCount, maxCapacity: worker.maxConcurrentTasks },
          suggestedRule: {
            name: `Load limit for ${worker.name}`,
            description: `Prevent overloading of ${worker.name}`,
            type: 'load-limit',
            conditions: { workers: [worker.id], maxSlotsPerPhase: worker.maxConcurrentTasks },
            actions: { enforce: true, redistributeOverflow: true }
          }
        });
      });

      // Analyze for skill gaps
      const requiredSkills = new Set(tasks.flatMap(t => t.requiredSkills));
      const availableSkills = new Set(workers.flatMap(w => w.skills));
      
      const missingSkills = Array.from(requiredSkills).filter(skill => !availableSkills.has(skill));
      
      if (missingSkills.length > 0) {
        newRecommendations.push({
          id: 'skill-gap-analysis',
          type: 'skill-match',
          title: 'Skill coverage gaps detected',
          description: `${missingSkills.length} required skills have no qualified workers: ${missingSkills.slice(0, 3).join(', ')}${missingSkills.length > 3 ? '...' : ''}`,
          confidence: 0.95,
          data: { missingSkills },
          suggestedRule: {
            name: 'Skill coverage validation',
            description: 'Ensure all required skills have qualified workers',
            type: 'custom',
            conditions: { requiredSkills: missingSkills },
            actions: { alert: true, suggestTraining: true }
          }
        });
      }

      // Analyze for phase optimization
      const phaseTaskMap = new Map<number, typeof tasks>();
      tasks.forEach(task => {
        if (task.preferredPhases) {
          task.preferredPhases.forEach(phase => {
            if (!phaseTaskMap.has(phase)) phaseTaskMap.set(phase, []);
            phaseTaskMap.get(phase)!.push(task);
          });
        }
      });

      phaseTaskMap.forEach((phaseTasks, phase) => {
        const totalDuration = phaseTasks.reduce((sum, task) => sum + task.duration, 0);
        const availableWorkerSlots = workers.filter(w => 
          !w.preferredPhases || w.preferredPhases.includes(phase)
        ).reduce((sum, w) => sum + w.maxConcurrentTasks, 0);

        if (totalDuration > availableWorkerSlots * 1.2) {
          newRecommendations.push({
            id: `phase-optimization-${phase}`,
            type: 'phase-optimization',
            title: `Phase ${phase} capacity optimization needed`,
            description: `Phase ${phase} has ${totalDuration} task-days but only ${availableWorkerSlots} worker slots. Consider redistributing tasks or extending the phase window.`,
            confidence: 0.85,
            data: { phase, totalDuration, availableSlots: availableWorkerSlots },
            suggestedRule: {
              name: `Phase ${phase} capacity management`,
              description: `Manage capacity constraints for phase ${phase}`,
              type: 'phase-window',
              conditions: { phase, maxCapacity: availableWorkerSlots },
              actions: { redistribute: true, extendWindow: true }
            }
          });
        }
      });

      setRecommendations(newRecommendations);
      setIsAnalyzing(false);
      toast.success(`Found ${newRecommendations.length} rule recommendations`);
    }, 2000);
  };

  const acceptRecommendation = (recommendation: RuleRecommendation) => {
    const rule: BusinessRule = {
      id: `rec-${Date.now()}`,
      name: recommendation.suggestedRule.name || recommendation.title,
      description: recommendation.suggestedRule.description || recommendation.description,
      type: recommendation.suggestedRule.type || 'custom',
      conditions: recommendation.suggestedRule.conditions || {},
      actions: recommendation.suggestedRule.actions || {},
      active: true,
      createdAt: new Date()
    };

    addBusinessRule(rule);
    dismissRecommendation(recommendation.id);
    toast.success('Rule recommendation accepted and added');
  };

  const dismissRecommendation = (id: string) => {
    setDismissedIds(prev => new Set([...prev, id]));
  };

  const getRecommendationIcon = (type: RuleRecommendation['type']) => {
    switch (type) {
      case 'co-location': return Users;
      case 'load-limit': return TrendingUp;
      case 'skill-match': return Zap;
      case 'phase-optimization': return Clock;
      default: return Lightbulb;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600';
    if (confidence >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const visibleRecommendations = recommendations.filter(rec => !dismissedIds.has(rec.id));

  useEffect(() => {
    if (clients.length > 0 && workers.length > 0 && tasks.length > 0) {
      analyzeDataForRecommendations();
    }
  }, [clients.length, workers.length, tasks.length]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-orange-600" />
          AI Rule Recommendations
        </CardTitle>
        <CardDescription>
          AI-powered suggestions based on patterns in your data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {visibleRecommendations.length} active recommendations
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={analyzeDataForRecommendations}
              disabled={isAnalyzing}
              className="gap-2"
            >
              {isAnalyzing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Refresh Analysis
            </Button>
          </div>

          {isAnalyzing && (
            <Alert>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <AlertDescription>
                Analyzing your data for rule recommendations...
              </AlertDescription>
            </Alert>
          )}

          {visibleRecommendations.length === 0 && !isAnalyzing && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                No rule recommendations at this time. Your data looks well-optimized!
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            {visibleRecommendations.map((recommendation) => {
              const Icon = getRecommendationIcon(recommendation.type);
              return (
                <div key={recommendation.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <Icon className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{recommendation.title}</h4>
                          <Badge variant="outline" className={getConfidenceColor(recommendation.confidence)}>
                            {Math.round(recommendation.confidence * 100)}% confidence
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          {recommendation.description}
                        </p>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => acceptRecommendation(recommendation)}
                            className="gap-1"
                          >
                            <CheckCircle className="h-3 w-3" />
                            Accept
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => dismissRecommendation(recommendation.id)}
                            className="gap-1"
                          >
                            <X className="h-3 w-3" />
                            Dismiss
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}