import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/dashboard/Sidebar";
import Navbar from "@/components/dashboard/Navbar";
import StatCard from "@/components/dashboard/StatCard";
import AnalyticsChart from "@/components/dashboard/AnalyticsChart";
import RecentCallsTable, { Call } from "@/components/dashboard/RecentCallsTable";
import UpcomingBookings, { Booking } from "@/components/dashboard/UpcomingBookings";
import IntegrationStatus, { Integration } from "@/components/dashboard/IntegrationStatus";
import { Phone, Calendar, DollarSign, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

// Mock integrations data - this would come from a real API in production
const mockIntegrations: Integration[] = [
  {
    id: "1",
    name: "Twilio",
    description: "Voice call handling",
    iconColor: "bg-blue-100",
    icon: <Phone className="h-6 w-6 text-blue-600" />,
    status: "active",
  },
  {
    id: "2",
    name: "11 Labs",
    description: "AI voice responses",
    iconColor: "bg-purple-100",
    icon: <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
    </svg>,
    status: "active",
  },
  {
    id: "3",
    name: "n8n",
    description: "Workflow automation",
    iconColor: "bg-orange-100",
    icon: <svg className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"></path>
    </svg>,
    status: "active",
  },
  {
    id: "4",
    name: "Stripe",
    description: "Payment processing",
    iconColor: "bg-green-100",
    icon: <DollarSign className="h-6 w-6 text-green-600" />,
    status: "active",
  },
  {
    id: "5",
    name: "Email",
    description: "Notifications & reports",
    iconColor: "bg-blue-100",
    icon: <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path>
    </svg>,
    status: "active",
  },
];

const Dashboard = () => {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  // Fetch dashboard stats from the API
  const { 
    data: stats, 
    isLoading: isLoadingStats,
    error: statsError 
  } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  // Fetch calls from the API
  const {
    data: callsData,
    isLoading: isLoadingCalls,
    error: callsError
  } = useQuery({
    queryKey: ["/api/calls"],
  });

  // Fetch bookings from the API
  const {
    data: bookingsData,
    isLoading: isLoadingBookings,
    error: bookingsError
  } = useQuery({
    queryKey: ["/api/bookings"],
  });

  // Process calls data for the table component
  const processedCalls: Call[] = Array.isArray(callsData) 
    ? callsData.map((call: any) => ({
        id: call.id.toString(),
        name: call.caller || "Unknown",
        phone: call.phone || "N/A",
        type: call.type || "General",
        time: call.startTime ? new Date(call.startTime) : new Date(),
        status: call.status,
        duration: call.duration || "0:00",
      })) 
    : [];

  // Process bookings data for the upcoming bookings component
  const processedBookings: Booking[] = Array.isArray(bookingsData)
    ? bookingsData
        .filter((booking: any) => booking.status === "upcoming")
        .slice(0, 3)
        .map((booking: any) => ({
          id: booking.id.toString(),
          service: booking.service,
          customer: booking.customer,
          time: new Date(booking.date),
        }))
    : [];

  const handleAddIntegration = () => {
    toast({
      title: "Integration",
      description: "Add integration feature coming soon!",
    });
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar for desktop */}
      <Sidebar />

      {/* Mobile sidebar */}
      {showMobileSidebar && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setShowMobileSidebar(false)}></div>
          <div className="relative flex h-full flex-col bg-white w-80">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <Navbar 
          showMobileSidebar={showMobileSidebar}
          setShowMobileSidebar={setShowMobileSidebar}
        />

        {/* Page Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
            <div className="flex space-x-3">
              <span className="hidden sm:inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                Active
              </span>
              <div className="hidden sm:flex items-center text-sm text-gray-500">
                <Calendar className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                <span>{format(new Date(), "MMMM dd, yyyy")}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {/* Error Alerts */}
              {(statsError || callsError || bookingsError) && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    {statsError ? "Failed to load dashboard stats. " : ""}
                    {callsError ? "Failed to load calls data. " : ""}
                    {bookingsError ? "Failed to load bookings data. " : ""}
                    Please try refreshing the page.
                  </AlertDescription>
                </Alert>
              )}

              {/* Stats Overview */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {isLoadingStats ? (
                  <>
                    <div className="p-6 bg-white shadow rounded-lg">
                      <Skeleton className="h-6 w-24 mb-2" />
                      <Skeleton className="h-10 w-16 mb-4" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <div className="p-6 bg-white shadow rounded-lg">
                      <Skeleton className="h-6 w-24 mb-2" />
                      <Skeleton className="h-10 w-16 mb-4" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <div className="p-6 bg-white shadow rounded-lg">
                      <Skeleton className="h-6 w-24 mb-2" />
                      <Skeleton className="h-10 w-16 mb-4" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </>
                ) : (
                  <>
                    <StatCard 
                      icon={<Phone className="h-6 w-6" />}
                      iconColor="bg-primary"
                      title="Total Calls"
                      value={stats && typeof stats === 'object' && 'totalCalls' in stats ? stats.totalCalls as number : 0}
                      linkText="View all calls"
                      linkHref="/call-logs"
                    />
                    <StatCard 
                      icon={<Calendar className="h-6 w-6" />}
                      iconColor="bg-green-500"
                      title="Bookings this Month"
                      value={stats && typeof stats === 'object' && 'monthlyBookings' in stats ? stats.monthlyBookings as number : 0}
                      linkText="View all bookings"
                      linkHref="/bookings"
                    />
                    <StatCard 
                      icon={<DollarSign className="h-6 w-6" />}
                      iconColor="bg-yellow-500"
                      title="Revenue this Month"
                      value={stats && typeof stats === 'object' && 'monthlyRevenue' in stats ? stats.monthlyRevenue as string : "$0"}
                      linkText="View finance details"
                      linkHref="/reports"
                    />
                  </>
                )}
              </div>

              {/* Recent Activity Section */}
              <div className="mt-8">
                <h2 className="text-lg leading-6 font-medium text-gray-900">Recent Activity</h2>
                
                {/* Recent Calls Table */}
                {isLoadingCalls ? (
                  <div className="mt-4 p-6 bg-white shadow rounded-lg">
                    <Skeleton className="h-6 w-32 mb-4" />
                    <Skeleton className="h-8 w-full mb-2" />
                    <Skeleton className="h-8 w-full mb-2" />
                    <Skeleton className="h-8 w-full mb-2" />
                    <Skeleton className="h-8 w-full mb-2" />
                  </div>
                ) : (
                  <RecentCallsTable 
                    calls={processedCalls}
                    currentPage={currentPage}
                    totalPages={Math.ceil((Array.isArray(callsData) ? callsData.length : 0) / 5)}
                    onPageChange={setCurrentPage}
                  />
                )}
              </div>

              {/* Two-Column Layout for Analytics & Upcoming Bookings */}
              <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Analytics Chart */}
                <AnalyticsChart 
                  totalCalls={Array.isArray(callsData) ? callsData.length : 0}
                  avgDuration="3:24" // This should be calculated from real data
                  completionRate={`${Math.round(((Array.isArray(callsData) ? 
                    callsData.filter((call: any) => call.status === "completed").length : 0) / 
                    (Array.isArray(callsData) ? Math.max(callsData.length, 1) : 1)) * 100)}%`}
                />
                
                {/* Upcoming Bookings */}
                {isLoadingBookings ? (
                  <div className="p-6 bg-white shadow rounded-lg">
                    <Skeleton className="h-6 w-32 mb-4" />
                    <Skeleton className="h-16 w-full mb-2" />
                    <Skeleton className="h-16 w-full mb-2" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ) : (
                  <UpcomingBookings bookings={processedBookings} />
                )}
              </div>

              {/* Integration Status */}
              <IntegrationStatus 
                integrations={mockIntegrations}
                onAddIntegration={handleAddIntegration}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
