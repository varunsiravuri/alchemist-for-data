'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Sparkles, 
  Loader2, 
  CheckCircle, 
  X,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { useDataStore } from '@/lib/store';
import { getAIService } from '@/lib/ai-service';
import { ValidationError } from '@/lib/types';
import { toast } from 'sonner';

interface DataCleaningSuggestion {
  field: string;
  originalValue: any;
  suggestedValue: any;
  reason: string;
  confidence: number;
}

export function AIDataCleaner() {
  const { clients, workers, tasks, validationErrors } = useDataStore();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState<DataCleaningSuggestion[]>([]);
  const [acceptedSuggestions, setAcceptedSuggestions] = useState<Set<number>>(new Set());

  const errorCount = validationErrors.filter(e => e.severity === 'error').length;
  const warningCount = validationErrors.filter(e => e.severity === 'warning').length;

  const handleAnalyze = async () => {
    if (validationErrors.length === 0) {
      toast.info('No validation errors found to analyze');
      return;
    }

    setIsAnalyzing(true);
    try {
      const aiService = getAIService();
      
      // Analyze each entity type separately
      const allSuggestions: DataCleaningSuggestion[] = [];

      if (clients.length > 0) {
        const clientErrors = validationErrors.filter(e => e.entityType === 'client');
        if (clientErrors.length > 0) {
          const clientSuggestions = await aiService.suggestDataCleaning({
            data: clients,
            entityType: 'client',
            issues: clientErrors
          });
          allSuggestions.push(...clientSuggestions);
        }
      }

      if (workers.length > 0) {
        const workerErrors = validationErrors.filter(e => e.entityType === 'worker');
        if (workerErrors.length > 0) {
          const workerSuggestions = await aiService.suggestDataCleaning({
            data: workers,
            entityType: 'worker',
            issues: workerErrors
          });
          allSuggestions.push(...workerSuggestions);
        }
      }

      if (tasks.length > 0) {
        const taskErrors = validationErrors.filter(e => e.entityType === 'task');
        if (taskErrors.length > 0) {
          const taskSuggestions = await aiService.suggestDataCleaning({
            data: tasks,
            entityType: 'task',
            issues: taskErrors
          });
          allSuggestions.push(...taskSuggestions);
        }
      }

      setSuggestions(allSuggestions);
      toast.success(`Generated ${allSuggestions.length} cleaning suggestions`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to analyze data');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAcceptSuggestion = (index: number) => {
    setAcceptedSuggestions(prev => new Set([...prev, index]));
    toast.success('Suggestion accepted - apply changes to implement');
  };

  const handleRejectSuggestion = (index: number) => {
    setSuggestions(prev => prev.filter((_, i) => i !== index));
    toast.info('Suggestion rejected');
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.8) return 'default';
    if (confidence >= 0.6) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            AI Data Cleaner
          </CardTitle>
          <CardDescription>
            Let AI analyze your validation errors and suggest intelligent fixes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{errorCount}</div>
              <div className="text-sm text-gray-600">Errors</div>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{warningCount}</div>
              <div className="text-sm text-gray-600">Warnings</div>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{suggestions.length}</div>
              <div className="text-sm text-gray-600">Suggestions</div>
            </div>
          </div>

          <Button 
            onClick={handleAnalyze} 
            disabled={isAnalyzing || validationErrors.length === 0}
            className="w-full gap-2"
          >
            {isAnalyzing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Analyze & Suggest Fixes
          </Button>

          {validationErrors.length === 0 && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                No validation errors found. Your data looks clean!
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>AI Cleaning Suggestions</CardTitle>
            <CardDescription>
              Review and apply these intelligent data fixes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {suggestions.map((suggestion, index) => (
                <div 
                  key={index} 
                  className={`p-4 border rounded-lg ${
                    acceptedSuggestions.has(index) ? 'bg-green-50 border-green-200' : 'bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{suggestion.field}</Badge>
                        <Badge variant={getConfidenceBadge(suggestion.confidence)}>
                          {Math.round(suggestion.confidence * 100)}% confidence
                        </Badge>
                        {acceptedSuggestions.has(index) && (
                          <Badge variant="default">Accepted</Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm mb-2">
                        <div>
                          <span className="font-medium">Original:</span>
                          <code className="ml-2 px-2 py-1 bg-red-100 rounded">
                            {JSON.stringify(suggestion.originalValue)}
                          </code>
                        </div>
                        <div>
                          <span className="font-medium">Suggested:</span>
                          <code className="ml-2 px-2 py-1 bg-green-100 rounded">
                            {JSON.stringify(suggestion.suggestedValue)}
                          </code>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600">{suggestion.reason}</p>
                    </div>
                    
                    {!acceptedSuggestions.has(index) && (
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          onClick={() => handleAcceptSuggestion(index)}
                          className="gap-1"
                        >
                          <CheckCircle className="h-3 w-3" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRejectSuggestion(index)}
                          className="gap-1"
                        >
                          <X className="h-3 w-3" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {acceptedSuggestions.size > 0 && (
              <Alert className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  You have accepted {acceptedSuggestions.size} suggestion(s). 
                  These changes are not automatically applied - you'll need to implement them manually or re-upload corrected data.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}