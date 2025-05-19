import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { UserRoleDialog } from '@/components/admin/UserRoleDialog';
import { UsersList } from '@/components/admin/UsersList';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/lib/auth';
import { useLocation, Link } from 'wouter';
import { User } from '@/lib/types';

interface DashboardStats {
  totalUsers: number;
  totalBusinesses: number;
  totalSubscriptions: number;
  recentSignups: number;
  subscriptionsByPlan: {
    free: number;
    basic: number;
    premium: number;
    enterprise: number;
  };
  businessesByType: Record<string, number>;
}

export default function AdminDashboard() {
  const { isAuthenticated, user } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/login');
      return;
    }

    if (user?.role !== 'admin') {
      setLocation('/dashboard');
      return;
    }
  }, [isAuthenticated, user, setLocation]);

  const {
    data: stats,
    isLoading: isStatsLoading,
    error: statsError,
  } = useQuery<DashboardStats>({
    queryKey: ['/api/admin/dashboard/stats'],
    enabled: isAuthenticated && user?.role === 'admin',
  });

  const {
    data: users,
    isLoading: isUsersLoading,
    error: usersError,
  } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
    enabled: isAuthenticated && user?.role === 'admin',
  });

  const handleEditRole = (userId: number) => {
    setSelectedUserId(userId);
    setIsDialogOpen(true);
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  const isLoading = isStatsLoading || isUsersLoading;
  const error = statsError || usersError;

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load admin dashboard data. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="gap-1">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
                      <p className="text-xs text-muted-foreground">
                        {stats?.recentSignups || 0} new in the last 30 days
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Businesses</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats?.totalBusinesses || 0}</div>
                      <p className="text-xs text-muted-foreground">
                        {((stats?.totalBusinesses || 0) / (stats?.totalUsers || 1) * 100).toFixed(0)}% of users
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Paid Subscriptions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {(stats?.subscriptionsByPlan.basic || 0) + 
                         (stats?.subscriptionsByPlan.premium || 0) + 
                         (stats?.subscriptionsByPlan.enterprise || 0)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {stats?.subscriptionsByPlan.free || 0} free tier users
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Top Business Type</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {stats?.businessesByType && Object.keys(stats.businessesByType).length > 0 ? (
                        <>
                          <div className="text-2xl font-bold capitalize">
                            {Object.entries(stats.businessesByType)
                              .sort((a, b) => b[1] - a[1])[0][0]
                              .replace(/_/g, ' ')}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {Object.entries(stats.businessesByType)
                              .sort((a, b) => b[1] - a[1])[0][1]} businesses
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="text-2xl font-bold">-</div>
                          <p className="text-xs text-muted-foreground">No data available</p>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="col-span-1">
                    <CardHeader>
                      <CardTitle>Subscription Plans</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <div className="w-16 text-sm">Free</div>
                          <div className="flex-1">
                            <div className="bg-muted rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-primary h-full"
                                style={{
                                  width: `${(stats?.subscriptionsByPlan.free || 0) / (stats?.totalUsers || 1) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                          <div className="w-10 text-right text-sm">{stats?.subscriptionsByPlan.free || 0}</div>
                        </div>
                        <div className="flex items-center">
                          <div className="w-16 text-sm">Basic</div>
                          <div className="flex-1">
                            <div className="bg-muted rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-blue-500 h-full"
                                style={{
                                  width: `${(stats?.subscriptionsByPlan.basic || 0) / (stats?.totalUsers || 1) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                          <div className="w-10 text-right text-sm">{stats?.subscriptionsByPlan.basic || 0}</div>
                        </div>
                        <div className="flex items-center">
                          <div className="w-16 text-sm">Premium</div>
                          <div className="flex-1">
                            <div className="bg-muted rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-purple-500 h-full"
                                style={{
                                  width: `${(stats?.subscriptionsByPlan.premium || 0) / (stats?.totalUsers || 1) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                          <div className="w-10 text-right text-sm">{stats?.subscriptionsByPlan.premium || 0}</div>
                        </div>
                        <div className="flex items-center">
                          <div className="w-16 text-sm">Enterprise</div>
                          <div className="flex-1">
                            <div className="bg-muted rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-amber-500 h-full"
                                style={{
                                  width: `${(stats?.subscriptionsByPlan.enterprise || 0) / (stats?.totalUsers || 1) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                          <div className="w-10 text-right text-sm">{stats?.subscriptionsByPlan.enterprise || 0}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="col-span-1">
                    <CardHeader>
                      <CardTitle>Business Types</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {stats?.businessesByType && Object.keys(stats.businessesByType).length > 0 ? (
                          Object.entries(stats.businessesByType)
                            .sort((a, b) => b[1] - a[1])
                            .slice(0, 5)
                            .map(([type, count]) => (
                              <div key={type} className="flex items-center">
                                <div className="w-28 text-sm capitalize">{type.replace(/_/g, ' ')}</div>
                                <div className="flex-1">
                                  <div className="bg-muted rounded-full h-2 overflow-hidden">
                                    <div
                                      className="bg-primary h-full"
                                      style={{
                                        width: `${count / (stats?.totalBusinesses || 1) * 100}%`,
                                      }}
                                    />
                                  </div>
                                </div>
                                <div className="w-10 text-right text-sm">{count}</div>
                              </div>
                            ))
                        ) : (
                          <p className="text-sm text-muted-foreground">No business data available</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <UsersList users={users || []} onEditRole={handleEditRole} />
            )}
          </TabsContent>
        </Tabs>
      </div>

      {selectedUserId && (
        <UserRoleDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          userId={selectedUserId}
        />
      )}
    </div>
  );
}