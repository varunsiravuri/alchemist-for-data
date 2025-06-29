'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Search, 
  Loader2, 
  Filter,
  MessageCircle,
  Lightbulb
} from 'lucide-react';
import { useDataStore } from '@/lib/store';
import { Client, Worker, Task } from '@/lib/types';

interface SearchResult {
  type: 'client' | 'worker' | 'task';
  data: Client | Worker | Task;
  relevance: number;
}

export function NaturalLanguageSearch() {
  const { clients, workers, tasks } = useDataStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [interpretation, setInterpretation] = useState('');

  const exampleQueries = [
    "All tasks having a Duration of more than 1 phase and having phase 2 in their Preferred Phases list",
    "Workers with JavaScript skills and available in phase 1",
    "High priority clients with requested tasks",
    "Tasks with MaxConcurrent greater than 1",
    "Workers who can handle more than 3 tasks per phase",
    "Clients with priority level 5",
    "Tasks requiring Python skills in category Development",
    "Workers available in phases 2 and 3 with qualification level above 2"
  ];

  const parseNaturalLanguageQuery = (query: string): any => {
    const normalizedQuery = query.toLowerCase();
    const filters: any = {};

    // Parse entity type
    if (normalizedQuery.includes('task')) filters.entityType = 'task';
    else if (normalizedQuery.includes('worker') || normalizedQuery.includes('employee')) filters.entityType = 'worker';
    else if (normalizedQuery.includes('client') || normalizedQuery.includes('customer')) filters.entityType = 'client';

    // Parse duration conditions
    const durationMatch = normalizedQuery.match(/duration.*?(\d+)/);
    if (durationMatch) {
      const value = parseInt(durationMatch[1]);
      if (normalizedQuery.includes('more than') || normalizedQuery.includes('greater than')) {
        filters.durationGt = value;
      } else if (normalizedQuery.includes('less than')) {
        filters.durationLt = value;
      } else {
        filters.duration = value;
      }
    }

    // Parse priority conditions
    if (normalizedQuery.includes('high priority')) filters.priority = [4, 5];
    else if (normalizedQuery.includes('low priority')) filters.priority = [1, 2];
    else if (normalizedQuery.includes('medium priority')) filters.priority = [3];
    else if (normalizedQuery.includes('priority level')) {
      const priorityMatch = normalizedQuery.match(/priority level (\d+)/);
      if (priorityMatch) {
        filters.priority = [parseInt(priorityMatch[1])];
      }
    }

    // Parse phase conditions
    const phaseMatch = normalizedQuery.match(/phase\s+(\d+)/);
    if (phaseMatch) {
      filters.hasPhase = parseInt(phaseMatch[1]);
    }

    // Parse multiple phases
    const phasesMatch = normalizedQuery.match(/phases?\s+([\d\s,and]+)/);
    if (phasesMatch) {
      const phases = phasesMatch[1].match(/\d+/g)?.map(Number) || [];
      if (phases.length > 0) {
        filters.hasPhases = phases;
      }
    }

    // Parse skill conditions
    const skillMatch = normalizedQuery.match(/(\w+)\s+skill/);
    if (skillMatch) {
      filters.hasSkill = skillMatch[1];
    }

    // Parse MaxConcurrent conditions
    const maxConcurrentMatch = normalizedQuery.match(/maxconcurrent.*?(\d+)/);
    if (maxConcurrentMatch) {
      const value = parseInt(maxConcurrentMatch[1]);
      if (normalizedQuery.includes('greater than') || normalizedQuery.includes('more than')) {
        filters.maxConcurrentGt = value;
      } else {
        filters.maxConcurrent = value;
      }
    }

    // Parse MaxLoadPerPhase conditions
    const maxLoadMatch = normalizedQuery.match(/(\d+)\s+tasks?\s+per\s+phase/);
    if (maxLoadMatch) {
      const value = parseInt(maxLoadMatch[1]);
      if (normalizedQuery.includes('more than')) {
        filters.maxLoadPerPhaseGt = value;
      } else {
        filters.maxLoadPerPhase = value;
      }
    }

    // Parse qualification level
    const qualificationMatch = normalizedQuery.match(/qualification level.*?(\d+)/);
    if (qualificationMatch) {
      const value = parseInt(qualificationMatch[1]);
      if (normalizedQuery.includes('above') || normalizedQuery.includes('greater than')) {
        filters.qualificationLevelGt = value;
      } else {
        filters.qualificationLevel = value;
      }
    }

    // Parse category
    const categoryMatch = normalizedQuery.match(/category\s+(\w+)/);
    if (categoryMatch) {
      filters.category = categoryMatch[1];
    }

    // Parse requested tasks condition
    if (normalizedQuery.includes('requested tasks') || normalizedQuery.includes('requestedtaskids')) {
      filters.hasRequestedTasks = true;
    }

    return filters;
  };

  const applyFilters = (data: any[], filters: any, entityType: string): any[] => {
    return data.filter(item => {
      // Duration filters
      if (filters.durationGt && (!item.duration || item.duration <= filters.durationGt)) return false;
      if (filters.durationLt && (!item.duration || item.duration >= filters.durationLt)) return false;
      if (filters.duration && item.duration !== filters.duration) return false;

      // Priority filters
      if (filters.priority && !filters.priority.includes(item.priority)) return false;

      // Phase filters
      if (filters.hasPhase) {
        const phases = item.preferredPhases || item.availableSlots || [];
        if (!phases.includes(filters.hasPhase)) return false;
      }

      if (filters.hasPhases) {
        const phases = item.preferredPhases || item.availableSlots || [];
        if (!filters.hasPhases.every((phase: number) => phases.includes(phase))) return false;
      }

      // Skill filters
      if (filters.hasSkill) {
        const skills = item.skills || item.requiredSkills || [];
        if (!skills.some((skill: string) => skill.toLowerCase().includes(filters.hasSkill.toLowerCase()))) return false;
      }

      // MaxConcurrent filters
      if (filters.maxConcurrentGt && (!item.maxConcurrent || item.maxConcurrent <= filters.maxConcurrentGt)) return false;
      if (filters.maxConcurrent && item.maxConcurrent !== filters.maxConcurrent) return false;

      // MaxLoadPerPhase filters
      if (filters.maxLoadPerPhaseGt && (!item.maxLoadPerPhase || item.maxLoadPerPhase <= filters.maxLoadPerPhaseGt)) return false;
      if (filters.maxLoadPerPhase && item.maxLoadPerPhase !== filters.maxLoadPerPhase) return false;

      // Qualification level filters
      if (filters.qualificationLevelGt && (!item.qualificationLevel || item.qualificationLevel <= filters.qualificationLevelGt)) return false;
      if (filters.qualificationLevel && item.qualificationLevel !== filters.qualificationLevel) return false;

      // Category filter
      if (filters.category && (!item.category || !item.category.toLowerCase().includes(filters.category.toLowerCase()))) return false;

      // Requested tasks filter
      if (filters.hasRequestedTasks && (!item.requestedTaskIds || item.requestedTaskIds.length === 0)) return false;

      return true;
    });
  };

  const generateInterpretation = (filters: any): string => {
    const parts = [];
    
    if (filters.entityType) {
      parts.push(`Searching for ${filters.entityType}s`);
    }
    
    if (filters.durationGt) {
      parts.push(`with duration greater than ${filters.durationGt}`);
    }
    
    if (filters.hasPhase) {
      parts.push(`available in or preferring phase ${filters.hasPhase}`);
    }

    if (filters.hasPhases) {
      parts.push(`available in or preferring phases ${filters.hasPhases.join(', ')}`);
    }
    
    if (filters.hasSkill) {
      parts.push(`with ${filters.hasSkill} skills`);
    }
    
    if (filters.priority) {
      const priorityDesc = filters.priority.includes(5) ? 'highest priority' : 
                          filters.priority.includes(4) ? 'high priority' :
                          filters.priority.includes(1) ? 'low priority' : 'specific priority level';
      parts.push(`with ${priorityDesc}`);
    }

    if (filters.maxConcurrentGt) {
      parts.push(`with MaxConcurrent greater than ${filters.maxConcurrentGt}`);
    }

    if (filters.maxLoadPerPhaseGt) {
      parts.push(`who can handle more than ${filters.maxLoadPerPhaseGt} tasks per phase`);
    }

    if (filters.qualificationLevelGt) {
      parts.push(`with qualification level above ${filters.qualificationLevelGt}`);
    }

    if (filters.category) {
      parts.push(`in category ${filters.category}`);
    }

    if (filters.hasRequestedTasks) {
      parts.push(`with requested tasks`);
    }

    return parts.length > 0 ? parts.join(' ') : 'Searching all data';
  };

  const handleSearch = () => {
    if (!query.trim()) return;

    setIsSearching(true);
    
    try {
      const filters = parseNaturalLanguageQuery(query);
      const interpretation = generateInterpretation(filters);
      setInterpretation(interpretation);

      const searchResults: SearchResult[] = [];

      // Search clients
      if (!filters.entityType || filters.entityType === 'client') {
        const filteredClients = applyFilters(clients, filters, 'client');
        filteredClients.forEach(client => {
          searchResults.push({
            type: 'client',
            data: client,
            relevance: 0.9
          });
        });
      }

      // Search workers
      if (!filters.entityType || filters.entityType === 'worker') {
        const filteredWorkers = applyFilters(workers, filters, 'worker');
        filteredWorkers.forEach(worker => {
          searchResults.push({
            type: 'worker',
            data: worker,
            relevance: 0.9
          });
        });
      }

      // Search tasks
      if (!filters.entityType || filters.entityType === 'task') {
        const filteredTasks = applyFilters(tasks, filters, 'task');
        filteredTasks.forEach(task => {
          searchResults.push({
            type: 'task',
            data: task,
            relevance: 0.9
          });
        });
      }

      // Sort by relevance
      searchResults.sort((a, b) => b.relevance - a.relevance);
      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const renderResult = (result: SearchResult) => {
    const { type, data } = result;
    
    return (
      <div key={`${type}-${data.id}`} className="p-4 border rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="capitalize">{type}</Badge>
            <span className="font-medium">{data.name}</span>
          </div>
          <Badge variant="secondary">{Math.round(result.relevance * 100)}% match</Badge>
        </div>
        
        <div className="text-sm text-gray-600">
          ID: {data.id}
          {type === 'client' && (data as Client).priority && (
            <span className="ml-4">Priority: {(data as Client).priority}</span>
          )}
          {type === 'client' && (data as Client).requestedTaskIds && (data as Client).requestedTaskIds.length > 0 && (
            <span className="ml-4">Requested Tasks: {(data as Client).requestedTaskIds.length}</span>
          )}
          {type === 'worker' && (data as Worker).skills && (
            <span className="ml-4">Skills: {(data as Worker).skills.join(', ')}</span>
          )}
          {type === 'worker' && (data as Worker).availableSlots && (
            <span className="ml-4">Available Phases: {(data as Worker).availableSlots.join(', ')}</span>
          )}
          {type === 'task' && (data as Task).duration && (
            <span className="ml-4">Duration: {(data as Task).duration} phases</span>
          )}
          {type === 'task' && (data as Task).maxConcurrent && (
            <span className="ml-4">Max Concurrent: {(data as Task).maxConcurrent}</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-blue-600" />
          Natural Language Search
        </CardTitle>
        <CardDescription>
          Search your data using plain English queries based on the entity specifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Describe what you're looking for..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1"
          />
          <Button onClick={handleSearch} disabled={isSearching || !query.trim()}>
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>

        {interpretation && (
          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertDescription>
              <strong>Interpreted as:</strong> {interpretation}
            </AlertDescription>
          </Alert>
        )}

        {results.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Search Results</h4>
              <Badge variant="secondary">{results.length} found</Badge>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {results.map(renderResult)}
            </div>
          </div>
        )}

        {results.length === 0 && query && !isSearching && (
          <div className="text-center py-8 text-gray-500">
            No results found for your query
          </div>
        )}

        <div className="space-y-2">
          <h4 className="font-medium text-sm">Example Queries:</h4>
          <div className="flex flex-wrap gap-2">
            {exampleQueries.map((example, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => setQuery(example)}
                className="text-xs h-auto p-2 text-left"
              >
                {example}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}