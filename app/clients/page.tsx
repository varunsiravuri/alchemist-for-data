'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Plus,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import { useDataStore } from '@/lib/store';
import Link from 'next/link';

export default function ClientsPage() {
  const { clients } = useDataStore();

  if (clients.length === 0) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-full">
          <div className="text-center max-w-md">
            <Users className="h-24 w-24 text-gray-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Clients Found</h2>
            <p className="text-gray-600 mb-8">
              Upload your client data to get started with managing your client information.
            </p>
            <Link href="/upload">
              <Button size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                Upload Client Data
              </Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Clients</h2>
            <p className="text-gray-600">
              Manage your client information and priorities
            </p>
          </div>
          <Link href="/upload">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Clients
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map((client) => (
            <Card key={client.id} className="card-hover">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{client.name}</CardTitle>
                  <Badge variant={client.priority >= 4 ? 'destructive' : client.priority >= 3 ? 'default' : 'secondary'}>
                    Priority {client.priority}
                  </Badge>
                </div>
                <CardDescription>ID: {client.id}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {client.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4" />
                      {client.email}
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      {client.phone}
                    </div>
                  )}
                  {client.address && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      {client.address}
                    </div>
                  )}
                  
                  <div className="flex gap-2 pt-4">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}