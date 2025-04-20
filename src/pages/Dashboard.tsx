
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, XAxis, YAxis } from "recharts";
import { ArrowUpRight, Users, FolderOpen, CheckCircle, Clock, CreditCard, Calendar } from "lucide-react";

import { DashboardStats } from "@/types";
import { getDashboardStats } from "@/services/dashboardService";
import { useQuery } from "@tanstack/react-query";

import Dashboard from "@/components/layout/Dashboard";
import PageTransition from "@/components/ui-custom/PageTransition";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/ui-custom/EmptyState";

const DashboardPage = () => {
  const navigate = useNavigate();
  
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: getDashboardStats
  });

  if (isLoading) {
    return (
      <Dashboard>
        <PageTransition>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">Loading dashboard data...</h3>
              <p className="text-muted-foreground">Please wait while we fetch your statistics.</p>
            </div>
          </div>
        </PageTransition>
      </Dashboard>
    );
  }

  if (error) {
    return (
      <Dashboard>
        <PageTransition>
          <EmptyState 
            title="Error loading dashboard"
            description="There was a problem loading your dashboard statistics. Please try again."
            icon={<Calendar className="h-10 w-10 text-muted-foreground" />}
            action={{
              label: "Reload",
              onClick: () => window.location.reload()
            }}
          />
        </PageTransition>
      </Dashboard>
    );
  }

  const projectStatusData = [
    { name: 'Active', value: stats?.activeProjects || 0, color: '#10b981' },
    { name: 'Completed', value: stats?.completedProjects || 0, color: '#3b82f6' },
    { name: 'Other', value: (stats?.totalProjects || 0) - (stats?.activeProjects || 0) - (stats?.completedProjects || 0), color: '#6b7280' }
  ].filter(item => item.value > 0);

  const revenueData = [
    { name: 'Paid', value: stats?.paidRevenue || 0 },
    { name: 'Unpaid', value: stats?.unpaidRevenue || 0 }
  ];

  return (
    <Dashboard>
      <PageTransition>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome to your workspace dashboard
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                <FolderOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalProjects || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats?.activeProjects || 0} active projects
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Completed Projects</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.completedProjects || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats?.totalProjects 
                    ? ((stats.completedProjects / stats.totalProjects) * 100).toFixed(0) 
                    : 0}% completion rate
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalClients || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Across multiple companies
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${(stats?.totalRevenue || 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  ${(stats?.paidRevenue || 0).toLocaleString()} received
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Project Status</CardTitle>
                <CardDescription>Distribution of project statuses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full flex items-center justify-center">
                  {projectStatusData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={projectStatusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {projectStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-muted-foreground">No project data available</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
                <CardDescription>Paid vs Unpaid Revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  {stats?.totalRevenue ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenueData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']}
                          contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '0.375rem' }}
                        />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          <Cell key="cell-0" fill="#10b981" />
                          <Cell key="cell-1" fill="#f59e0b" />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">No revenue data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={() => navigate('/projects')} 
              className="flex items-center gap-2"
            >
              View All Projects <ArrowUpRight className="h-4 w-4" />
            </Button>
            <Button 
              onClick={() => navigate('/clients')} 
              variant="outline" 
              className="flex items-center gap-2"
            >
              Manage Clients <Users className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </PageTransition>
    </Dashboard>
  );
};

export default DashboardPage;
