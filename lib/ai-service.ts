import { BusinessRule, Client, Worker, Task, ValidationError } from './types';

interface OpenAIConfig {
  apiKey: string;
  model: string;
}

interface RuleGenerationRequest {
  instruction: string;
  context: {
    clients: Client[];
    workers: Worker[];
    tasks: Task[];
  };
}

interface RuleGenerationResponse {
  rule: Partial<BusinessRule>;
  explanation: string;
  confidence: number;
}

interface DataCleaningRequest {
  data: any[];
  entityType: 'client' | 'worker' | 'task';
  issues: ValidationError[];
}

interface DataCleaningSuggestion {
  field: string;
  originalValue: any;
  suggestedValue: any;
  reason: string;
  confidence: number;
}

export class AIService {
  private config: OpenAIConfig;
  private baseUrl = 'https://api.openai.com/v1';

  constructor(apiKey: string, model: string = 'gpt-4') {
    this.config = {
      apiKey,
      model
    };
  }

  async generateBusinessRule(request: RuleGenerationRequest): Promise<RuleGenerationResponse> {
    const prompt = this.buildRuleGenerationPrompt(request);
    
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            {
              role: 'system',
              content: 'You are an expert in business rule generation for resource allocation systems. Generate structured business rules from natural language instructions.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      return this.parseRuleResponse(content);
    } catch (error) {
      console.error('Error generating business rule:', error);
      throw new Error('Failed to generate business rule. Please check your API key and try again.');
    }
  }

  async suggestDataCleaning(request: DataCleaningRequest): Promise<DataCleaningSuggestion[]> {
    const prompt = this.buildDataCleaningPrompt(request);
    
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            {
              role: 'system',
              content: 'You are an expert data cleaning assistant. Analyze data quality issues and suggest intelligent fixes.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.2,
          max_tokens: 1500
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      return this.parseCleaningSuggestions(content);
    } catch (error) {
      console.error('Error generating cleaning suggestions:', error);
      throw new Error('Failed to generate cleaning suggestions. Please check your API key and try again.');
    }
  }

  async explainValidationError(error: ValidationError, context: any): Promise<string> {
    const prompt = `
Explain this validation error in simple, user-friendly language:

Error Details:
- Entity Type: ${error.entityType}
- Entity ID: ${error.entityId}
- Field: ${error.field}
- Message: ${error.message}
- Severity: ${error.severity}

Context: ${JSON.stringify(context, null, 2)}

Provide a clear explanation of what's wrong and how to fix it.
`;

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that explains data validation errors in simple, actionable terms.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 300
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error explaining validation error:', error);
      return 'Unable to generate explanation. Please check the error details manually.';
    }
  }

  async optimizeRules(rules: BusinessRule[]): Promise<{ optimizations: string[]; suggestions: string[] }> {
    const prompt = `
Analyze these business rules and suggest optimizations:

Rules:
${JSON.stringify(rules, null, 2)}

Provide:
1. Optimization opportunities (performance, conflicts, redundancy)
2. Suggestions for improvement
3. Potential rule combinations or simplifications

Format as JSON with "optimizations" and "suggestions" arrays.
`;

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            {
              role: 'system',
              content: 'You are an expert in business rule optimization and analysis.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 800
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      try {
        return JSON.parse(content);
      } catch {
        return {
          optimizations: ['Unable to parse optimization suggestions'],
          suggestions: ['Please review rules manually for optimization opportunities']
        };
      }
    } catch (error) {
      console.error('Error optimizing rules:', error);
      return {
        optimizations: ['Error generating optimizations'],
        suggestions: ['Please check your API configuration']
      };
    }
  }

  private buildRuleGenerationPrompt(request: RuleGenerationRequest): string {
    return `
Generate a business rule from this natural language instruction:
"${request.instruction}"

Context:
- Clients: ${request.context.clients.length} records
- Workers: ${request.context.workers.length} records  
- Tasks: ${request.context.tasks.length} records

Available rule types:
- co-location: Tasks that must run together
- slot-restriction: Time-based constraints
- load-limit: Worker capacity limits
- phase-window: Phase-specific timing
- custom: Custom business logic

Sample data structure:
Clients: ${JSON.stringify(request.context.clients.slice(0, 2), null, 2)}
Workers: ${JSON.stringify(request.context.workers.slice(0, 2), null, 2)}
Tasks: ${JSON.stringify(request.context.tasks.slice(0, 2), null, 2)}

Return a JSON object with:
{
  "rule": {
    "name": "Rule name",
    "description": "What this rule does",
    "type": "rule-type",
    "conditions": { "field": "value" },
    "actions": { "action": "value" }
  },
  "explanation": "Plain English explanation",
  "confidence": 0.85
}
`;
  }

  private buildDataCleaningPrompt(request: DataCleaningRequest): string {
    return `
Analyze this ${request.entityType} data and suggest intelligent cleaning fixes:

Data sample: ${JSON.stringify(request.data.slice(0, 5), null, 2)}

Validation issues:
${request.issues.map(issue => `- ${issue.field}: ${issue.message}`).join('\n')}

Suggest cleaning fixes as JSON array:
[
  {
    "field": "field_name",
    "originalValue": "current_value",
    "suggestedValue": "cleaned_value", 
    "reason": "Why this fix makes sense",
    "confidence": 0.9
  }
]

Focus on:
- Standardizing formats
- Fixing common typos
- Normalizing data
- Filling missing values intelligently
`;
  }

  private parseRuleResponse(content: string): RuleGenerationResponse {
    try {
      const parsed = JSON.parse(content);
      return {
        rule: {
          name: parsed.rule.name || 'Generated Rule',
          description: parsed.rule.description || 'AI-generated business rule',
          type: parsed.rule.type || 'custom',
          conditions: parsed.rule.conditions || {},
          actions: parsed.rule.actions || {},
          active: true
        },
        explanation: parsed.explanation || 'Rule generated from natural language instruction',
        confidence: parsed.confidence || 0.7
      };
    } catch (error) {
      // Fallback parsing if JSON is malformed
      return {
        rule: {
          name: 'Generated Rule',
          description: content.substring(0, 200),
          type: 'custom',
          conditions: {},
          actions: {},
          active: true
        },
        explanation: 'Rule generated from natural language instruction',
        confidence: 0.5
      };
    }
  }

  private parseCleaningSuggestions(content: string): DataCleaningSuggestion[] {
    try {
      return JSON.parse(content);
    } catch (error) {
      console.error('Error parsing cleaning suggestions:', error);
      return [];
    }
  }
}

// Singleton instance
let aiServiceInstance: AIService | null = null;

export const getAIService = (apiKey?: string): AIService => {
  if (!aiServiceInstance && apiKey) {
    aiServiceInstance = new AIService(apiKey);
  }
  if (!aiServiceInstance) {
    throw new Error('AI Service not initialized. Please provide an API key.');
  }
  return aiServiceInstance;
};

export const initializeAIService = (apiKey: string, model?: string): void => {
  aiServiceInstance = new AIService(apiKey, model);
};