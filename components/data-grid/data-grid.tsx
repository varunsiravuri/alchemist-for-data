'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Edit2, 
  Save, 
  X, 
  AlertTriangle,
  CheckCircle,
  Search,
  Filter
} from 'lucide-react';
import { Client, Worker, Task, ValidationError } from '@/lib/types';
import { useDataStore } from '@/lib/store';
import { validationEngine } from '@/lib/validation';
import { toast } from 'sonner';

interface DataGridProps {
  entityType: 'clients' | 'workers' | 'tasks';
  data: (Client | Worker | Task)[];
  onDataChange: (data: any[]) => void;
}

export function DataGrid({ entityType, data, onDataChange }: DataGridProps) {
  const { validationErrors, setValidationErrors } = useDataStore();
  const [editingCell, setEditingCell] = useState<{ rowIndex: number; field: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const entityErrors = validationErrors.filter(e => e.entityType === entityType.slice(0, -1) as any);
  
  const getFieldsForEntity = () => {
    switch (entityType) {
      case 'clients':
        return ['id', 'name', 'priority', 'requestedTaskIds', 'groupTag', 'attributesJson', 'email', 'phone'];
      case 'workers':
        return ['id', 'name', 'skills', 'availableSlots', 'maxLoadPerPhase', 'workerGroup', 'qualificationLevel', 'email'];
      case 'tasks':
        return ['id', 'name', 'category', 'duration', 'requiredSkills', 'preferredPhases', 'maxConcurrent', 'status'];
      default:
        return [];
    }
  };

  const fields = getFieldsForEntity();

  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    
    return data.filter(item => {
      return Object.values(item).some(value => 
        String(value).toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [data, searchQuery]);

  const getCellError = (rowIndex: number, field: string) => {
    const item = data[rowIndex];
    return entityErrors.find(e => e.entityId === item.id && e.field === field);
  };

  const handleCellEdit = (rowIndex: number, field: string, currentValue: any) => {
    setEditingCell({ rowIndex, field });
    setEditValue(Array.isArray(currentValue) ? currentValue.join(', ') : String(currentValue || ''));
  };

  const handleSaveEdit = async () => {
    if (!editingCell) return;

    const { rowIndex, field } = editingCell;
    const updatedData = [...data];
    const item = { ...updatedData[rowIndex] };

    // Parse the value based on field type
    let parsedValue: any = editValue;
    
    if (field === 'skills' || field === 'requiredSkills' || field === 'dependencies' || field === 'requestedTaskIds') {
      parsedValue = editValue.split(',').map(s => s.trim()).filter(s => s.length > 0);
    } else if (field === 'priority' || field === 'duration' || field === 'maxConcurrent' || field === 'maxLoadPerPhase' || field === 'qualificationLevel') {
      parsedValue = parseInt(editValue) || 0;
    } else if (field === 'hourlyRate' || field === 'estimatedHours') {
      parsedValue = parseFloat(editValue) || 0;
    } else if (field === 'preferredPhases' || field === 'availableSlots') {
      parsedValue = editValue.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    }

    (item as any)[field] = parsedValue;
    updatedData[rowIndex] = item;

    // Run validation on the updated item
    let newErrors: ValidationError[] = [];
    if (entityType === 'clients') {
      newErrors = validationEngine.validateClients([item as Client]);
    } else if (entityType === 'workers') {
      newErrors = validationEngine.validateWorkers([item as Worker]);
    } else if (entityType === 'tasks') {
      const { clients, workers } = useDataStore.getState();
      newErrors = validationEngine.validateTasks([item as Task], clients, workers);
    }

    // Update validation errors
    const otherErrors = validationErrors.filter(e => 
      !(e.entityId === item.id && e.field === field)
    );
    setValidationErrors([...otherErrors, ...newErrors]);

    onDataChange(updatedData);
    setEditingCell(null);
    setEditValue('');
    
    if (newErrors.length === 0) {
      toast.success('Cell updated successfully');
    } else {
      toast.warning('Cell updated with validation warnings');
    }
  };

  const handleCancelEdit = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const renderCell = (item: any, field: string, rowIndex: number) => {
    const isEditing = editingCell?.rowIndex === rowIndex && editingCell?.field === field;
    const error = getCellError(rowIndex, field);
    const value = item[field];

    if (isEditing) {
      return (
        <div className="flex items-center gap-2">
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="h-8 text-xs"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveEdit();
              if (e.key === 'Escape') handleCancelEdit();
            }}
            autoFocus
          />
          <Button size="sm" variant="ghost" onClick={handleSaveEdit}>
            <Save className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      );
    }

    const displayValue = Array.isArray(value) ? value.join(', ') : String(value || '');

    return (
      <div
        className={`group cursor-pointer p-2 rounded min-h-[32px] flex items-center justify-between ${
          error ? (error.severity === 'error' ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200') : 'hover:bg-gray-50'
        }`}
        onClick={() => handleCellEdit(rowIndex, field, value)}
      >
        <span className="text-sm truncate">{displayValue}</span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
          {error && (
            <AlertTriangle className={`h-3 w-3 ${error.severity === 'error' ? 'text-red-500' : 'text-yellow-500'}`} />
          )}
          <Edit2 className="h-3 w-3 text-gray-400" />
        </div>
      </div>
    );
  };

  const getFieldLabel = (field: string) => {
    const fieldLabels: Record<string, string> = {
      'id': 'ID',
      'name': 'Name',
      'priority': 'Priority Level',
      'requestedTaskIds': 'Requested Task IDs',
      'groupTag': 'Group Tag',
      'attributesJson': 'Attributes JSON',
      'skills': 'Skills',
      'availableSlots': 'Available Slots',
      'maxLoadPerPhase': 'Max Load Per Phase',
      'workerGroup': 'Worker Group',
      'qualificationLevel': 'Qualification Level',
      'category': 'Category',
      'duration': 'Duration',
      'requiredSkills': 'Required Skills',
      'preferredPhases': 'Preferred Phases',
      'maxConcurrent': 'Max Concurrent',
      'status': 'Status',
      'email': 'Email',
      'phone': 'Phone'
    };
    return fieldLabels[field] || field.replace(/([A-Z])/g, ' $1').trim();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="capitalize">{entityType} Data Grid</CardTitle>
            <CardDescription>
              Click any cell to edit. Changes are validated in real-time according to the data entity specifications.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{data.length} records</Badge>
            <Badge variant={entityErrors.length > 0 ? "destructive" : "default"}>
              {entityErrors.length} issues
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search data..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {entityErrors.length > 0 && (
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {entityErrors.length} validation issue(s) found. Click on highlighted cells to fix them.
            </AlertDescription>
          </Alert>
        )}

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                {fields.map((field) => (
                  <TableHead key={field} className="font-medium">
                    {getFieldLabel(field)}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item, rowIndex) => (
                <TableRow key={item.id}>
                  {fields.map((field) => (
                    <TableCell key={field} className="p-0">
                      {renderCell(item, field, rowIndex)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredData.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {searchQuery ? 'No matching records found' : 'No data available'}
          </div>
        )}
      </CardContent>
    </Card>
  );
}