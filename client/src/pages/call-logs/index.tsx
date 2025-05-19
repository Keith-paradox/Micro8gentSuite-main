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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format, subDays } from "date-fns";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, Download, Search, User } from "lucide-react";

// Mock data
const callLogs = [
  {
    id: "1",
    caller: "Jane Cooper",
    phone: "(555) 123-4567",
    type: "Booking Inquiry",
    time: new Date(),
    status: "completed",
    duration: "2:45",
    recording: "call_1.mp3",
    transcript: "Jane inquired about booking a premium package and was provided with available time slots.",
  },
  {
    id: "2",
    caller: "John Smith",
    phone: "(555) 987-6543",
    type: "Information",
    time: subDays(new Date(), 1),
    status: "completed",
    duration: "3:12",
    recording: "call_2.mp3",
    transcript: "John asked about the services offered and pricing information.",
  },
  {
    id: "3",
    caller: "Robert Johnson",
    phone: "(555) 555-1234",
    type: "Booking Modification",
    time: subDays(new Date(), 1),
    status: "completed",
    duration: "4:27",
    recording: "call_3.mp3",
    transcript: "Robert requested to reschedule his appointment from Thursday to Friday.",
  },
  {
    id: "4",
    caller: "Maria Garcia",
    phone: "(555) 777-8899",
    type: "Support",
    time: subDays(new Date(), 2),
    status: "transferred",
    duration: "1:53",
    recording: "call_4.mp3",
    transcript: "Maria had a complex issue that required human assistance, so the call was transferred.",
  },
  {
    id: "5",
    caller: "James Wilson",
    phone: "(555) 444-3333",
    type: "Cancellation",
    time: subDays(new Date(), 2),
    status: "completed",
    duration: "2:18",
    recording: "call_5.mp3",
    transcript: "James called to cancel his appointment scheduled for next week.",
  },
  {
    id: "6",
    caller: "Patricia Davis",
    phone: "(555) 222-1111",
    type: "Information",
    time: subDays(new Date(), 3),
    status: "missed",
    duration: "0:00",
    recording: null,
    transcript: null,
  },
  {
    id: "7",
    caller: "Michael Brown",
    phone: "(555) 888-9999",
    type: "Booking Inquiry",
    time: subDays(new Date(), 3),
    status: "completed",
    duration: "3:42",
    recording: "call_7.mp3",
    transcript: "Michael inquired about availability for a consultation next week.",
  },
];

const CallLogs = () => {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [selectedCall, setSelectedCall] = useState<any | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);

  const filteredCalls = callLogs.filter((call) => {
    // Filter by search query
    const searchMatches = 
      call.caller.toLowerCase().includes(searchQuery.toLowerCase()) ||
      call.phone.includes(searchQuery) ||
      call.type.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by status
    const statusMatches = statusFilter === "all" || call.status === statusFilter;
    
    // Filter by type
    const typeMatches = typeFilter === "all" || call.type === typeFilter;
    
    // Filter by date
    const dateMatches = !dateFilter || 
      (call.time.getDate() === dateFilter.getDate() &&
      call.time.getMonth() === dateFilter.getMonth() &&
      call.time.getFullYear() === dateFilter.getFullYear());
    
    return searchMatches && statusMatches && typeMatches && dateMatches;
  });

  const handleViewDetails = (call: any) => {
    setSelectedCall(call);
    setIsDetailsOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case "in-progress":
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case "missed":
        return <Badge className="bg-red-100 text-red-800">Missed</Badge>;
      case "transferred":
        return <Badge className="bg-yellow-100 text-yellow-800">Transferred</Badge>;
      default:
        return null;
    }
  };

  const uniqueTypes = Array.from(new Set(callLogs.map(call => call.type)));

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setTypeFilter("all");
    setDateFilter(undefined);
  };

  const downloadCsv = () => {
    // In a real app, this would trigger a backend API call to generate and download a CSV
    alert("CSV download would be triggered here");
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
            <h1 className="text-lg font-semibold text-gray-900">Call Logs</h1>
            <Button onClick={downloadCsv} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Card>
                <CardHeader>
                  <CardTitle>Call History</CardTitle>
                  <CardDescription>
                    View and analyze all calls handled by your AI assistant.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Filters */}
                  <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative w-full md:w-96">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        placeholder="Search by name, phone, or type..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="missed">Missed</SelectItem>
                          <SelectItem value="transferred">Transferred</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Filter by type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          {uniqueTypes.map((type) => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className={cn(
                            "justify-start text-left font-normal",
                            !dateFilter && "text-muted-foreground"
                          )}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateFilter ? format(dateFilter, "PPP") : "Filter by date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={dateFilter}
                            onSelect={setDateFilter}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      
                      <Button variant="ghost" onClick={clearFilters}>
                        Clear Filters
                      </Button>
                    </div>
                  </div>
                  
                  {/* Table */}
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Caller</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Time</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCalls.map((call) => (
                          <TableRow key={call.id}>
                            <TableCell>
                              <div className="flex items-center">
                                <Avatar className="h-10 w-10 mr-4">
                                  <AvatarFallback>
                                    <User className="h-6 w-6" />
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{call.caller}</div>
                                  <div className="text-sm text-gray-500">{call.phone}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{call.type}</TableCell>
                            <TableCell>{format(call.time, "PPp")}</TableCell>
                            <TableCell>{getStatusBadge(call.status)}</TableCell>
                            <TableCell>{call.duration}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="link"
                                onClick={() => handleViewDetails(call)}
                              >
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        
                        {filteredCalls.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                              No matching call logs found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>

      {/* Call Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Call Details</DialogTitle>
            <DialogDescription>
              Complete information about this call.
            </DialogDescription>
          </DialogHeader>
          
          {selectedCall && (
            <div className="py-4 space-y-4">
              <div className="flex items-center">
                <Avatar className="h-12 w-12 mr-4">
                  <AvatarFallback>
                    <User className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-medium">{selectedCall.caller}</h3>
                  <p className="text-sm text-gray-500">{selectedCall.phone}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Call Type</p>
                  <p>{selectedCall.type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Date & Time</p>
                  <p>{format(selectedCall.time, "PPP 'at' p")}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <p>{selectedCall.status.charAt(0).toUpperCase() + selectedCall.status.slice(1)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Duration</p>
                  <p>{selectedCall.duration}</p>
                </div>
              </div>
              
              {selectedCall.recording && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Call Recording</p>
                  <audio controls className="w-full">
                    <source src={`/api/recordings/${selectedCall.recording}`} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}
              
              {selectedCall.transcript && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Transcript</p>
                  <div className="bg-gray-50 p-4 rounded-md text-sm">
                    {selectedCall.transcript}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CallLogs;
