'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Search, User, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDataStore } from '@/lib/store';

const pageLabels: Record<string, string> = {
  '/': 'Data Alchemist',
  '/upload': 'Data Alchemist - Upload Data',
  '/clients': 'Data Alchemist - Clients',
  '/workers': 'Data Alchemist - Workers',
  '/tasks': 'Data Alchemist - Tasks',
  '/validations': 'Data Alchemist - Validations',
  '/ai-assistant': 'Data Alchemist - AI Assistant',
  '/rules': 'Data Alchemist - Business Rules',
  '/prioritization': 'Data Alchemist - Prioritization',
  '/export': 'Data Alchemist - Export',
};

export function Header() {
  const pathname = usePathname();
  const { validationErrors } = useDataStore();
  const pageTitle = pageLabels[pathname] || 'Data Alchemist';
  const errorCount = validationErrors.filter(e => e.severity === 'error').length;
  const warningCount = validationErrors.filter(e => e.severity === 'warning').length;

  const handleProfileClick = () => {
    // For now, just show an alert. In a real app, this would open a profile menu
    alert('Profile functionality - In a real application, this would open user profile options');
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-white/10 bg-black/20 backdrop-blur-xl px-6">
      <div className="flex items-center gap-4">
        <h1 className="heading-sm text-white">{pageTitle}</h1>
        {(errorCount > 0 || warningCount > 0) && (
          <div className="flex items-center gap-2">
            {errorCount > 0 && (
              <span className="badge-error">
                {errorCount} errors
              </span>
            )}
            {warningCount > 0 && (
              <span className="badge-warning">
                {warningCount} warnings
              </span>
            )}
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-4">
        {pathname !== '/' && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <Input
              placeholder="Search data..."
              className="modern-input w-64 pl-10"
            />
          </div>
        )}
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-white hover:bg-white/10 rounded-xl"
          onClick={handleProfileClick}
          title="User Profile"
        >
          <User className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}