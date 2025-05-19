import { useState, useEffect } from "react";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { CalendarIcon, Edit, Plus, Trash, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";

// Booking interface
interface Booking {
  id: number;
  businessId: number;
  customer: string;
  phone: string;
  email: string;
  service: string;
  date: string; // ISO string from API
  status: 'upcoming' | 'completed' | 'canceled';
  notes: string;
  createdAt: string;
}

const formSchema = z.object({
  customer: z.string().min(2, {
    message: "Customer name must be at least 2 characters.",
  }),
  phone: z.string().min(10, {
    message: "Phone number is required.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  service: z.string().min(1, {
    message: "Service is required.",
  }),
  date: z.date({
    required_error: "Please select a date and time.",
  }),
  time: z.string().min(1, {
    message: "Please select a time.",
  }),
  notes: z.string().optional(),
  // Include these fields but make them optional since they'll be handled by the server
  businessId: z.number().optional(),
  status: z.enum(['upcoming', 'completed', 'canceled']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

const Bookings = () => {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [openNewBooking, setOpenNewBooking] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const { toast } = useToast();
  
  // Fetch bookings from API
  const { 
    data: bookings = [], 
    isLoading,
    error
  } = useQuery<Booking[]>({
    queryKey: ['/api/bookings'],
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customer: "",
      phone: "",
      email: "",
      service: "",
      time: "09:00",
      notes: "",
    },
  });

  const handleEditBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    // Convert ISO string date to Date object
    const bookingDate = new Date(booking.date);
    form.reset({
      customer: booking.customer,
      phone: booking.phone,
      email: booking.email,
      service: booking.service,
      date: bookingDate,
      time: format(bookingDate, "HH:mm"),
      notes: booking.notes,
    });
    setIsEditMode(true);
    setOpenNewBooking(true);
  };

  const handleDeleteBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      if (!selectedBooking) return;
      
      // Make the actual DELETE API call
      await apiRequest("DELETE", `/api/bookings/${selectedBooking.id}`, {});
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      
      toast({
        title: "Booking deleted",
        description: "The booking has been deleted successfully.",
      });
    } catch (error) {
      console.error("Delete booking error:", error);
      toast({
        title: "Error",
        description: "Failed to delete the booking.",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedBooking(null);
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      // Combine date and time
      const bookingDateTime = new Date(values.date);
      const [hours, minutes] = values.time.split(':').map(Number);
      bookingDateTime.setHours(hours, minutes);
      
      // Create the booking data, removing the 'time' field since it's not in the schema
      const { time, ...restValues } = values;
      
      const bookingData = {
        ...restValues,
        // Convert date to ISO string - server will parse it back to Date object
        date: bookingDateTime.toISOString(),
        status: 'upcoming', // Default status for new bookings
      };
      
      console.log("Sending booking data:", bookingData);
      
      // Create response variable to store API response
      let response;
      
      // Make the actual API call
      if (isEditMode && selectedBooking) {
        response = await apiRequest("PUT", `/api/bookings/${selectedBooking.id}`, bookingData);
      } else {
        response = await apiRequest("POST", "/api/bookings", bookingData);
      }
      
      // Clone the response since we can only read the body once
      const clonedResponse = response.clone();
      
      // Refresh the bookings data
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      
      toast({
        title: isEditMode ? "Booking updated" : "Booking created",
        description: isEditMode 
          ? "The booking has been updated successfully." 
          : "New booking has been created successfully.",
      });
      
      setOpenNewBooking(false);
      form.reset();
      setIsEditMode(false);
      setSelectedBooking(null);
    } catch (error) {
      console.error("Booking error:", error);
      toast({
        title: "Error",
        description: isEditMode 
          ? "Failed to update the booking." 
          : "Failed to create the booking.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "upcoming":
        return <Badge className="bg-blue-100 text-blue-800">Upcoming</Badge>;
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case "canceled":
        return <Badge className="bg-red-100 text-red-800">Canceled</Badge>;
      default:
        return null;
    }
  };

  const handleNewBooking = () => {
    form.reset({
      customer: "",
      phone: "",
      email: "",
      service: "",
      time: "09:00",
      notes: "",
    });
    setIsEditMode(false);
    setOpenNewBooking(true);
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
            <h1 className="text-lg font-semibold text-gray-900">Bookings</h1>
            <Button onClick={handleNewBooking}>
              <Plus className="h-4 w-4 mr-2" />
              New Booking
            </Button>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Card>
                <CardHeader>
                  <CardTitle>All Bookings</CardTitle>
                  <CardDescription>
                    Manage bookings and appointments for your business.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center items-center py-10">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : error ? (
                    <Alert variant="destructive" className="my-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>
                        Failed to load bookings. Please try again later.
                      </AlertDescription>
                    </Alert>
                  ) : bookings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <p className="text-muted-foreground mb-4">No bookings found</p>
                      <Button onClick={handleNewBooking} variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Create your first booking
                      </Button>
                    </div>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Customer</TableHead>
                            <TableHead>Service</TableHead>
                            <TableHead>Date & Time</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {bookings.map((booking) => (
                            <TableRow key={booking.id}>
                              <TableCell className="font-medium">{booking.customer}</TableCell>
                              <TableCell>{booking.service}</TableCell>
                              <TableCell>{format(new Date(booking.date), "PPP 'at' p")}</TableCell>
                              <TableCell>{getStatusBadge(booking.status)}</TableCell>
                              <TableCell>
                                <div>{booking.phone}</div>
                                <div className="text-xs text-gray-500">{booking.email}</div>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end space-x-2">
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => handleEditBooking(booking)}
                                  >
                                    <Edit className="h-4 w-4" />
                                    <span className="sr-only">Edit</span>
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => handleDeleteBooking(booking)}
                                  >
                                    <Trash className="h-4 w-4" />
                                    <span className="sr-only">Delete</span>
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>

      {/* New/Edit Booking Dialog */}
      <Dialog open={openNewBooking} onOpenChange={setOpenNewBooking}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit Booking" : "New Booking"}</DialogTitle>
            <DialogDescription>
              {isEditMode 
                ? "Update the booking details below."
                : "Fill in the details to create a new booking."}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="customer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Smith" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="service"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service</FormLabel>
                      <FormControl>
                        <Input placeholder="Consultation" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="(555) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Any additional information about this booking" 
                        className="h-20"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpenNewBooking(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {isEditMode ? "Update Booking" : "Create Booking"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this booking? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="py-4">
              <p><strong>Customer:</strong> {selectedBooking.customer}</p>
              <p><strong>Service:</strong> {selectedBooking.service}</p>
              <p><strong>Date:</strong> {format(new Date(selectedBooking.date), "PPP 'at' p")}</p>
            </div>
          )}
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Bookings;
