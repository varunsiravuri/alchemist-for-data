'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Upload, 
  Users, 
  UserCheck, 
  ClipboardList, 
  Shield, 
  Settings, 
  Download,
  Database,
  Zap,
  Home,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Upload Data', href: '/upload', icon: Upload },
  { name: 'Clients', href: '/clients', icon: Users },
  { name: 'Workers', href: '/workers', icon: UserCheck },
  { name: 'Tasks', href: '/tasks', icon: ClipboardList },
  { name: 'Validations', href: '/validations', icon: Shield },
  { name: 'AI Assistant', href: '/ai-assistant', icon: Sparkles },
  { name: 'Rules', href: '/rules', icon: Settings },
  { name: 'Prioritization', href: '/prioritization', icon: Zap },
  { name: 'Export', href: '/export', icon: Download },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-white shadow-lg">
      <div className="flex h-16 items-center justify-center border-b px-4">
        <div className="flex items-center gap-2">
          <Database className="h-8 w-8 text-primary" />
          <h1 className="text-xl font-bold text-gray-900">Data Alchemist</h1>
        </div>
      </div>
      
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <item.icon
                className={cn(
                  'mr-3 h-5 w-5 flex-shrink-0',
                  isActive ? 'text-primary-foreground' : 'text-gray-500'
                )}
              />
              {item.name}
              {item.name === 'AI Assistant' && (
                <Sparkles className="ml-auto h-3 w-3 text-purple-500" />
              )}
            </Link>
          );
        })}
      </nav>
      
      <div className="border-t p-4">
        <div className="text-xs text-gray-500">
          Transform messy data into clean, validated resources with AI
        </div>
      </div>
    </div>
  );
}