import { useState, useEffect } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import Navbar from "@/components/dashboard/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Building, Clock, MapPin, Phone } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Loader } from "@/components/ui/loader";

const businessInfoSchema = z.object({
  businessName: z.string().min(2, {
    message: "Business name must be at least 2 characters."
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters."
  }),
  address: z.string().min(5, {
    message: "Address is required."
  }),
  city: z.string().min(2, {
    message: "City is required."
  }),
  state: z.string().min(2, {
    message: "State/Province/Region is required."
  }),
  zip: z.string().min(5, {
    message: "Postal/ZIP code is required."
  }),
  country: z.string().min(2, {
    message: "Country is required."
  }),
  phone: z.string().min(10, {
    message: "Phone number is required."
  }),
  email: z.string().email({
    message: "Please enter a valid email address."
  }),
  website: z.string().url({
    message: "Please enter a valid URL."
  }).optional().or(z.literal("")),
});

type BusinessInfoValues = z.infer<typeof businessInfoSchema>;

const hoursOfOperationSchema = z.object({
  monday: z.object({
    open: z.string(),
    close: z.string(),
    isOpen: z.boolean(),
  }),
  tuesday: z.object({
    open: z.string(),
    close: z.string(),
    isOpen: z.boolean(),
  }),
  wednesday: z.object({
    open: z.string(),
    close: z.string(),
    isOpen: z.boolean(),
  }),
  thursday: z.object({
    open: z.string(),
    close: z.string(),
    isOpen: z.boolean(),
  }),
  friday: z.object({
    open: z.string(),
    close: z.string(),
    isOpen: z.boolean(),
  }),
  saturday: z.object({
    open: z.string(),
    close: z.string(),
    isOpen: z.boolean(),
  }),
  sunday: z.object({
    open: z.string(),
    close: z.string(),
    isOpen: z.boolean(),
  }),
});

type HoursOfOperationValues = z.infer<typeof hoursOfOperationSchema>;

const faqSchema = z.object({
  faqs: z.array(z.object({
    question: z.string().min(5, {
      message: "Question must be at least 5 characters."
    }),
    answer: z.string().min(5, {
      message: "Answer must be at least 5 characters."
    }),
  })),
});

type FaqValues = z.infer<typeof faqSchema>;

const BusinessSetup = () => {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const { toast } = useToast();

  // Define types for the API responses
  interface BusinessInfo {
    businessName: string;
    description: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    phone: string;
    email: string;
    website: string;
    id: number;
    userId: number;
    createdAt: string;
    updatedAt: string;
  }

  interface HoursOfOperation {
    id: number;
    businessId: number;
    dayOfWeek: string;
    openTime: string;
    closeTime: string;
    isOpen: boolean;
  }

  interface FAQ {
    id: number;
    businessId: number;
    question: string;
    answer: string;
  }

  // Fetch business information
  const { data: businessInfo, isLoading: businessLoading } = useQuery<BusinessInfo>({
    queryKey: ['/api/business/info'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch hours of operation
  // Note: API returns an object, not an array
  const { data: hoursData, isLoading: hoursLoading } = useQuery<Record<string, {open: string, close: string, isOpen: boolean}>>({
    queryKey: ['/api/business/hours'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch FAQs
  const { data: faqsData, isLoading: faqsLoading } = useQuery<FAQ[]>({
    queryKey: ['/api/business/faqs'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Business info form
  const businessInfoForm = useForm<BusinessInfoValues>({
    resolver: zodResolver(businessInfoSchema),
    defaultValues: {
      businessName: "",
      description: "",
      address: "",
      city: "",
      state: "",
      zip: "",
      country: "",
      phone: "",
      email: "",
      website: "",
    },
  });

  // Hours of operation form
  const hoursForm = useForm<HoursOfOperationValues>({
    resolver: zodResolver(hoursOfOperationSchema),
    defaultValues: {
      monday: { open: "09:00", close: "17:00", isOpen: true },
      tuesday: { open: "09:00", close: "17:00", isOpen: true },
      wednesday: { open: "09:00", close: "17:00", isOpen: true },
      thursday: { open: "09:00", close: "17:00", isOpen: true },
      friday: { open: "09:00", close: "17:00", isOpen: true },
      saturday: { open: "10:00", close: "15:00", isOpen: false },
      sunday: { open: "10:00", close: "15:00", isOpen: false },
    },
  });

  // FAQs form
  const faqForm = useForm<FaqValues>({
    resolver: zodResolver(faqSchema),
    defaultValues: {
      faqs: [
        { question: "", answer: "" },
      ],
    },
  });

  // Update form values when data is loaded
  useEffect(() => {
    if (businessInfo) {
      // Reset form with business data
      businessInfoForm.reset({
        businessName: businessInfo.businessName || "",
        description: businessInfo.description || "",
        address: businessInfo.address || "",
        city: businessInfo.city || "",
        state: businessInfo.state || "",
        zip: businessInfo.zip || "",
        country: businessInfo.country || "",
        phone: businessInfo.phone || "",
        email: businessInfo.email || "",
        website: businessInfo.website || "",
      });
    }
  }, [businessInfo, businessInfoForm]);

  // Update hours form when data is loaded
  useEffect(() => {
    if (hoursData) {
      console.log("Raw hours data:", JSON.stringify(hoursData));
      
      // Data from API is already in the correct format
      // Create a copy to avoid direct reference and ensure the data format matches our form
      const formattedHours: HoursOfOperationValues = {
        monday: hoursData.monday ? { 
          open: hoursData.monday.open || "09:00",
          close: hoursData.monday.close || "17:00", 
          isOpen: !!hoursData.monday.isOpen 
        } : { open: "09:00", close: "17:00", isOpen: true },
        tuesday: hoursData.tuesday ? { 
          open: hoursData.tuesday.open || "09:00", 
          close: hoursData.tuesday.close || "17:00", 
          isOpen: !!hoursData.tuesday.isOpen 
        } : { open: "09:00", close: "17:00", isOpen: true },
        wednesday: hoursData.wednesday ? { 
          open: hoursData.wednesday.open || "09:00", 
          close: hoursData.wednesday.close || "17:00", 
          isOpen: !!hoursData.wednesday.isOpen 
        } : { open: "09:00", close: "17:00", isOpen: true },
        thursday: hoursData.thursday ? { 
          open: hoursData.thursday.open || "09:00", 
          close: hoursData.thursday.close || "17:00", 
          isOpen: !!hoursData.thursday.isOpen 
        } : { open: "09:00", close: "17:00", isOpen: true },
        friday: hoursData.friday ? { 
          open: hoursData.friday.open || "09:00", 
          close: hoursData.friday.close || "17:00", 
          isOpen: !!hoursData.friday.isOpen 
        } : { open: "09:00", close: "17:00", isOpen: true },
        saturday: hoursData.saturday ? { 
          open: hoursData.saturday.open || "10:00", 
          close: hoursData.saturday.close || "15:00", 
          isOpen: !!hoursData.saturday.isOpen 
        } : { open: "10:00", close: "15:00", isOpen: false },
        sunday: hoursData.sunday ? { 
          open: hoursData.sunday.open || "10:00", 
          close: hoursData.sunday.close || "15:00", 
          isOpen: !!hoursData.sunday.isOpen 
        } : { open: "10:00", close: "15:00", isOpen: false },
      };
      
      console.log("Formatted hours:", JSON.stringify(formattedHours));
      hoursForm.reset(formattedHours);
    }
  }, [hoursData, hoursForm]);

  // Update FAQs form when data is loaded
  useEffect(() => {
    console.log("FAQs data received:", faqsData);
    
    const formattedFaqs = {
      faqs: Array.isArray(faqsData) && faqsData.length > 0
        ? faqsData.map((faq: any) => ({
            question: faq.question || "",
            answer: faq.answer || ""
          }))
        : [{ question: "", answer: "" }]
    };
    
    console.log("Formatted FAQs for form:", formattedFaqs);
    faqForm.reset(formattedFaqs);
  }, [faqsData, faqForm]);

  const onSubmitBusinessInfo = async (values: BusinessInfoValues) => {
    try {
      await apiRequest("PUT", "/api/business/info", values);
      queryClient.invalidateQueries({ queryKey: ['/api/business/info'] });
      toast({
        title: "Success",
        description: "Business information updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update business information.",
        variant: "destructive",
      });
    }
  };

  const onSubmitHours = async (values: HoursOfOperationValues) => {
    try {
      await apiRequest("PUT", "/api/business/hours", values);
      queryClient.invalidateQueries({ queryKey: ['/api/business/hours'] });
      toast({
        title: "Success",
        description: "Hours of operation updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update hours of operation.",
        variant: "destructive",
      });
    }
  };

  const onSubmitFaq = async (values: FaqValues) => {
    try {
      console.log("Submitting FAQs:", JSON.stringify(values));
      const response = await apiRequest("PUT", "/api/business/faqs", values);
      console.log("FAQs API response:", JSON.stringify(response));
      queryClient.invalidateQueries({ queryKey: ['/api/business/faqs'] });
      toast({
        title: "Success",
        description: "FAQs updated successfully.",
      });
    } catch (error) {
      console.error("Error updating FAQs:", error);
      toast({
        title: "Error",
        description: "Failed to update FAQs.",
        variant: "destructive",
      });
    }
  };

  const addFaq = () => {
    const currentFaqs = faqForm.getValues("faqs");
    faqForm.setValue("faqs", [...currentFaqs, { question: "", answer: "" }]);
  };

  const removeFaq = (index: number) => {
    const currentFaqs = faqForm.getValues("faqs");
    faqForm.setValue("faqs", currentFaqs.filter((_, i) => i !== index));
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
            <h1 className="text-lg font-semibold text-gray-900">Business Setup</h1>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="general">General Information</TabsTrigger>
                  <TabsTrigger value="hours">Hours of Operation</TabsTrigger>
                  <TabsTrigger value="faqs">FAQs</TabsTrigger>
                </TabsList>
                
                <TabsContent value="general" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>General Information</CardTitle>
                      <CardDescription>
                        Set up your basic business information for your AI assistant.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {businessLoading ? (
                        <div className="flex items-center justify-center py-10">
                          <Loader text="Loading business information..." />
                        </div>
                      ) : (
                        <Form {...businessInfoForm}>
                          <form onSubmit={businessInfoForm.handleSubmit(onSubmitBusinessInfo)} className="space-y-6">
                          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <FormField
                              control={businessInfoForm.control}
                              name="businessName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Business Name</FormLabel>
                                  <FormControl>
                                    <div className="flex items-center">
                                      <Building className="w-4 h-4 mr-2 text-gray-500" />
                                      <Input placeholder="Your Business Name" {...field} />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={businessInfoForm.control}
                              name="phone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Phone Number</FormLabel>
                                  <FormControl>
                                    <div className="flex items-center">
                                      <Phone className="w-4 h-4 mr-2 text-gray-500" />
                                      <Input placeholder="(555) 123-4567" {...field} />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <FormField
                            control={businessInfoForm.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Business Description</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Describe your business and services" 
                                    className="h-24"
                                    {...field} 
                                  />
                                </FormControl>
                                <FormDescription>
                                  This description will be used by the AI assistant to describe your business.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={businessInfoForm.control}
                            name="address"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Street Address</FormLabel>
                                <FormControl>
                                  <div className="flex items-center">
                                    <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                                    <Input placeholder="123 Main Street" {...field} />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <FormField
                              control={businessInfoForm.control}
                              name="city"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>City</FormLabel>
                                  <FormControl>
                                    <Input placeholder="City" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={businessInfoForm.control}
                              name="country"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Country</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Country" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <FormField
                              control={businessInfoForm.control}
                              name="state"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>State/Province/Region</FormLabel>
                                  <FormControl>
                                    <Input placeholder="State, Province, or Region" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={businessInfoForm.control}
                              name="zip"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Postal/ZIP Code</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Postal or ZIP Code" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <FormField
                              control={businessInfoForm.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Email</FormLabel>
                                  <FormControl>
                                    <Input type="email" placeholder="contact@yourbusiness.com" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={businessInfoForm.control}
                              name="website"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Website</FormLabel>
                                  <FormControl>
                                    <Input placeholder="https://yourbusiness.com" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <Button type="submit">Save Information</Button>
                        </form>
                      </Form>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="hours" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Hours of Operation</CardTitle>
                      <CardDescription>
                        Set your business hours for each day of the week. This information will be used by the AI assistant.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {hoursLoading ? (
                        <div className="flex items-center justify-center py-10">
                          <Loader text="Loading hours of operation..." />
                        </div>
                      ) : (
                        <Form {...hoursForm}>
                          <form onSubmit={hoursForm.handleSubmit(onSubmitHours)} className="space-y-6">
                          {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                            <div key={day} className="flex items-center space-x-4">
                              <div className="w-24 font-medium capitalize">{day}</div>
                              
                              <FormField
                                control={hoursForm.control}
                                name={`${day}.isOpen` as any}
                                render={({ field }) => (
                                  <FormItem className="flex items-center space-x-2">
                                    <FormControl>
                                      <input
                                        type="checkbox"
                                        checked={field.value}
                                        onChange={field.onChange}
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                      />
                                    </FormControl>
                                    <FormLabel className="m-0">Open</FormLabel>
                                  </FormItem>
                                )}
                              />
                              
                              <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4 text-gray-500" />
                                <FormField
                                  control={hoursForm.control}
                                  name={`${day}.open` as any}
                                  render={({ field }) => (
                                    <FormItem className="flex-1">
                                      <FormControl>
                                        <Input
                                          type="time"
                                          {...field}
                                          disabled={!hoursForm.watch(`${day}.isOpen` as any)}
                                        />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                                
                                <span>to</span>
                                
                                <FormField
                                  control={hoursForm.control}
                                  name={`${day}.close` as any}
                                  render={({ field }) => (
                                    <FormItem className="flex-1">
                                      <FormControl>
                                        <Input
                                          type="time"
                                          {...field}
                                          disabled={!hoursForm.watch(`${day}.isOpen` as any)}
                                        />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>
                          ))}
                          
                          <Button type="submit">Save Hours</Button>
                        </form>
                      </Form>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="faqs" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Frequently Asked Questions</CardTitle>
                      <CardDescription>
                        Add frequently asked questions and answers about your business. These will help the AI assistant respond to common queries.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {faqsLoading ? (
                        <div className="flex items-center justify-center py-10">
                          <Loader text="Loading FAQs..." />
                        </div>
                      ) : (
                        <Form {...faqForm}>
                          <form onSubmit={faqForm.handleSubmit(onSubmitFaq)} className="space-y-6">
                          {faqForm.watch("faqs").map((_, index) => (
                            <div key={index} className="p-4 border border-gray-200 rounded-md">
                              <div className="flex justify-between items-center mb-4">
                                <h3 className="text-sm font-medium">FAQ #{index + 1}</h3>
                                {index > 0 && (
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => removeFaq(index)}
                                  >
                                    Remove
                                  </Button>
                                )}
                              </div>
                              
                              <div className="space-y-4">
                                <FormField
                                  control={faqForm.control}
                                  name={`faqs.${index}.question`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Question</FormLabel>
                                      <FormControl>
                                        <Input placeholder="E.g., What are your business hours?" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                
                                <FormField
                                  control={faqForm.control}
                                  name={`faqs.${index}.answer`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Answer</FormLabel>
                                      <FormControl>
                                        <Textarea
                                          placeholder="E.g., We're open Monday to Friday from 9 AM to 5 PM."
                                          className="h-20"
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>
                          ))}
                          
                          <Button
                            type="button"
                            variant="outline"
                            onClick={addFaq}
                            className="w-full"
                          >
                            + Add Another FAQ
                          </Button>
                          
                          <Button type="submit">Save FAQs</Button>
                        </form>
                      </Form>
                      )}
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

export default BusinessSetup;
