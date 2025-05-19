import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { useAuth } from '@/lib/auth';
import { useRoute, useLocation } from 'wouter';

export default function UserDetails() {
  const { isAuthenticated, user } = useAuth();
  const [, setLocation] = useLocation();
  const [match, params] = useRoute<{ id: string }>('/admin/user/:id');

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/auth/login');
      return;
    }

    if (user?.role !== 'admin') {
      setLocation('/dashboard');
      return;
    }
  }, [isAuthenticated, user, setLocation]);

  const userId = params?.id ? parseInt(params.id) : 0;

  const {
    data: userData,
    isLoading,
    error,
  } = useQuery({
    queryKey: [`/api/admin/users/${userId}`],
    enabled: isAuthenticated && user?.role === 'admin' && !!userId,
  });

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load user data. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={() => setLocation('/admin')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">User Details</h1>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">User Profile</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Username</h3>
                    <p className="text-lg">{userData?.username}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                    <p className="text-lg">{userData?.email}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Role</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant={userData?.role === 'admin' ? 'default' : 'outline'}>
                        {userData?.role}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Account Created</h3>
                    <p className="text-lg">
                      {userData?.createdAt && format(new Date(userData.createdAt), 'MMMM d, yyyy')}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Business Name</h3>
                    <p className="text-lg">{userData?.business?.businessName || 'Not set up'}</p>
                  </div>
                  {userData?.business?.businessType && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Business Type</h3>
                      <p className="text-lg capitalize">
                        {userData.business.businessType.replace(/_/g, ' ')}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="business" className="space-y-4">
              <TabsList>
                <TabsTrigger value="business">Business</TabsTrigger>
                <TabsTrigger value="subscription">Subscription</TabsTrigger>
                <TabsTrigger value="calls">Call Logs</TabsTrigger>
                <TabsTrigger value="bookings">Bookings</TabsTrigger>
              </TabsList>

              <TabsContent value="business" className="space-y-4">
                {userData?.business ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card className="col-span-2">
                      <CardHeader>
                        <CardTitle>Business Details</CardTitle>
                      </CardHeader>
                      <CardContent className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground">
                              Business Name
                            </h3>
                            <p>{userData.business.businessName}</p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground">
                              Business Type
                            </h3>
                            <p className="capitalize">
                              {userData.business.businessType.replace(/_/g, ' ')}
                            </p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                            <p>{userData.business.email || 'Not provided'}</p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Phone</h3>
                            <p>{userData.business.phone || 'Not provided'}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Address</h3>
                            <p>{userData.business.address || 'Not provided'}</p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground">City</h3>
                            <p>{userData.business.city || 'Not provided'}</p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground">State</h3>
                            <p>{userData.business.state || 'Not provided'}</p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Website</h3>
                            <p>{userData.business.website || 'Not provided'}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {userData.hours && userData.hours.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Hours of Operation</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Day</TableHead>
                                <TableHead>Hours</TableHead>
                                <TableHead>Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {userData.hours.map((hour) => (
                                <TableRow key={hour.id}>
                                  <TableCell className="font-medium">
                                    {hour.dayOfWeek}
                                  </TableCell>
                                  <TableCell>
                                    {hour.isOpen
                                      ? `${hour.openTime || 'N/A'} - ${hour.closeTime || 'N/A'}`
                                      : 'Closed'}
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant={hour.isOpen ? 'outline' : 'secondary'}>
                                      {hour.isOpen ? 'Open' : 'Closed'}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    )}

                    {userData.faqs && userData.faqs.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle>FAQs</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {userData.faqs.map((faq) => (
                            <div key={faq.id} className="space-y-2">
                              <h3 className="font-medium">{faq.question}</h3>
                              <p className="text-sm text-muted-foreground">{faq.answer}</p>
                              <Separator />
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    )}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-center text-muted-foreground">
                        This user has not set up their business yet.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="subscription" className="space-y-4">
                {userData?.subscription ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Subscription Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Plan</h3>
                          <div className="mt-1">
                            <Badge
                              variant={
                                userData.subscription.plan === 'free' ? 'outline' : 'secondary'
                              }
                            >
                              {userData.subscription.plan}
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                          <p>{userData.subscription.status}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">
                            Current Period Start
                          </h3>
                          <p>
                            {userData.subscription.currentPeriodStart
                              ? format(
                                  new Date(userData.subscription.currentPeriodStart),
                                  'MMMM d, yyyy'
                                )
                              : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">
                            Current Period End
                          </h3>
                          <p>
                            {userData.subscription.currentPeriodEnd
                              ? format(
                                  new Date(userData.subscription.currentPeriodEnd),
                                  'MMMM d, yyyy'
                                )
                              : 'N/A'}
                          </p>
                        </div>
                      </div>
                      {userData.subscription.stripeCustomerId && (
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">
                            Stripe Customer ID
                          </h3>
                          <p className="font-mono text-sm">
                            {userData.subscription.stripeCustomerId}
                          </p>
                        </div>
                      )}
                      {userData.subscription.stripeSubscriptionId && (
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">
                            Stripe Subscription ID
                          </h3>
                          <p className="font-mono text-sm">
                            {userData.subscription.stripeSubscriptionId}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-center text-muted-foreground">
                        This user does not have a subscription.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="calls" className="space-y-4">
                {userData?.calls && userData.calls.length > 0 ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Call Logs</CardTitle>
                      <CardDescription>
                        Recent calls for {userData?.business?.businessName || userData?.username}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Caller</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Duration</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {userData.calls.map((call) => (
                            <TableRow key={call.id}>
                              <TableCell>
                                {format(new Date(call.startTime), 'MMM d, yyyy h:mm a')}
                              </TableCell>
                              <TableCell>{call.caller || 'Unknown'}</TableCell>
                              <TableCell>{call.phone || 'N/A'}</TableCell>
                              <TableCell>{call.duration || 'N/A'}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    call.status === 'completed'
                                      ? 'default'
                                      : call.status === 'missed'
                                      ? 'destructive'
                                      : 'outline'
                                  }
                                >
                                  {call.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-center text-muted-foreground">
                        This user has no call logs.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="bookings" className="space-y-4">
                {userData?.bookings && userData.bookings.length > 0 ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Bookings</CardTitle>
                      <CardDescription>
                        Appointments for {userData?.business?.businessName || userData?.username}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Service</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Contact</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {userData.bookings.map((booking) => (
                            <TableRow key={booking.id}>
                              <TableCell>
                                {format(new Date(booking.date), 'MMM d, yyyy')}
                              </TableCell>
                              <TableCell>{booking.customer}</TableCell>
                              <TableCell>{booking.service}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    booking.status === 'completed'
                                      ? 'default'
                                      : booking.status === 'canceled'
                                      ? 'destructive'
                                      : 'outline'
                                  }
                                >
                                  {booking.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {booking.email ? (
                                  <div className="flex flex-col space-y-1">
                                    <span className="text-xs text-muted-foreground">
                                      {booking.email}
                                    </span>
                                    {booking.phone && (
                                      <span className="text-xs text-muted-foreground">
                                        {booking.phone}
                                      </span>
                                    )}
                                  </div>
                                ) : booking.phone ? (
                                  booking.phone
                                ) : (
                                  'N/A'
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-center text-muted-foreground">
                        This user has no bookings.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}