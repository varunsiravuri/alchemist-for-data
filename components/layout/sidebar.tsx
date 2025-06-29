'use client';

import React, { useState } from 'react';
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

// Clean Alchemist Logo Component without square border
function AlchemistLogo({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 40 40" 
      className={cn("w-8 h-8", className)}
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer Circle */}
      <circle 
        cx="20" 
        cy="20" 
        r="18" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        fill="none"
        opacity="0.8"
      />
      
      {/* Inner Triangle */}
      <path 
        d="M20 8 L30 28 L10 28 Z" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        fill="none"
        opacity="0.9"
      />
      
      {/* Horizontal Line */}
      <line 
        x1="6" 
        y1="20" 
        x2="34" 
        y2="20" 
        stroke="currentColor" 
        strokeWidth="1.5"
        opacity="0.7"
      />
      
      {/* Vertical Line */}
      <line 
        x1="20" 
        y1="4" 
        x2="20" 
        y2="36" 
        stroke="currentColor" 
        strokeWidth="1.5"
        opacity="0.7"
      />
      
      {/* Center Dot */}
      <circle 
        cx="20" 
        cy="20" 
        r="2" 
        fill="currentColor"
      />
    </svg>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div 
      className={cn(
        "flex h-full flex-col glass-nav transition-all duration-300 ease-in-out",
        isExpanded ? "w-64" : "w-16"
      )}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-center px-3 border-b border-white/10">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative">
            <AlchemistLogo className="text-white flex-shrink-0" />
          </div>
          <h1 className={cn(
            "text-xl font-bold text-white transition-all duration-300",
            isExpanded ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"
          )}>
            Data Alchemist
          </h1>
        </Link>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 space-y-2 px-3 py-6">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'nav-item-modern',
                isActive && 'nav-item-active-modern',
                !isExpanded && 'justify-center px-3'
              )}
              title={!isExpanded ? item.name : undefined}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              <span className={cn(
                "transition-all duration-300 font-medium",
                isExpanded ? "opacity-100 w-auto ml-3" : "opacity-0 w-0 overflow-hidden ml-0"
              )}>
                {item.name}
              </span>
              {item.name === 'AI Assistant' && isExpanded && (
                <div className="ml-auto">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                </div>
              )}
            </Link>
          );
        })}
      </nav>
      
      {/* Footer */}
      <div className={cn(
        "border-t border-white/10 p-4 transition-all duration-300",
        isExpanded ? "opacity-100" : "opacity-0"
      )}>
        <div className="text-xs text-white/50 text-center">
          Transform data with AI
        </div>
      </div>
    </div>
  );
}