'use client';

import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Settings, 
  Trash2, 
  Edit, 
  Save,
  X,
  AlertTriangle,
  CheckCircle,
  Users,
  Clock,
  MapPin,
  Zap,
  Lightbulb
} from 'lucide-react';
import { useDataStore } from '@/lib/store';
import { BusinessRule } from '@/lib/types';
import { RuleConfigurator } from '@/components/rules/rule-configurator';
import { RuleRecommendations } from '@/components/rules/rule-recommendations';
import { toast } from 'sonner';

export default function RulesPage() {
  const { businessRules, addBusinessRule, updateBusinessRule, removeBusinessRule } = useDataStore();
  const [isCreating, setIsCreating] = useState(false);
  const [editingRule, setEditingRule] = useState<string | null>(null);
  const [configuringRule, setConfiguringRule] = useState<Partial<BusinessRule> | null>(null);
  const [newRule, setNewRule] = useState<Partial<BusinessRule>>({
    name: '',
    description: '',
    type: 'co-location',
    conditions: {},
    actions: {},
    active: true
  });

  const ruleTypes = [
    { value: 'co-location', label: 'Co-location', icon: MapPin, description: 'Tasks that must run together' },
    { value: 'slot-restriction', label: 'Slot Restriction', icon: Clock, description: 'Time-based constraints' },
    { value: 'load-limit', label: 'Load Limit', icon: Users, description: 'Worker capacity limits' },
    { value: 'phase-window', label: 'Phase Window', icon: Zap, description: 'Phase-specific timing' },
    { value: 'custom', label: 'Custom', icon: Settings, description: 'Custom business logic' }
  ];

  const handleCreateRule = () => {
    if (!newRule.name || !newRule.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    setConfiguringRule(newRule);
    setIsCreating(false);
  };

  const handleSaveConfiguredRule = () => {
    if (!configuringRule) return;

    const rule: BusinessRule = {
      id: `rule-${Date.now()}`,
      name: configuringRule.name!,
      description: configuringRule.description!,
      type: configuringRule.type as BusinessRule['type'],
      conditions: configuringRule.conditions || {},
      actions: configuringRule.actions || {},
      active: configuringRule.active ?? true,
      createdAt: new Date()
    };

    addBusinessRule(rule);
    setConfiguringRule(null);
    setNewRule({
      name: '',
      description: '',
      type: 'co-location',
      conditions: {},
      actions: {},
      active: true
    });
    toast.success('Business rule created successfully');
  };

  const handleCancelConfiguration = () => {
    setConfiguringRule(null);
    setIsCreating(false);
  };

  const handleToggleRule = (id: string, active: boolean) => {
    updateBusinessRule(id, { active });
    toast.success(`Rule ${active ? 'activated' : 'deactivated'}`);
  };

  const handleDeleteRule = (id: string) => {
    removeBusinessRule(id);
    toast.success('Rule deleted successfully');
  };

  const getRuleTypeInfo = (type: string) => {
    return ruleTypes.find(t => t.value === type) || ruleTypes[0];
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Business Rules</h2>
            <p className="text-gray-600">
              Define and manage business rules for resource allocation
            </p>
          </div>
          <Button onClick={() => setIsCreating(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Rule
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Rules</p>
                  <p className="text-2xl font-bold">{businessRules.length}</p>
                </div>
                <Settings className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Rules</p>
                  <p className="text-2xl font-bold">{businessRules.filter(r => r.active).length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Inactive Rules</p>
                  <p className="text-2xl font-bold">{businessRules.filter(r => !r.active).length}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Rule Types</p>
                  <p className="text-2xl font-bold">{new Set(businessRules.map(r => r.type)).size}</p>
                </div>
                <Zap className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="rules" className="space-y-4">
          <TabsList>
            <TabsTrigger value="rules">Rules Management</TabsTrigger>
            <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
            <TabsTrigger value="templates">Rule Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="rules" className="space-y-4">
            {/* Rule Configurator */}
            {configuringRule && (
              <RuleConfigurator
                rule={configuringRule}
                onRuleChange={setConfiguringRule}
                onSave={handleSaveConfiguredRule}
                onCancel={handleCancelConfiguration}
              />
            )}

            {/* Create New Rule */}
            {isCreating && !configuringRule && (
              <Card>
                <CardHeader>
                  <CardTitle>Create New Rule</CardTitle>
                  <CardDescription>
                    Define a new business rule for resource allocation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="rule-name">Rule Name</Label>
                      <Input
                        id="rule-name"
                        placeholder="Enter rule name"
                        value={newRule.name}
                        onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rule-type">Rule Type</Label>
                      <Select
                        value={newRule.type}
                        onValueChange={(value) => setNewRule({ ...newRule, type: value as BusinessRule['type'] })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select rule type" />
                        </SelectTrigger>
                        <SelectContent>
                          {ruleTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center gap-2">
                                <type.icon className="h-4 w-4" />
                                {type.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="rule-description">Description</Label>
                    <Textarea
                      id="rule-description"
                      placeholder="Describe what this rule does"
                      value={newRule.description}
                      onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="rule-active"
                      checked={newRule.active}
                      onCheckedChange={(checked) => setNewRule({ ...newRule, active: checked })}
                    />
                    <Label htmlFor="rule-active">Active</Label>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleCreateRule} className="gap-2">
                      <Settings className="h-4 w-4" />
                      Configure Rule
                    </Button>
                    <Button variant="outline" onClick={() => setIsCreating(false)} className="gap-2">
                      <X className="h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Rules List */}
            <div className="space-y-4">
              {businessRules.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Rules Created</h3>
                    <p className="text-gray-600 mb-4">
                      Create your first business rule to start managing resource allocation constraints.
                    </p>
                    <Button onClick={() => setIsCreating(true)} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Create Your First Rule
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                businessRules.map((rule) => {
                  const typeInfo = getRuleTypeInfo(rule.type);
                  return (
                    <Card key={rule.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <typeInfo.icon className="h-5 w-5 text-gray-500" />
                            <div>
                              <CardTitle className="text-lg">{rule.name}</CardTitle>
                              <CardDescription>{rule.description}</CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={rule.active ? "default" : "secondary"}>
                              {rule.active ? "Active" : "Inactive"}
                            </Badge>
                            <Badge variant="outline">{typeInfo.label}</Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-600">
                            Created: {rule.createdAt.toLocaleDateString()}
                            {Object.keys(rule.conditions).length > 0 && (
                              <span className="ml-4">
                                Conditions: {Object.keys(rule.conditions).length}
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Switch
                              checked={rule.active}
                              onCheckedChange={(checked) => handleToggleRule(rule.id, checked)}
                            />
                            <Button variant="ghost" size="sm" className="gap-2">
                              <Edit className="h-4 w-4" />
                              Edit
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="gap-2 text-red-600 hover:text-red-700"
                              onClick={() => handleDeleteRule(rule.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            <RuleRecommendations />
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ruleTypes.map((type) => (
                <Card key={type.value} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <type.icon className="h-5 w-5" />
                      {type.label}
                    </CardTitle>
                    <CardDescription>{type.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        setNewRule({ ...newRule, type: type.value as BusinessRule['type'] });
                        setIsCreating(true);
                      }}
                    >
                      Use Template
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Help Section */}
        <Card>
          <CardHeader>
            <CardTitle>Rule Types Guide</CardTitle>
            <CardDescription>
              Understanding different types of business rules
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Co-location Rules
                  </h4>
                  <p className="text-sm text-gray-600">
                    Define tasks that must be executed together or in the same location.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Slot Restriction Rules
                  </h4>
                  <p className="text-sm text-gray-600">
                    Set time-based constraints for when tasks can be executed.
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Load Limit Rules
                  </h4>
                  <p className="text-sm text-gray-600">
                    Control worker capacity and prevent overallocation.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Phase Window Rules
                  </h4>
                  <p className="text-sm text-gray-600">
                    Define phase-specific timing and sequencing constraints.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}