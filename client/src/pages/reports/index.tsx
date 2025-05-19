import { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import Navbar from "@/components/dashboard/Navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { format, subDays, subMonths } from "date-fns";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line
} from "recharts";
import { Download, Mail } from "lucide-react";

// Mock data for call types
const callTypeData = [
  { name: "Booking Inquiry", value: 45 },
  { name: "Information", value: 30 },
  { name: "Support", value: 15 },
  { name: "Cancellation", value: 10 },
];

// Mock data for daily calls
const dailyCallData = [
  { name: "Mon", calls: 12 },
  { name: "Tue", calls: 19 },
  { name: "Wed", calls: 15 },
  { name: "Thu", calls: 18 },
  { name: "Fri", calls: 22 },
  { name: "Sat", calls: 8 },
  { name: "Sun", calls: 5 },
];

// Mock data for monthly calls
const monthlyCallData = [
  { name: "Jan", calls: 65 },
  { name: "Feb", calls: 59 },
  { name: "Mar", calls: 80 },
  { name: "Apr", calls: 81 },
  { name: "May", calls: 90 },
  { name: "Jun", calls: 125 },
  { name: "Jul", calls: 110 },
  { name: "Aug", calls: 95 },
  { name: "Sep", calls: 100 },
  { name: "Oct", calls: 120 },
  { name: "Nov", calls: 130 },
  { name: "Dec", calls: 140 },
];

// Mock data for monthly revenue
const monthlyRevenueData = [
  { name: "Jan", revenue: 2100 },
  { name: "Feb", revenue: 1900 },
  { name: "Mar", revenue: 2500 },
  { name: "Apr", revenue: 2600 },
  { name: "May", revenue: 2800 },
  { name: "Jun", revenue: 3500 },
  { name: "Jul", revenue: 3200 },
  { name: "Aug", revenue: 3000 },
  { name: "Sep", revenue: 3100 },
  { name: "Oct", revenue: 3600 },
  { name: "Nov", revenue: 3800 },
  { name: "Dec", revenue: 4200 },
];

// Colors for pie chart
const COLORS = ['#4f46e5', '#3b82f6', '#8b5cf6', '#ef4444'];

const Reports = () => {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [timeRange, setTimeRange] = useState("monthly");
  const [reportType, setReportType] = useState("calls");
  const { toast } = useToast();

  const downloadReport = (format: string) => {
    toast({
      title: "Report Downloaded",
      description: `Your ${reportType} report has been downloaded in ${format} format.`,
    });
  };

  const emailReport = () => {
    toast({
      title: "Report Emailed",
      description: "Your report has been sent to your email address.",
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
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <h1 className="text-lg font-semibold text-gray-900">Reports</h1>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Report Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="calls">Call Analytics</SelectItem>
                      <SelectItem value="bookings">Booking Analytics</SelectItem>
                      <SelectItem value="revenue">Revenue Analytics</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Time Range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex space-x-2 mt-2 sm:mt-0">
                  <Button variant="outline" onClick={() => downloadReport("csv")}>
                    <Download className="h-4 w-4 mr-2" />
                    CSV
                  </Button>
                  <Button variant="outline" onClick={() => downloadReport("pdf")}>
                    <Download className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                  <Button variant="outline" onClick={emailReport}>
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                </div>
              </div>
              
              <Tabs defaultValue={reportType} value={reportType} onValueChange={setReportType}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="calls">Call Analytics</TabsTrigger>
                  <TabsTrigger value="bookings">Booking Analytics</TabsTrigger>
                  <TabsTrigger value="revenue">Revenue Analytics</TabsTrigger>
                </TabsList>
                
                {/* Call Analytics Tab */}
                <TabsContent value="calls">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Call Volume</CardTitle>
                        <CardDescription>
                          {timeRange === "daily" 
                            ? "Number of calls received by day" 
                            : "Number of calls received by month"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={timeRange === "daily" ? dailyCallData : monthlyCallData}
                              margin={{
                                top: 20,
                                right: 30,
                                left: 20,
                                bottom: 5,
                              }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Bar dataKey="calls" name="Calls" fill="#4f46e5" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Call Types</CardTitle>
                        <CardDescription>
                          Distribution of call types
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={callTypeData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {callTypeData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Call Metrics</CardTitle>
                      <CardDescription>
                        Key performance indicators for calls
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h3 className="text-sm font-medium text-gray-500">Total Calls</h3>
                          <p className="mt-1 text-2xl font-semibold">156</p>
                          <p className="mt-1 text-sm text-green-600">+12% from last month</p>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h3 className="text-sm font-medium text-gray-500">Average Duration</h3>
                          <p className="mt-1 text-2xl font-semibold">3:24</p>
                          <p className="mt-1 text-sm text-green-600">+0:18 from last month</p>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h3 className="text-sm font-medium text-gray-500">Completion Rate</h3>
                          <p className="mt-1 text-2xl font-semibold">94%</p>
                          <p className="mt-1 text-sm text-green-600">+2% from last month</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Booking Analytics Tab */}
                <TabsContent value="bookings">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Booking Trends</CardTitle>
                        <CardDescription>
                          Number of bookings over time
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                              data={monthlyCallData}
                              margin={{
                                top: 20,
                                right: 30,
                                left: 20,
                                bottom: 5,
                              }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Line 
                                type="monotone" 
                                dataKey="calls" 
                                name="Bookings" 
                                stroke="#3b82f6" 
                                strokeWidth={2}
                                activeDot={{ r: 8 }} 
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Service Distribution</CardTitle>
                        <CardDescription>
                          Distribution of bookings by service type
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={[
                                  { name: "Basic Service", value: 35 },
                                  { name: "Premium Package", value: 45 },
                                  { name: "Consultation", value: 20 },
                                ]}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                <Cell fill="#4f46e5" />
                                <Cell fill="#3b82f6" />
                                <Cell fill="#8b5cf6" />
                              </Pie>
                              <Tooltip />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Booking Metrics</CardTitle>
                      <CardDescription>
                        Key performance indicators for bookings
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h3 className="text-sm font-medium text-gray-500">Total Bookings</h3>
                          <p className="mt-1 text-2xl font-semibold">48</p>
                          <p className="mt-1 text-sm text-green-600">+8% from last month</p>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h3 className="text-sm font-medium text-gray-500">Conversion Rate</h3>
                          <p className="mt-1 text-2xl font-semibold">32%</p>
                          <p className="mt-1 text-sm text-green-600">+5% from last month</p>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h3 className="text-sm font-medium text-gray-500">Cancellation Rate</h3>
                          <p className="mt-1 text-2xl font-semibold">8%</p>
                          <p className="mt-1 text-sm text-red-600">+2% from last month</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Revenue Analytics Tab */}
                <TabsContent value="revenue">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Monthly Revenue</CardTitle>
                        <CardDescription>
                          Revenue generated each month
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={monthlyRevenueData}
                              margin={{
                                top: 20,
                                right: 30,
                                left: 20,
                                bottom: 5,
                              }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip formatter={(value) => `$${value}`} />
                              <Bar dataKey="revenue" name="Revenue" fill="#10b981" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Revenue by Service</CardTitle>
                        <CardDescription>
                          Distribution of revenue by service type
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={[
                                  { name: "Basic Service", value: 2100 },
                                  { name: "Premium Package", value: 6750 },
                                  { name: "Consultation", value: 1800 },
                                ]}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                <Cell fill="#10b981" />
                                <Cell fill="#059669" />
                                <Cell fill="#34d399" />
                              </Pie>
                              <Tooltip formatter={(value) => `$${value}`} />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Revenue Metrics</CardTitle>
                      <CardDescription>
                        Key financial performance indicators
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
                          <p className="mt-1 text-2xl font-semibold">$10,650</p>
                          <p className="mt-1 text-sm text-green-600">+15% from last month</p>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h3 className="text-sm font-medium text-gray-500">Average Order Value</h3>
                          <p className="mt-1 text-2xl font-semibold">$220</p>
                          <p className="mt-1 text-sm text-green-600">+5% from last month</p>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h3 className="text-sm font-medium text-gray-500">Projected Annual</h3>
                          <p className="mt-1 text-2xl font-semibold">$127,800</p>
                          <p className="mt-1 text-sm text-green-600">+12% from last year</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Reports;
