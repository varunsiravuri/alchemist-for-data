'use client';

import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Sparkles, 
  MessageCircle, 
  RefreshCw,
  Settings,
  Lightbulb,
  AlertTriangle
} from 'lucide-react';
import { AIRuleGenerator } from '@/components/ai/ai-rule-generator';
import { AIDataCleaner } from '@/components/ai/ai-data-cleaner';
import { AIValidationExplainer } from '@/components/ai/ai-validation-explainer';
import { useDataStore } from '@/lib/store';
import { initializeAIService, getAIService } from '@/lib/ai-service';
import { BusinessRule } from '@/lib/types';
import { toast } from 'sonner';

export default function AIAssistantPage() {
  const { addBusinessRule, businessRules, validationErrors } = useDataStore();
  const [apiKey, setApiKey] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizations, setOptimizations] = useState<{
    optimizations: string[];
    suggestions: string[];
  } | null>(null);

  const handleConfigureAPI = () => {
    if (!apiKey.trim()) {
      toast.error('Please enter your OpenAI API key');
      return;
    }

    try {
      initializeAIService(apiKey);
      setIsConfigured(true);
      toast.success('AI Assistant configured successfully!');
    } catch (error) {
      toast.error('Failed to configure AI Assistant');
    }
  };

  const handleRuleGenerated = (rule: BusinessRule) => {
    addBusinessRule(rule);
  };

  const handleOptimizeRules = async () => {
    if (!isConfigured) {
      toast.error('Please configure your API key first');
      return;
    }

    if (businessRules.length === 0) {
      toast.error('No business rules to optimize');
      return;
    }

    setIsOptimizing(true);
    try {
      const aiService = getAIService();
      const result = await aiService.optimizeRules(businessRules);
      setOptimizations(result);
      toast.success('Rule optimization analysis complete');
    } catch (error) {
      toast.error('Failed to optimize rules');
    } finally {
      setIsOptimizing(false);
    }
  };

  const errorCount = validationErrors.filter(e => e.severity === 'error').length;
  const warningCount = validationErrors.filter(e => e.severity === 'warning').length;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">AI Assistant</h2>
            <p className="text-gray-600">
              Intelligent data transformation and rule generation powered by AI
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isConfigured ? (
              <div className="flex items-center gap-2 text-green-600">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm">AI Ready</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-yellow-600">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">Configure API Key</span>
              </div>
            )}
          </div>
        </div>

        {/* API Configuration */}
        {!isConfigured && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configure AI Assistant
              </CardTitle>
              <CardDescription>
                Enter your OpenAI API key to enable AI-powered features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">OpenAI API Key</label>
                <div className="flex gap-2">
                  <Input
                    type="password"
                    placeholder="sk-..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleConfigureAPI}>
                    Configure
                  </Button>
                </div>
              </div>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Your API key is stored locally in your browser and never sent to our servers. 
                  You can get an API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline">OpenAI's platform</a>.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

        {/* AI Features */}
        {isConfigured && (
          <Tabs defaultValue="rules" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="rules">Rule Generator</TabsTrigger>
              <TabsTrigger value="cleaner">Data Cleaner</TabsTrigger>
              <TabsTrigger value="explainer">Error Explainer</TabsTrigger>
              <TabsTrigger value="optimizer">Rule Optimizer</TabsTrigger>
            </TabsList>

            <TabsContent value="rules" className="space-y-4">
              <AIRuleGenerator onRuleGenerated={handleRuleGenerated} />
            </TabsContent>

            <TabsContent value="cleaner" className="space-y-4">
              <AIDataCleaner />
            </TabsContent>

            <TabsContent value="explainer" className="space-y-4">
              <AIValidationExplainer />
            </TabsContent>

            <TabsContent value="optimizer" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-orange-600" />
                    Rule Optimizer
                  </CardTitle>
                  <CardDescription>
                    Analyze your business rules for optimization opportunities
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">
                        Current Rules: <span className="font-medium">{businessRules.length}</span>
                      </p>
                    </div>
                    <Button 
                      onClick={handleOptimizeRules}
                      disabled={isOptimizing || businessRules.length === 0}
                      className="gap-2"
                    >
                      {isOptimizing ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Lightbulb className="h-4 w-4" />
                      )}
                      Analyze Rules
                    </Button>
                  </div>

                  {optimizations && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Optimization Opportunities</h4>
                        <div className="space-y-2">
                          {optimizations.optimizations.map((opt, index) => (
                            <div key={index} className="p-3 bg-blue-50 rounded-lg text-sm">
                              {opt}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Suggestions</h4>
                        <div className="space-y-2">
                          {optimizations.suggestions.map((suggestion, index) => (
                            <div key={index} className="p-3 bg-green-50 rounded-lg text-sm">
                              {suggestion}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* Quick Stats */}
        {isConfigured && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Validation Errors</p>
                    <p className="text-2xl font-bold text-red-600">{errorCount}</p>
                  </div>
                  <MessageCircle className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Warnings</p>
                    <p className="text-2xl font-bold text-yellow-600">{warningCount}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Business Rules</p>
                    <p className="text-2xl font-bold text-blue-600">{businessRules.length}</p>
                  </div>
                  <Settings className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  );
}