'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Sparkles, 
  Send, 
  Loader2, 
  CheckCircle, 
  AlertTriangle,
  Lightbulb,
  Settings
} from 'lucide-react';
import { useDataStore } from '@/lib/store';
import { getAIService } from '@/lib/ai-service';
import { BusinessRule } from '@/lib/types';
import { toast } from 'sonner';

interface AIRuleGeneratorProps {
  onRuleGenerated: (rule: BusinessRule) => void;
}

export function AIRuleGenerator({ onRuleGenerated }: AIRuleGeneratorProps) {
  const { clients, workers, tasks } = useDataStore();
  const [instruction, setInstruction] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<{
    rule: Partial<BusinessRule>;
    explanation: string;
    confidence: number;
  } | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);

  const exampleInstructions = [
    "Allocate high-priority tasks to skilled workers only",
    "Filter out clients with incomplete profiles", 
    "Ensure no worker gets more than 5 concurrent tasks",
    "Prioritize tasks from premium clients",
    "Match tasks requiring specific skills to qualified workers"
  ];

  const handleGenerate = async () => {
    if (!instruction.trim()) {
      toast.error('Please enter an instruction');
      return;
    }

    if (!apiKey.trim()) {
      setShowApiKeyInput(true);
      toast.error('Please enter your OpenAI API key');
      return;
    }

    setIsGenerating(true);
    try {
      const aiService = getAIService(apiKey);
      const result = await aiService.generateBusinessRule({
        instruction,
        context: { clients, workers, tasks }
      });

      setLastGenerated(result);
      toast.success('Rule generated successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to generate rule');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAcceptRule = () => {
    if (!lastGenerated) return;

    const rule: BusinessRule = {
      id: `ai-rule-${Date.now()}`,
      name: lastGenerated.rule.name || 'AI Generated Rule',
      description: lastGenerated.rule.description || '',
      type: lastGenerated.rule.type as BusinessRule['type'] || 'custom',
      conditions: lastGenerated.rule.conditions || {},
      actions: lastGenerated.rule.actions || {},
      active: true,
      createdAt: new Date()
    };

    onRuleGenerated(rule);
    setLastGenerated(null);
    setInstruction('');
    toast.success('Rule added to your business rules!');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            AI Rule Generator
          </CardTitle>
          <CardDescription>
            Describe what you want in natural language, and AI will create a business rule for you
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {showApiKeyInput && (
            <div className="space-y-2">
              <label className="text-sm font-medium">OpenAI API Key</label>
              <Input
                type="password"
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Your API key is stored locally and never sent to our servers
              </p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Natural Language Instruction</label>
            <Textarea
              placeholder="Describe the rule you want to create..."
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating}
              className="gap-2"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Generate Rule
            </Button>
            {!showApiKeyInput && (
              <Button 
                variant="outline" 
                onClick={() => setShowApiKeyInput(true)}
                className="gap-2"
              >
                <Settings className="h-4 w-4" />
                API Key
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Example Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            Example Instructions
          </CardTitle>
          <CardDescription>
            Try these example instructions to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {exampleInstructions.map((example, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => setInstruction(example)}
                className="text-left h-auto p-2"
              >
                {example}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Generated Rule Preview */}
      {lastGenerated && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Generated Rule
              <Badge variant="secondary">
                {Math.round(lastGenerated.confidence * 100)}% confidence
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium">{lastGenerated.rule.name}</h4>
              <p className="text-sm text-gray-600">{lastGenerated.rule.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Type:</span> {lastGenerated.rule.type}
              </div>
              <div>
                <span className="font-medium">Conditions:</span> {Object.keys(lastGenerated.rule.conditions || {}).length} defined
              </div>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>AI Explanation:</strong> {lastGenerated.explanation}
              </AlertDescription>
            </Alert>

            <div className="flex gap-2">
              <Button onClick={handleAcceptRule} className="gap-2">
                <CheckCircle className="h-4 w-4" />
                Accept Rule
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setLastGenerated(null)}
              >
                Discard
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}