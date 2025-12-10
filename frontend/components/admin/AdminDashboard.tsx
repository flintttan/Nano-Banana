'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { UserManagement } from './UserManagement';
import { Statistics } from './Statistics';
import { Announcements } from './Announcements';
import { Inspirations } from './Inspirations';
import {
  Users,
  BarChart3,
  Megaphone,
  Lightbulb,
  Settings,
  Shield
} from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('users');

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-8 w-8 text-primary-500" />
          <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
        </div>
        <p className="text-gray-400">
          Manage users, view statistics, and configure system settings
        </p>
      </div>

      {/* Stats Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gray-900 border-gray-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Total Users</p>
              <p className="text-2xl font-bold text-white mt-1">
                <Statistics display="total-users" />
              </p>
            </div>
            <div className="h-12 w-12 bg-primary-500/10 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-primary-500" />
            </div>
          </div>
        </Card>

        <Card className="bg-gray-900 border-gray-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Active Users</p>
              <p className="text-2xl font-bold text-white mt-1">
                <Statistics display="active-users" />
              </p>
            </div>
            <div className="h-12 w-12 bg-green-500/10 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-green-500" />
            </div>
          </div>
        </Card>

        <Card className="bg-gray-900 border-gray-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Total Creations</p>
              <p className="text-2xl font-bold text-white mt-1">
                <Statistics display="total-creations" />
              </p>
            </div>
            <div className="h-12 w-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-purple-500" />
            </div>
          </div>
        </Card>

        <Card className="bg-gray-900 border-gray-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Total Check-ins</p>
              <p className="text-2xl font-bold text-white mt-1">
                <Statistics display="total-checkins" />
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-blue-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Card className="bg-gray-900 border-gray-800">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b border-gray-800 px-6 py-4">
            <TabsList className="bg-gray-950">
              <TabsTrigger
                value="users"
                className="data-[state=active]:bg-gray-800 data-[state=active]:text-white"
              >
                <Users className="h-4 w-4 mr-2" />
                User Management
              </TabsTrigger>
              <TabsTrigger
                value="statistics"
                className="data-[state=active]:bg-gray-800 data-[state=active]:text-white"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Statistics
              </TabsTrigger>
              <TabsTrigger
                value="announcements"
                className="data-[state=active]:bg-gray-800 data-[state=active]:text-white"
              >
                <Megaphone className="h-4 w-4 mr-2" />
                Announcements
              </TabsTrigger>
              <TabsTrigger
                value="inspirations"
                className="data-[state=active]:bg-gray-800 data-[state=active]:text-white"
              >
                <Lightbulb className="h-4 w-4 mr-2" />
                Inspirations
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-6">
            <TabsContent value="users" className="mt-0">
              <UserManagement />
            </TabsContent>

            <TabsContent value="statistics" className="mt-0">
              <Statistics />
            </TabsContent>

            <TabsContent value="announcements" className="mt-0">
              <Announcements />
            </TabsContent>

            <TabsContent value="inspirations" className="mt-0">
              <Inspirations />
            </TabsContent>
          </div>
        </Tabs>
      </Card>
    </div>
  );
}
