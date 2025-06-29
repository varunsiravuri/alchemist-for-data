'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { useDataStore } from '@/lib/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  UserCheck, 
  ClipboardList, 
  AlertTriangle, 
  CheckCircle,
  Upload,
  Database,
  TrendingUp,
  Sparkles,
  ArrowRight,
  BarChart3,
  Zap,
  Shield,
  Star,
  Play
} from 'lucide-react';
import Link from 'next/link';

// Clean Alchemist Logo Component without square border
function AlchemistLogo({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 80 80" 
      className={className}
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer Circle */}
      <circle 
        cx="40" 
        cy="40" 
        r="36" 
        stroke="currentColor" 
        strokeWidth="2" 
        fill="none"
        opacity="0.6"
      />
      
      {/* Inner Triangle */}
      <path 
        d="M40 16 L60 56 L20 56 Z" 
        stroke="currentColor" 
        strokeWidth="2" 
        fill="none"
        opacity="0.8"
      />
      
      {/* Horizontal Line */}
      <line 
        x1="12" 
        y1="40" 
        x2="68" 
        y2="40" 
        stroke="currentColor" 
        strokeWidth="2"
        opacity="0.5"
      />
      
      {/* Vertical Line */}
      <line 
        x1="40" 
        y1="8" 
        x2="40" 
        y2="72" 
        stroke="currentColor" 
        strokeWidth="2"
        opacity="0.5"
      />
      
      {/* Center Dot */}
      <circle 
        cx="40" 
        cy="40" 
        r="3" 
        fill="currentColor"
      />
    </svg>
  );
}

export default function Dashboard() {
  const { clients, workers, tasks, validationErrors, isLoading } = useDataStore();
  
  const totalEntities = clients.length + workers.length + tasks.length;
  const errorCount = validationErrors.filter(e => e.severity === 'error').length;
  const warningCount = validationErrors.filter(e => e.severity === 'warning').length;
  const healthScore = totalEntities > 0 ? Math.max(0, 100 - (errorCount * 10) - (warningCount * 5)) : 0;

  const stats = [
    {
      title: 'Clients',
      value: clients.length,
      icon: Users,
      color: 'text-blue-400',
      bgGradient: 'from-blue-500/20 to-blue-600/20',
      href: '/clients',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Workers',
      value: workers.length,
      icon: UserCheck,
      color: 'text-green-400',
      bgGradient: 'from-green-500/20 to-green-600/20',
      href: '/workers',
      change: '+8%',
      changeType: 'positive'
    },
    {
      title: 'Tasks',
      value: tasks.length,
      icon: ClipboardList,
      color: 'text-purple-400',
      bgGradient: 'from-purple-500/20 to-purple-600/20',
      href: '/tasks',
      change: '+24%',
      changeType: 'positive'
    },
    {
      title: 'Data Health',
      value: `${healthScore}%`,
      icon: Shield,
      color: errorCount > 0 ? 'text-red-400' : warningCount > 0 ? 'text-yellow-400' : 'text-green-400',
      bgGradient: errorCount > 0 ? 'from-red-500/20 to-red-600/20' : warningCount > 0 ? 'from-yellow-500/20 to-yellow-600/20' : 'from-green-500/20 to-green-600/20',
      href: '/validations',
      change: errorCount > 0 ? 'Issues found' : 'All clear',
      changeType: errorCount > 0 ? 'negative' : 'positive'
    }
  ];

  if (totalEntities === 0) {
    return (
      <MainLayout>
        <div className="min-h-screen dark-gradient-bg">
          {/* Hero Section */}
          <div className="hero-section section-padding">
            <div className="container-modern">
              <div className="text-center max-w-5xl mx-auto animate-fade-in-up">
                <div className="flex justify-center mb-8">
                  <div className="relative">
                    <AlchemistLogo className="w-32 h-32 text-white floating-element" />
                    <div className="absolute inset-0 w-32 h-32 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-2xl"></div>
                  </div>
                </div>
                
                <h1 className="heading-hero gradient-text mb-8">
                  Transform Data Into Intelligence
                </h1>
                
                <p className="body-lg mb-12 max-w-3xl mx-auto">
                  Data Alchemist revolutionizes how you handle messy CSV and Excel files. 
                  Our AI-powered platform transforms chaotic data into clean, validated datasets 
                  with intelligent insights and automated processing.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
                  <Link href="/upload">
                    <Button size="lg" className="modern-button gap-3 text-lg px-8 py-4 interactive-hover">
                      <Play className="h-6 w-6" />
                      Start Transforming Data
                    </Button>
                  </Link>
                  <Link href="/ai-assistant">
                    <Button size="lg" className="modern-button-secondary gap-3 text-lg px-8 py-4 interactive-hover">
                      <Sparkles className="h-6 w-6" />
                      Explore AI Features
                    </Button>
                  </Link>
                </div>

                {/* Trust Indicators */}
                <div className="flex items-center justify-center gap-8 text-white/60 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <span>Trusted by 50K+ users</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-400" />
                    <span>Enterprise Security</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="section-padding">
            <div className="container-modern">
              <div className="text-center mb-16">
                <h2 className="heading-xl text-white mb-6">Get Started in Minutes</h2>
                <p className="body-lg max-w-2xl mx-auto">
                  Follow these simple steps to transform your data with AI-powered intelligence
                </p>
              </div>

              <div className="feature-grid">
                <div className="glass-card-hover p-8 text-center animate-slide-in-left">
                  <div className="step-indicator mx-auto mb-6">1</div>
                  <h3 className="heading-sm text-white mb-4">Upload Your Files</h3>
                  <p className="body-md">
                    Drag and drop CSV or Excel files. Our AI intelligently parses and maps your data columns automatically.
                  </p>
                </div>

                <div className="glass-card-hover p-8 text-center animate-slide-in-left" style={{ animationDelay: '0.2s' }}>
                  <div className="step-indicator mx-auto mb-6">2</div>
                  <h3 className="heading-sm text-white mb-4">AI Validation & Cleaning</h3>
                  <p className="body-md">
                    Advanced AI algorithms detect issues and suggest intelligent fixes for data quality problems.
                  </p>
                </div>

                <div className="glass-card-hover p-8 text-center animate-slide-in-left" style={{ animationDelay: '0.4s' }}>
                  <div className="step-indicator mx-auto mb-6">3</div>
                  <h3 className="heading-sm text-white mb-4">Export Clean Data</h3>
                  <p className="body-md">
                    Download your cleaned, validated data in multiple formats ready for analysis and insights.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Features Showcase */}
          <div className="section-padding">
            <div className="container-modern">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="animate-slide-in-left">
                  <h2 className="heading-xl text-white mb-6">
                    Powered by Advanced AI
                  </h2>
                  <p className="body-lg mb-8">
                    Our intelligent algorithms understand your data structure, detect patterns, 
                    and provide actionable insights to improve data quality and processing efficiency.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-white/80">Intelligent column mapping and data type detection</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <span className="text-white/80">Advanced validation with smart error correction</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                      <span className="text-white/80">Natural language search and query capabilities</span>
                    </div>
                  </div>
                </div>
                
                <div className="glass-card p-8 animate-fade-in-up">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-white/80">AI Processing</span>
                      <span className="text-green-400">98% Accuracy</span>
                    </div>
                    <div className="progress-modern h-2">
                      <div className="progress-fill" style={{ width: '98%' }}></div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-white/80">Data Quality</span>
                      <span className="text-blue-400">95% Clean</span>
                    </div>
                    <div className="progress-modern h-2">
                      <div className="progress-fill" style={{ width: '95%' }}></div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-white/80">Processing Speed</span>
                      <span className="text-purple-400">10x Faster</span>
                    </div>
                    <div className="progress-modern h-2">
                      <div className="progress-fill" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen dark-gradient-bg">
        <div className="container-modern section-padding">
          <div className="space-y-8 animate-fade-in-up">
            {/* Welcome Header */}
            <div className="glass-card p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="heading-md text-white mb-2">Welcome back</h2>
                  <p className="body-md">
                    Here's what's happening with your data today
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="status-indicator status-online"></div>
                  <span className="body-sm text-green-400">System healthy</span>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <Link key={stat.title} href={stat.href}>
                  <div className="metric-card-modern group cursor-pointer" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-r ${stat.bgGradient} rounded-2xl flex items-center justify-center`}>
                        <stat.icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                      <ArrowRight className="h-4 w-4 text-white/40 group-hover:text-white/80 transition-colors" />
                    </div>
                    
                    <div className="space-y-2">
                      <p className="body-sm text-white/60">{stat.title}</p>
                      <p className="text-3xl font-bold text-white">{stat.value}</p>
                      <div className="flex items-center gap-2">
                        <span className={`body-sm ${stat.changeType === 'positive' ? 'text-green-400' : 'text-red-400'}`}>
                          {stat.change}
                        </span>
                        <span className="body-sm text-white/40">vs last week</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Data Health Score */}
            <div className="glass-card p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="heading-sm text-white mb-2">Data Health Score</h3>
                  <p className="body-md">
                    Overall quality and completeness of your data
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold gradient-text">{healthScore}%</div>
                  <div className="body-sm text-white/50">Health Score</div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="progress-modern h-4">
                  <div className="progress-fill" style={{ width: `${healthScore}%` }}></div>
                </div>
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-green-400">{totalEntities - errorCount - warningCount} Clean Records</span>
                  </div>
                  {warningCount > 0 && (
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-400" />
                      <span className="text-yellow-400">{warningCount} Warnings</span>
                    </div>
                  )}
                  {errorCount > 0 && (
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-400" />
                      <span className="text-red-400">{errorCount} Errors</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="glass-card p-8">
                <h3 className="heading-sm text-white mb-6">Data Overview</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="body-md text-white/70">Total Entities</span>
                    <span className="badge-modern">{totalEntities}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="body-md text-white/70">Active Tasks</span>
                    <span className="badge-info">
                      {tasks.filter(t => t.status === 'pending' || t.status === 'in-progress').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="body-md text-white/70">Available Workers</span>
                    <span className="badge-success">{workers.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="body-md text-white/70">High Priority Tasks</span>
                    <span className="badge-warning">
                      {tasks.filter(t => t.priority >= 4).length}
                    </span>
                  </div>
                </div>
              </div>

              <div className="glass-card p-8">
                <h3 className="heading-sm text-white mb-6">Quick Actions</h3>
                <div className="space-y-3">
                  <Link href="/upload">
                    <Button variant="ghost" className="w-full justify-start h-auto p-4 text-white hover:bg-white/10 rounded-xl">
                      <Upload className="h-5 w-5 mr-3 text-blue-400" />
                      <div className="text-left">
                        <div className="font-medium">Upload More Data</div>
                        <div className="text-xs text-white/60">Add new CSV or Excel files</div>
                      </div>
                    </Button>
                  </Link>
                  
                  <Link href="/ai-assistant">
                    <Button variant="ghost" className="w-full justify-start h-auto p-4 text-white hover:bg-white/10 rounded-xl">
                      <Sparkles className="h-5 w-5 mr-3 text-purple-400" />
                      <div className="text-left">
                        <div className="font-medium">AI Assistant</div>
                        <div className="text-xs text-white/60">Get intelligent insights</div>
                      </div>
                    </Button>
                  </Link>
                  
                  <Link href="/validations">
                    <Button variant="ghost" className="w-full justify-start h-auto p-4 text-white hover:bg-white/10 rounded-xl">
                      <AlertTriangle className="h-5 w-5 mr-3 text-yellow-400" />
                      <div className="text-left">
                        <div className="font-medium">Review Validations</div>
                        <div className="text-xs text-white/60">Check data quality issues</div>
                      </div>
                    </Button>
                  </Link>
                  
                  <Link href="/export">
                    <Button variant="ghost" className="w-full justify-start h-auto p-4 text-white hover:bg-white/10 rounded-xl">
                      <TrendingUp className="h-5 w-5 mr-3 text-green-400" />
                      <div className="text-left">
                        <div className="font-medium">Export Clean Data</div>
                        <div className="text-xs text-white/60">Download processed files</div>
                      </div>
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}