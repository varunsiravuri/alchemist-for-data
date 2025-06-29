'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MessageCircle, 
  Loader2, 
  AlertTriangle,
  Info,
  CheckCircle
} from 'lucide-react';
import { useDataStore } from '@/lib/store';
import { getAIService } from '@/lib/ai-service';
import { ValidationError } from '@/lib/types';
import { toast } from 'sonner';

interface ExplainedError extends ValidationError {
  explanation?: string;
  isExplaining?: boolean;
}

export function AIValidationExplainer() {
  const { validationErrors, clients, workers, tasks } = useDataStore();
  const [explainedErrors, setExplainedErrors] = useState<Map<string, string>>(new Map());
  const [isExplaining, setIsExplaining] = useState<Set<string>>(new Set());

  const handleExplainError = async (error: ValidationError) => {
    if (explainedErrors.has(error.id)) {
      return; // Already explained
    }

    setIsExplaining(prev => new Set([...prev, error.id]));

    try {
      const aiService = getAIService();
      
      // Get relevant context based on entity type
      let context = {};
      if (error.entityType === 'client') {
        const client = clients.find(c => c.id === error.entityId);
        context = { entity: client, allClients: clients.slice(0, 3) };
      } else if (error.entityType === 'worker') {
        const worker = workers.find(w => w.id === error.entityId);
        context = { entity: worker, allWorkers: workers.slice(0, 3) };
      } else if (error.entityType === 'task') {
        const task = tasks.find(t => t.id === error.entityId);
        context = { entity: task, allTasks: tasks.slice(0, 3) };
      }

      const explanation = await aiService.explainValidationError(error, context);
      
      setExplainedErrors(prev => new Map([...prev, [error.id, explanation]]));
      toast.success('Error explanation generated');
    } catch (error) {
      toast.error('Failed to generate explanation');
    } finally {
      setIsExplaining(prev => {
        const newSet = new Set(prev);
        newSet.delete(error.id);
        return newSet;
      });
    }
  };

  const getSeverityIcon = (severity: ValidationError['severity']) => {
    switch (severity) {
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-600" />;
      default:
        return <CheckCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getSeverityBadgeVariant = (severity: ValidationError['severity']) => {
    switch (severity) {
      case 'error':
        return 'destructive' as const;
      case 'warning':
        return 'secondary' as const;
      case 'info':
        return 'outline' as const;
      default:
        return 'outline' as const;
    }
  };

  if (validationErrors.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Validation Errors
          </h3>
          <p className="text-gray-600 text-center">
            Your data looks clean! No errors need explanation.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-blue-600" />
          AI Validation Explainer
        </CardTitle>
        <CardDescription>
          Get plain English explanations for validation errors
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {validationErrors.map((error) => (
            <div key={error.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getSeverityIcon(error.severity)}
                  <Badge variant={getSeverityBadgeVariant(error.severity)}>
                    {error.severity.toUpperCase()}
                  </Badge>
                  <Badge variant="outline">{error.entityType}</Badge>
                  <span className="text-sm text-gray-500">{error.entityId}</span>
                </div>
                
                {!explainedErrors.has(error.id) && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleExplainError(error)}
                    disabled={isExplaining.has(error.id)}
                    className="gap-2"
                  >
                    {isExplaining.has(error.id) ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <MessageCircle className="h-3 w-3" />
                    )}
                    Explain
                  </Button>
                )}
              </div>
              
              <div className="mb-2">
                <span className="font-medium">{error.field}:</span> {error.message}
              </div>
              
              <div className="text-xs text-gray-500 mb-3">
                {error.timestamp.toLocaleString()}
              </div>

              {explainedErrors.has(error.id) && (
                <Alert>
                  <MessageCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>AI Explanation:</strong> {explainedErrors.get(error.id)}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}