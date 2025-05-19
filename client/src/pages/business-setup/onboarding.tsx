import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader } from "@/components/ui/loader";
import { Building, Clock } from "lucide-react";

// Step 1: Business Type Schema
const businessTypeSchema = z.object({
  businessName: z.string().min(2, {
    message: "Business name must be at least 2 characters.",
  }),
  businessType: z.enum([
    "restaurant",
    "lawyer_office",
    "dental_clinic",
    "hair_salon",
    "retail_store",
    "medical_clinic",
    "fitness_center",
    "spa",
    "auto_repair",
    "real_estate",
    "other"
  ], {
    message: "Please select a business type.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  country: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }).optional(),
  website: z.string().url({
    message: "Please enter a valid website URL (include http:// or https://).",
  }).optional(),
});

type BusinessTypeValues = z.infer<typeof businessTypeSchema>;

// Step 2: Hours of Operation Schema
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

const BusinessOnboarding = () => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [businessInfo, setBusinessInfo] = useState<BusinessTypeValues | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Business type form
  const businessTypeForm = useForm<BusinessTypeValues>({
    resolver: zodResolver(businessTypeSchema),
    defaultValues: {
      businessName: "",
      businessType: "restaurant",
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

  // Business type submission
  const onSubmitBusinessType = async (values: BusinessTypeValues) => {
    setIsLoading(true);
    
    try {
      await apiRequest("POST", "/api/business/setup", {
        businessName: values.businessName,
        businessType: values.businessType,
        description: values.description,
        address: values.address,
        city: values.city,
        state: values.state,
        zip: values.zip,
        country: values.country,
        phone: values.phone,
        email: values.email,
        website: values.website
      });
      
      // Invalidate the business setup status to reflect the updated business info
      queryClient.invalidateQueries({ queryKey: ['/api/business/setup/status'] });
      
      setBusinessInfo(values);
      setStep(2);
      
      toast({
        title: "Business information saved",
        description: "Now let's set your operating hours.",
      });
    } catch (error) {
      console.error("Error saving business information:", error);
      toast({
        title: "Error",
        description: "Failed to save business information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Hours of operation submission
  const onSubmitHours = async (values: HoursOfOperationValues) => {
    setIsLoading(true);
    
    try {
      await apiRequest("PUT", "/api/business/hours/setup", values);
      
      toast({
        title: "Setup complete!",
        description: "Your business is ready to use Micro8gents.",
      });
      
      // Invalidate cache to load fresh data
      queryClient.invalidateQueries({ queryKey: ['/api/business/info'] });
      queryClient.invalidateQueries({ queryKey: ['/api/business/hours'] });
      
      // Critical: Invalidate the business setup status to reflect the completed setup
      queryClient.invalidateQueries({ queryKey: ['/api/business/setup/status'] });
      
      // Redirect to dashboard after successful setup
      setTimeout(() => {
        setLocation("/dashboard");
      }, 1500);
    } catch (error) {
      console.error("Error saving hours:", error);
      toast({
        title: "Error",
        description: "Failed to save operating hours. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Render day of week input
  const renderDayInput = (day: keyof HoursOfOperationValues, label: string) => {
    return (
      <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4 items-start sm:items-center border-b pb-4">
        <div className="w-24 font-medium">{label}</div>
        <div className="flex-1 flex flex-wrap gap-4 items-center">
          <FormField
            control={hoursForm.control}
            name={`${day}.isOpen`}
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="text-sm font-normal">
                  Open
                </FormLabel>
              </FormItem>
            )}
          />
          
          {Boolean(hoursForm.getValues()[day]?.isOpen) && (
            <div className="flex items-center gap-2">
              <FormField
                control={hoursForm.control}
                name={`${day}.open`}
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormControl>
                      <Input
                        type="time"
                        {...field}
                        className="w-28"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <span>to</span>
              <FormField
                control={hoursForm.control}
                name={`${day}.close`}
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormControl>
                      <Input
                        type="time"
                        {...field}
                        className="w-28"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  // Business types display map
  const businessTypeOptions = [
    { value: "restaurant", label: "Restaurant" },
    { value: "lawyer_office", label: "Lawyer Office" },
    { value: "dental_clinic", label: "Dental Clinic" },
    { value: "hair_salon", label: "Hair Salon" },
    { value: "retail_store", label: "Retail Store" },
    { value: "medical_clinic", label: "Medical Clinic" },
    { value: "fitness_center", label: "Fitness Center" },
    { value: "spa", label: "Spa & Wellness" },
    { value: "auto_repair", label: "Auto Repair" },
    { value: "real_estate", label: "Real Estate" },
    { value: "other", label: "Other" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-3xl">
        {/* Welcome Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 text-transparent bg-clip-text">
            Welcome to Micro8gents
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Let's get your business set up to use our AI assistant
          </p>
        </div>

        {/* Step indicators */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center">
            <div className={`rounded-full h-10 w-10 flex items-center justify-center border-2 ${
              step === 1 ? "border-primary bg-primary text-white" : "border-primary text-primary"
            }`}>
              1
            </div>
            <div className="h-1 w-10 bg-gray-200">
              <div className={`h-full ${step === 2 ? "bg-primary" : "bg-gray-200"}`}></div>
            </div>
            <div className={`rounded-full h-10 w-10 flex items-center justify-center border-2 ${
              step === 2 ? "border-primary bg-primary text-white" : "border-primary text-primary"
            }`}>
              2
            </div>
          </div>
        </div>

        {/* Step 1: Business Type */}
        {step === 1 && (
          <Card className="shadow-lg">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl flex items-center">
                <Building className="w-6 h-6 mr-2 text-primary" />
                About Your Business
              </CardTitle>
              <CardDescription>
                Tell us about your business so we can personalize your AI assistant
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...businessTypeForm}>
                <form onSubmit={businessTypeForm.handleSubmit(onSubmitBusinessType)} className="space-y-6">
                  <FormField
                    control={businessTypeForm.control}
                    name="businessName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your business name" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={businessTypeForm.control}
                    name="businessType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Type</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a business type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {businessTypeOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          This helps us tailor the AI assistant to your specific industry
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={businessTypeForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Description</FormLabel>
                        <FormControl>
                          <textarea
                            className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Describe your business, services, and what makes you unique..."
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          This description will help your AI assistant accurately represent your business
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Contact Information Section */}
                  <div className="pt-4 pb-2">
                    <h3 className="text-lg font-medium">Contact Information</h3>
                    <p className="text-sm text-muted-foreground">
                      How customers can reach your business
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={businessTypeForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="+1 (555) 123-4567 or international format" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Include country code for international numbers (e.g., +44 for UK)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={businessTypeForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="contact@yourbusiness.com" 
                              type="email"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={businessTypeForm.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://www.yourbusiness.com" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Include http:// or https:// in your website URL
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Address Section */}
                  <div className="pt-4 pb-2">
                    <h3 className="text-lg font-medium">Business Address</h3>
                    <p className="text-sm text-muted-foreground">
                      Where your business is located
                    </p>
                  </div>

                  <FormField
                    control={businessTypeForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Street address or building number" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={businessTypeForm.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="City or town" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={businessTypeForm.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State/Province/Region</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="State, province, or region" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            State, province, or administrative region
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={businessTypeForm.control}
                      name="zip"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Postal/ZIP Code</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Postal or ZIP code" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={businessTypeForm.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Country" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="pt-4">
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? <Loader size="sm" inline /> : 'Continue to Hours Setup'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Hours of Operation */}
        {step === 2 && (
          <Card className="shadow-lg">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl flex items-center">
                <Clock className="w-6 h-6 mr-2 text-primary" />
                Business Hours
              </CardTitle>
              <CardDescription>
                Set your regular business hours for each day of the week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...hoursForm}>
                <form onSubmit={hoursForm.handleSubmit(onSubmitHours)} className="space-y-6">
                  <div className="space-y-2">
                    {renderDayInput("monday", "Monday")}
                    {renderDayInput("tuesday", "Tuesday")}
                    {renderDayInput("wednesday", "Wednesday")}
                    {renderDayInput("thursday", "Thursday")}
                    {renderDayInput("friday", "Friday")}
                    {renderDayInput("saturday", "Saturday")}
                    {renderDayInput("sunday", "Sunday")}
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setStep(1)}
                      disabled={isLoading}
                    >
                      Back
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? <Loader size="sm" inline /> : 'Complete Setup'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="justify-center text-sm text-muted-foreground pt-0">
              You can always update your hours later in the Business Setup section
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
};

export default BusinessOnboarding;