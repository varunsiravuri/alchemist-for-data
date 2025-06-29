'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Bell, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDataStore } from '@/lib/store';

const pageLabels: Record<string, string> = {
  '/': 'Dashboard',
  '/upload': 'Upload Data',
  '/clients': 'Clients',
  '/workers': 'Workers',
  '/tasks': 'Tasks',
  '/validations': 'Validations',
  '/rules': 'Business Rules',
  '/prioritization': 'Prioritization',
  '/export': 'Export',
};

export function Header() {
  const pathname = usePathname();
  const { validationErrors } = useDataStore();
  const pageTitle = pageLabels[pathname] || 'Data Alchemist';
  const errorCount = validationErrors.filter(e => e.severity === 'error').length;
  const warningCount = validationErrors.filter(e => e.severity === 'warning').length;

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-semibold text-gray-900">{pageTitle}</h1>
        {(errorCount > 0 || warningCount > 0) && (
          <div className="flex items-center gap-2">
            {errorCount > 0 && (
              <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                {errorCount} errors
              </span>
            )}
            {warningCount > 0 && (
              <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                {warningCount} warnings
              </span>
            )}
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search data..."
            className="w-64 pl-10"
          />
        </div>
        
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {(errorCount + warningCount) > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
              {Math.min(errorCount + warningCount, 9)}
            </span>
          )}
        </Button>
        
        <Button variant="ghost" size="icon">
          <User className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}