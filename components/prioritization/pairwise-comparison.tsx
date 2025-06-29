'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Scale, 
  Target, 
  BarChart3, 
  Users, 
  TrendingUp, 
  Zap,
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import { PrioritizationWeights } from '@/lib/types';

interface PairwiseComparisonProps {
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

interface Comparison {
  criteria1: CriteriaItem;
  criteria2: CriteriaItem;
  preference: number; // -3 to 3, where negative favors criteria1, positive favors criteria2
}

export function PairwiseComparison({ weights, onWeightsChange }: PairwiseComparisonProps) {
  const criteria: CriteriaItem[] = [
    {
      key: 'priorityLevel',
      label: 'Priority Level',
      description: 'Client/task priority importance',
      icon: Target,
      color: 'text-red-600'
    },
    {
      key: 'fulfillment',
      label: 'Fulfillment',
      description: 'Task completion focus',
      icon: BarChart3,
      color: 'text-blue-600'
    },
    {
      key: 'fairness',
      label: 'Fairness',
      description: 'Equal work distribution',
      icon: Users,
      color: 'text-green-600'
    },
    {
      key: 'efficiency',
      label: 'Efficiency',
      description: 'Resource optimization',
      icon: TrendingUp,
      color: 'text-purple-600'
    },
    {
      key: 'skillMatch',
      label: 'Skill Match',
      description: 'Expertise alignment',
      icon: Zap,
      color: 'text-orange-600'
    }
  ];

  const [comparisons, setComparisons] = useState<Comparison[]>([]);
  const [currentComparisonIndex, setCurrentComparisonIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // Generate all possible pairs
  useEffect(() => {
    const pairs: Comparison[] = [];
    for (let i = 0; i < criteria.length; i++) {
      for (let j = i + 1; j < criteria.length; j++) {
        pairs.push({
          criteria1: criteria[i],
          criteria2: criteria[j],
          preference: 0
        });
      }
    }
    setComparisons(pairs);
  }, []);

  const handlePreference = (preference: number) => {
    const newComparisons = [...comparisons];
    newComparisons[currentComparisonIndex].preference = preference;
    setComparisons(newComparisons);

    if (currentComparisonIndex < comparisons.length - 1) {
      setCurrentComparisonIndex(currentComparisonIndex + 1);
    } else {
      setIsComplete(true);
      calculateWeights(newComparisons);
    }
  };

  const calculateWeights = (completedComparisons: Comparison[]) => {
    // Simple AHP-like calculation
    const scores: Record<keyof PrioritizationWeights, number> = {
      priorityLevel: 0,
      fulfillment: 0,
      fairness: 0,
      efficiency: 0,
      skillMatch: 0
    };

    // Calculate scores based on pairwise comparisons
    completedComparisons.forEach(comparison => {
      const { criteria1, criteria2, preference } = comparison;
      
      if (preference < 0) {
        // criteria1 is preferred
        scores[criteria1.key] += Math.abs(preference);
      } else if (preference > 0) {
        // criteria2 is preferred
        scores[criteria2.key] += preference;
      } else {
        // Equal preference
        scores[criteria1.key] += 0.5;
        scores[criteria2.key] += 0.5;
      }
    });

    // Normalize to percentages
    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
    const normalizedWeights: PrioritizationWeights = {
      priorityLevel: Math.round((scores.priorityLevel / totalScore) * 100),
      fulfillment: Math.round((scores.fulfillment / totalScore) * 100),
      fairness: Math.round((scores.fairness / totalScore) * 100),
      efficiency: Math.round((scores.efficiency / totalScore) * 100),
      skillMatch: Math.round((scores.skillMatch / totalScore) * 100)
    };

    // Ensure total equals 100
    const total = Object.values(normalizedWeights).reduce((sum, weight) => sum + weight, 0);
    if (total !== 100) {
      normalizedWeights.priorityLevel += (100 - total);
    }

    onWeightsChange(normalizedWeights);
  };

  const reset = () => {
    setCurrentComparisonIndex(0);
    setIsComplete(false);
    setComparisons(prev => prev.map(comp => ({ ...comp, preference: 0 })));
  };

  const goBack = () => {
    if (currentComparisonIndex > 0) {
      setCurrentComparisonIndex(currentComparisonIndex - 1);
      setIsComplete(false);
    }
  };

  const preferenceLabels = [
    { value: -3, label: 'Much More Important', color: 'bg-red-500' },
    { value: -2, label: 'More Important', color: 'bg-red-400' },
    { value: -1, label: 'Slightly More Important', color: 'bg-red-300' },
    { value: 0, label: 'Equally Important', color: 'bg-gray-400' },
    { value: 1, label: 'Slightly More Important', color: 'bg-blue-300' },
    { value: 2, label: 'More Important', color: 'bg-blue-400' },
    { value: 3, label: 'Much More Important', color: 'bg-blue-500' }
  ];

  if (comparisons.length === 0) {
    return <div>Loading...</div>;
  }

  const currentComparison = comparisons[currentComparisonIndex];
  const progress = ((currentComparisonIndex + (isComplete ? 1 : 0)) / comparisons.length) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="h-5 w-5" />
          Pairwise Comparison
        </CardTitle>
        <CardDescription>
          Compare criteria pairs to determine relative importance using the Analytic Hierarchy Process
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{currentComparisonIndex + (isComplete ? 1 : 0)} of {comparisons.length}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {!isComplete && currentComparison && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">
                  Which criterion is more important for resource allocation?
                </h3>
                <p className="text-sm text-gray-600">
                  Comparison {currentComparisonIndex + 1} of {comparisons.length}
                </p>
              </div>

              <div className="flex items-center justify-center gap-8">
                <div className="text-center">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-3">
                    <currentComparison.criteria1.icon className={`h-8 w-8 ${currentComparison.criteria1.color}`} />
                  </div>
                  <h4 className="font-medium">{currentComparison.criteria1.label}</h4>
                  <p className="text-xs text-gray-600 mt-1">{currentComparison.criteria1.description}</p>
                </div>

                <div className="text-center">
                  <ArrowRight className="h-6 w-6 text-gray-400 mb-8" />
                  <div className="text-sm text-gray-500">vs</div>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-3">
                    <currentComparison.criteria2.icon className={`h-8 w-8 ${currentComparison.criteria2.color}`} />
                  </div>
                  <h4 className="font-medium">{currentComparison.criteria2.label}</h4>
                  <p className="text-xs text-gray-600 mt-1">{currentComparison.criteria2.description}</p>
                </div>
              </div>

              <div className="space-y-3">
                {preferenceLabels.map((pref) => (
                  <Button
                    key={pref.value}
                    variant="outline"
                    className="w-full h-auto p-4 justify-start"
                    onClick={() => handlePreference(pref.value)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded ${pref.color}`} />
                      <div className="text-left">
                        <div className="font-medium">
                          {pref.value < 0 ? currentComparison.criteria1.label : 
                           pref.value > 0 ? currentComparison.criteria2.label : 
                           'Both criteria'} {pref.label.toLowerCase()}
                        </div>
                        {pref.value !== 0 && (
                          <div className="text-xs text-gray-500">
                            {Math.abs(pref.value) === 1 ? 'Slight preference' :
                             Math.abs(pref.value) === 2 ? 'Moderate preference' :
                             'Strong preference'}
                          </div>
                        )}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={goBack} disabled={currentComparisonIndex === 0}>
                  Previous
                </Button>
                <Button variant="outline" onClick={reset} className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </Button>
              </div>
            </div>
          )}

          {isComplete && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-medium text-green-600 mb-2">
                  Comparison Complete!
                </h3>
                <p className="text-sm text-gray-600">
                  Weights have been calculated based on your preferences
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {criteria.map((criterion) => {
                  const weight = weights[criterion.key];
                  const Icon = criterion.icon;
                  return (
                    <div key={criterion.key} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Icon className={`h-5 w-5 ${criterion.color}`} />
                        <span className="font-medium">{criterion.label}</span>
                      </div>
                      <Badge variant="secondary" className="text-lg">
                        {weight}%
                      </Badge>
                    </div>
                  );
                })}
              </div>

              <Button variant="outline" onClick={reset} className="w-full gap-2">
                <RotateCcw className="h-4 w-4" />
                Start Over
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}