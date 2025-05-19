import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
import Dashboard from "@/pages/dashboard";
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";
import ForgotPasswordPage from "@/pages/auth/forgot-password";
import ResetPasswordPage from "@/pages/auth/reset-password";
import BusinessSetup from "@/pages/business-setup";
import BusinessOnboarding from "@/pages/business-setup/onboarding";
import Bookings from "@/pages/bookings";
import CallLogs from "@/pages/call-logs";
import Reports from "@/pages/reports";
import SubscriptionPage from "@/pages/subscription";
import Settings from "@/pages/settings";
import AIAssistant from "@/pages/ai-assistant";
import AdminDashboard from "@/pages/admin";
import UserDetails from "@/pages/admin/user/[id]";
import NotFound from "@/pages/not-found";
import { useQuery } from "@tanstack/react-query";
import { Loader } from "@/components/ui/loader";
import { Toaster } from "@/components/ui/toaster";
import { getQueryFn } from "@/lib/queryClient";
import { Business, HoursOfOperation } from "@shared/schema";

// Type for business setup status response
interface BusinessSetupStatus {
  isSetupComplete: boolean;
  business: Business | null;
  hours: HoursOfOperation[] | [];
  message?: string;
}

function App() {
  const [location, setLocation] = useLocation();
  
  // Fetch current user with authentication handling
  const { 
    data: user, 
    isLoading: isLoadingUser, 
    isError: isUserError, 
    error: userError 
  } = useQuery({
    queryKey: ['/api/auth/me'],
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 0,
    queryFn: getQueryFn({ on401: "returnNull" })
  });
  
  // Check if business is set up
  const {
    data: businessSetupStatus,
    isLoading: isLoadingBusinessStatus,
    isError: isBusinessStatusError
  } = useQuery<BusinessSetupStatus>({
    queryKey: ['/api/business/setup/status'],
    retry: false,
    enabled: !!user, // Only fetch if user is logged in
    queryFn: getQueryFn({ on401: "returnNull" })
  });

  // Handle routing based on authentication state and business setup
  useEffect(() => {
    const publicRoutes = [
      '/login', 
      '/register',
      '/auth/forgot-password',
      '/auth/reset-password'
    ];
    const onboardingRoutes = [
      '/business-setup/onboarding'
    ];
    const isPublicRoute = publicRoutes.includes(location);
    const isOnboardingRoute = onboardingRoutes.includes(location);
    
    // If loading, don't redirect
    if (isLoadingUser || (user && isLoadingBusinessStatus)) return;
    
    // Redirect unauthenticated users to login
    if (!user && !isPublicRoute) {
      setLocation('/login');
      return;
    }
    
    // Redirect authenticated users to dashboard if they're on public routes
    if (user && isPublicRoute) {
      setLocation('/dashboard');
      return;
    }
    
    // Check if business setup is complete and redirect to onboarding if needed
    if (user && 
        businessSetupStatus && 
        !businessSetupStatus.isSetupComplete && 
        !isOnboardingRoute) {
      setLocation('/business-setup/onboarding');
      return;
    }
    
    // Prevent users who have completed onboarding from going back to it
    if (user && 
        businessSetupStatus && 
        businessSetupStatus.isSetupComplete && 
        isOnboardingRoute) {
      setLocation('/dashboard');
      return;
    }
    
    // Redirect root path to dashboard for authenticated users
    if (user && location === '/') {
      setLocation('/dashboard');
      return;
    }
  }, [user, isLoadingUser, businessSetupStatus, isLoadingBusinessStatus, location, setLocation]);

  // Show loading spinner while checking authentication or business status
  if (isLoadingUser || (user && isLoadingBusinessStatus)) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader 
          size="lg" 
          text="Loading Micro8gents..." 
        />
      </div>
    );
  }

  return (
    <>
      <Switch>
        {!user ? (
          <>
            <Route path="/" component={Login} />
            <Route path="/login" component={Login} />
            <Route path="/register" component={Register} />
            <Route path="/auth/forgot-password" component={ForgotPasswordPage} />
            <Route path="/auth/reset-password" component={ResetPasswordPage} />
          </>
        ) : (
          <>
            <Route path="/" component={Dashboard} />
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/business-setup" component={BusinessSetup} />
            <Route path="/business-setup/onboarding" component={BusinessOnboarding} />
            <Route path="/bookings" component={Bookings} />
            <Route path="/call-logs" component={CallLogs} />
            <Route path="/reports" component={Reports} />
            <Route path="/ai-assistant" component={AIAssistant} />
            <Route path="/subscription" component={SubscriptionPage} />
            <Route path="/settings" component={Settings} />
            {user?.role === 'admin' && (
              <>
                <Route path="/admin" component={AdminDashboard} />
                <Route path="/admin/user/:id" component={UserDetails} />
              </>
            )}
          </>
        )}
        <Route component={NotFound} />
      </Switch>
      <Toaster />
    </>
  );
}

export default App;
