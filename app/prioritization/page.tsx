'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Zap, 
  Target, 
  Users, 
  TrendingUp, 
  BarChart3,
  Settings,
  Save,
  RotateCcw,
  Info,
  GripVertical,
  Scale
} from 'lucide-react';
import { useDataStore } from '@/lib/store';
import { DragDropRanking } from '@/components/prioritization/drag-drop-ranking';
import { PairwiseComparison } from '@/components/prioritization/pairwise-comparison';
import { toast } from 'sonner';

export default function PrioritizationPage() {
  const { prioritizationWeights, setPrioritizationWeights } = useDataStore();
  const [localWeights, setLocalWeights] = React.useState(prioritizationWeights);

  const weightCategories = [
    {
      key: 'priorityLevel' as keyof typeof localWeights,
      label: 'Priority Level',
      description: 'How much client/task priority affects allocation',
      icon: Target,
      color: 'text-red-600'
    },
    {
      key: 'fulfillment' as keyof typeof localWeights,
      label: 'Fulfillment',
      description: 'Ensuring all tasks get completed',
      icon: BarChart3,
      color: 'text-blue-600'
    },
    {
      key: 'fairness' as keyof typeof localWeights,
      label: 'Fairness',
      description: 'Equal distribution of work among workers',
      icon: Users,
      color: 'text-green-600'
    },
    {
      key: 'efficiency' as keyof typeof localWeights,
      label: 'Efficiency',
      description: 'Optimal resource utilization',
      icon: TrendingUp,
      color: 'text-purple-600'
    },
    {
      key: 'skillMatch' as keyof typeof localWeights,
      label: 'Skill Match',
      description: 'Matching tasks to worker expertise',
      icon: Zap,
      color: 'text-orange-600'
    }
  ];

  const handleWeightChange = (key: keyof typeof localWeights, value: number[]) => {
    setLocalWeights(prev => ({
      ...prev,
      [key]: value[0]
    }));
  };

  const handleSave = () => {
    setPrioritizationWeights(localWeights);
    toast.success('Prioritization weights saved successfully!');
  };

  const handleReset = () => {
    const defaultWeights = {
      priorityLevel: 30,
      fulfillment: 25,
      fairness: 20,
      efficiency: 15,
      skillMatch: 10,
    };
    setLocalWeights(defaultWeights);
    toast.info('Weights reset to default values');
  };

  const totalWeight = Object.values(localWeights).reduce((sum, weight) => sum + weight, 0);
  const isValidTotal = totalWeight === 100;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Prioritization Weights</h2>
            <p className="text-gray-600">
              Configure how the system prioritizes task allocation using multiple methods
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Default
            </Button>
            <Button onClick={handleSave} disabled={!isValidTotal}>
              <Save className="h-4 w-4 mr-2" />
              Save Weights
            </Button>
          </div>
        </div>

        {!isValidTotal && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Total weight must equal 100%. Current total: {totalWeight}%
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="sliders" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="sliders">Sliders</TabsTrigger>
            <TabsTrigger value="ranking">Drag & Drop</TabsTrigger>
            <TabsTrigger value="pairwise">Pairwise</TabsTrigger>
            <TabsTrigger value="presets">Presets</TabsTrigger>
          </TabsList>

          <TabsContent value="sliders" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Weight Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Weight Configuration
                  </CardTitle>
                  <CardDescription>
                    Adjust the importance of each factor in task allocation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {weightCategories.map((category) => (
                    <div key={category.key} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <category.icon className={`h-4 w-4 ${category.color}`} />
                          <span className="font-medium">{category.label}</span>
                        </div>
                        <Badge variant="secondary">
                          {localWeights[category.key]}%
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {category.description}
                      </p>
                      <Slider
                        value={[localWeights[category.key]]}
                        onValueChange={(value) => handleWeightChange(category.key, value)}
                        max={100}
                        min={0}
                        step={5}
                        className="w-full"
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Weight Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Weight Summary</CardTitle>
                  <CardDescription>
                    Overview of current prioritization settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-lg font-semibold">
                      <span>Total Weight:</span>
                      <Badge variant={isValidTotal ? "default" : "destructive"}>
                        {totalWeight}%
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      {weightCategories
                        .sort((a, b) => localWeights[b.key] - localWeights[a.key])
                        .map((category, index) => (
                          <div key={category.key} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">#{index + 1}</span>
                              <category.icon className={`h-4 w-4 ${category.color}`} />
                              <span className="text-sm">{category.label}</span>
                            </div>
                            <span className="text-sm font-medium">
                              {localWeights[category.key]}%
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="ranking" className="space-y-6">
            <DragDropRanking 
              weights={localWeights} 
              onWeightsChange={setLocalWeights} 
            />
          </TabsContent>

          <TabsContent value="pairwise" className="space-y-6">
            <PairwiseComparison 
              weights={localWeights} 
              onWeightsChange={setLocalWeights} 
            />
          </TabsContent>

          <TabsContent value="presets" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Presets</CardTitle>
                <CardDescription>
                  Common prioritization strategies for different scenarios
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-start"
                    onClick={() => setLocalWeights({
                      priorityLevel: 40,
                      fulfillment: 30,
                      fairness: 15,
                      efficiency: 10,
                      skillMatch: 5
                    })}
                  >
                    <div className="font-medium mb-1">Priority-First</div>
                    <div className="text-xs text-gray-600">
                      Focus on high-priority tasks and completion
                    </div>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-start"
                    onClick={() => setLocalWeights({
                      priorityLevel: 15,
                      fulfillment: 20,
                      fairness: 35,
                      efficiency: 20,
                      skillMatch: 10
                    })}
                  >
                    <div className="font-medium mb-1">Balanced</div>
                    <div className="text-xs text-gray-600">
                      Equal emphasis on fairness and efficiency
                    </div>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-start"
                    onClick={() => setLocalWeights({
                      priorityLevel: 10,
                      fulfillment: 15,
                      fairness: 15,
                      efficiency: 30,
                      skillMatch: 30
                    })}
                  >
                    <div className="font-medium mb-1">Skill-Optimized</div>
                    <div className="text-xs text-gray-600">
                      Match expertise with efficiency focus
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-start"
                    onClick={() => setLocalWeights({
                      priorityLevel: 20,
                      fulfillment: 40,
                      fairness: 25,
                      efficiency: 10,
                      skillMatch: 5
                    })}
                  >
                    <div className="font-medium mb-1">Maximize Fulfillment</div>
                    <div className="text-xs text-gray-600">
                      Ensure all tasks are completed
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-start"
                    onClick={() => setLocalWeights({
                      priorityLevel: 10,
                      fulfillment: 15,
                      fairness: 50,
                      efficiency: 15,
                      skillMatch: 10
                    })}
                  >
                    <div className="font-medium mb-1">Fair Distribution</div>
                    <div className="text-xs text-gray-600">
                      Equal workload across all workers
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-start"
                    onClick={() => setLocalWeights({
                      priorityLevel: 15,
                      fulfillment: 10,
                      fairness: 10,
                      efficiency: 45,
                      skillMatch: 20
                    })}
                  >
                    <div className="font-medium mb-1">Minimize Workload</div>
                    <div className="text-xs text-gray-600">
                      Optimize for minimal resource usage
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Impact Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Impact Preview</CardTitle>
            <CardDescription>
              How these weights affect allocation decisions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              {localWeights.priorityLevel >= 30 && (
                <div className="flex items-center gap-2 text-red-600">
                  <Target className="h-4 w-4" />
                  <span>High-priority tasks will be strongly favored</span>
                </div>
              )}
              {localWeights.fulfillment >= 25 && (
                <div className="flex items-center gap-2 text-blue-600">
                  <BarChart3 className="h-4 w-4" />
                  <span>System will focus on completing all tasks</span>
                </div>
              )}
              {localWeights.fairness >= 20 && (
                <div className="flex items-center gap-2 text-green-600">
                  <Users className="h-4 w-4" />
                  <span>Work will be distributed evenly among workers</span>
                </div>
              )}
              {localWeights.efficiency >= 15 && (
                <div className="flex items-center gap-2 text-purple-600">
                  <TrendingUp className="h-4 w-4" />
                  <span>Resource utilization will be optimized</span>
                </div>
              )}
              {localWeights.skillMatch >= 10 && (
                <div className="flex items-center gap-2 text-orange-600">
                  <Zap className="h-4 w-4" />
                  <span>Tasks will be matched to worker expertise</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}