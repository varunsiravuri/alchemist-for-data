'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  GripVertical, 
  Target, 
  BarChart3, 
  Users, 
  TrendingUp, 
  Zap,
  RotateCcw,
  Save
} from 'lucide-react';
import { PrioritizationWeights } from '@/lib/types';

interface DragDropRankingProps {
  weights: PrioritizationWeights;
  onWeightsChange: (weights: PrioritizationWeights) => void;
}

interface CriteriaItem {
  key: keyof PrioritizationWeights;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export function DragDropRanking({ weights, onWeightsChange }: DragDropRankingProps) {
  const [criteria, setCriteria] = useState<CriteriaItem[]>([
    {
      key: 'priorityLevel',
      label: 'Priority Level',
      description: 'How much client/task priority affects allocation',
      icon: Target,
      color: 'text-red-600'
    },
    {
      key: 'fulfillment',
      label: 'Fulfillment',
      description: 'Ensuring all tasks get completed',
      icon: BarChart3,
      color: 'text-blue-600'
    },
    {
      key: 'fairness',
      label: 'Fairness',
      description: 'Equal distribution of work among workers',
      icon: Users,
      color: 'text-green-600'
    },
    {
      key: 'efficiency',
      label: 'Efficiency',
      description: 'Optimal resource utilization',
      icon: TrendingUp,
      color: 'text-purple-600'
    },
    {
      key: 'skillMatch',
      label: 'Skill Match',
      description: 'Matching tasks to worker expertise',
      icon: Zap,
      color: 'text-orange-600'
    }
  ]);

  const [draggedItem, setDraggedItem] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedItem === null) return;

    const newCriteria = [...criteria];
    const draggedCriterion = newCriteria[draggedItem];
    
    // Remove the dragged item
    newCriteria.splice(draggedItem, 1);
    
    // Insert at the new position
    newCriteria.splice(dropIndex, 0, draggedCriterion);
    
    setCriteria(newCriteria);
    setDraggedItem(null);
    
    // Calculate new weights based on ranking
    updateWeightsFromRanking(newCriteria);
  };

  const updateWeightsFromRanking = (rankedCriteria: CriteriaItem[]) => {
    const totalWeight = 100;
    const baseWeights = [40, 30, 20, 7, 3]; // Decreasing weights for ranking
    
    const newWeights: PrioritizationWeights = {
      priorityLevel: 0,
      fulfillment: 0,
      fairness: 0,
      efficiency: 0,
      skillMatch: 0
    };

    rankedCriteria.forEach((criterion, index) => {
      newWeights[criterion.key] = baseWeights[index] || 1;
    });

    onWeightsChange(newWeights);
  };

  const resetToDefault = () => {
    const defaultOrder: CriteriaItem[] = [
      criteria.find(c => c.key === 'priorityLevel')!,
      criteria.find(c => c.key === 'fulfillment')!,
      criteria.find(c => c.key === 'fairness')!,
      criteria.find(c => c.key === 'efficiency')!,
      criteria.find(c => c.key === 'skillMatch')!
    ];
    
    setCriteria(defaultOrder);
    updateWeightsFromRanking(defaultOrder);
  };

  const getRankingWeight = (index: number) => {
    const baseWeights = [40, 30, 20, 7, 3];
    return baseWeights[index] || 1;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GripVertical className="h-5 w-5" />
          Drag & Drop Ranking
        </CardTitle>
        <CardDescription>
          Drag criteria to reorder by importance. Higher position = higher weight.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Drag items to reorder by priority
            </div>
            <Button variant="outline" size="sm" onClick={resetToDefault} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>

          <div className="space-y-2">
            {criteria.map((criterion, index) => {
              const Icon = criterion.icon;
              const weight = getRankingWeight(index);
              
              return (
                <div
                  key={criterion.key}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  className={`p-4 border rounded-lg cursor-move transition-all hover:shadow-md ${
                    draggedItem === index ? 'opacity-50 scale-95' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-gray-400" />
                        <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                          {index + 1}
                        </Badge>
                      </div>
                      <Icon className={`h-5 w-5 ${criterion.color}`} />
                      <div>
                        <div className="font-medium">{criterion.label}</div>
                        <div className="text-sm text-gray-600">{criterion.description}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary" className="text-lg font-bold">
                        {weight}%
                      </Badge>
                      <div className="text-xs text-gray-500 mt-1">
                        Rank #{index + 1}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t">
            <div className="text-sm text-gray-600 mb-2">
              Current weights distribution:
            </div>
            <div className="grid grid-cols-5 gap-2 text-xs">
              {criteria.map((criterion, index) => (
                <div key={criterion.key} className="text-center">
                  <div className="font-medium">{criterion.label}</div>
                  <div className="text-gray-500">{getRankingWeight(index)}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}