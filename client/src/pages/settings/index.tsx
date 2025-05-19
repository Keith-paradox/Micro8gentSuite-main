import { useState, useEffect } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import Navbar from "@/components/dashboard/Navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  Avatar, 
  AvatarImage, 
  AvatarFallback 
} from "@/components/ui/avatar";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

// Profile form schema
const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().min(10, {
    message: "Phone number is required.",
  }).optional().or(z.literal("")),
  bio: z.string().max(500, {
    message: "Bio must not exceed 500 characters.",
  }).optional().or(z.literal("")),
});

// Security form schema
const securityFormSchema = z.object({
  currentPassword: z.string().min(1, {
    message: "Current password is required.",
  }),
  newPassword: z.string().min(6, {
    message: "New password must be at least 6 characters.",
  }),
  confirmPassword: z.string().min(6, {
    message: "Confirm password must be at least 6 characters.",
  }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

// Notification settings schema
const notificationFormSchema = z.object({
  emailNotifications: z.boolean(),
  bookingConfirmations: z.boolean(),
  callNotifications: z.boolean(),
  marketingEmails: z.boolean(),
});

// API Keys schema
const apiKeyFormSchema = z.object({
  name: z.string().min(2, {
    message: "API key name must be at least 2 characters.",
  }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type SecurityFormValues = z.infer<typeof securityFormSchema>;
type NotificationFormValues = z.infer<typeof notificationFormSchema>;
type ApiKeyFormValues = z.infer<typeof apiKeyFormSchema>;

// User type interface
interface UserData {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  phone?: string;
  bio?: string;
  avatarUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

// Mock API keys
const apiKeys = [
  {
    id: "api_1",
    name: "Production App",
    prefix: "mk1_",
    created: new Date(2023, 2, 15),
    lastUsed: new Date(2023, 3, 20),
  },
  {
    id: "api_2",
    name: "Development Testing",
    prefix: "mk1_",
    created: new Date(2023, 1, 10),
    lastUsed: new Date(2023, 3, 18),
  }
];

const Settings = () => {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showNewApiKeyDialog, setShowNewApiKeyDialog] = useState(false);
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Fetch current user data
  const { data: userData, isLoading, error } = useQuery<UserData>({
    queryKey: ['/api/auth/me'],
    retry: false,
  });
  
  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      bio: "",
    },
  });
  
  // Update form values when user data is loaded
  useEffect(() => {
    if (userData) {
      profileForm.reset({
        name: userData.fullName || userData.username || "",
        email: userData.email || "",
        phone: userData.phone || "",
        bio: userData.bio || "",
      });
    }
  }, [userData, profileForm]);

  // Security form
  const securityForm = useForm<SecurityFormValues>({
    resolver: zodResolver(securityFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Notification form
  const notificationForm = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
      emailNotifications: true,
      bookingConfirmations: true,
      callNotifications: true,
      marketingEmails: false,
    },
  });

  // API Key form
  const apiKeyForm = useForm<ApiKeyFormValues>({
    resolver: zodResolver(apiKeyFormSchema),
    defaultValues: {
      name: "",
    },
  });

  const onProfileSubmit = async (values: ProfileFormValues) => {
    try {
      // Create update object
      const updateData = {
        fullName: values.name,
        email: values.email,
        phone: values.phone,
        bio: values.bio,
      };
      
      // Update user profile via API
      await apiRequest("PUT", "/api/profile", updateData);
      
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      });
      
      // Update profile data in the UI
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    } catch (error) {
      toast({
        title: "Update failed",
        description: "There was an error updating your profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const onSecuritySubmit = async (values: SecurityFormValues) => {
    try {
      // In a real app, this would be an API call
      // await apiRequest("PUT", "/api/auth/change-password", values);
      
      toast({
        title: "Password changed",
        description: "Your password has been changed successfully.",
      });
      
      // Reset form
      securityForm.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast({
        title: "Password change failed",
        description: "The current password may be incorrect. Please try again.",
        variant: "destructive",
      });
    }
  };

  const onNotificationSubmit = async (values: NotificationFormValues) => {
    try {
      // In a real app, this would be an API call
      // await apiRequest("PUT", "/api/notification-settings", values);
      
      toast({
        title: "Notification settings updated",
        description: "Your notification preferences have been updated.",
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: "There was an error updating your notification settings.",
        variant: "destructive",
      });
    }
  };

  const onApiKeySubmit = async (values: ApiKeyFormValues) => {
    try {
      // In a real app, this would be an API call to create a new API key
      // const response = await apiRequest("POST", "/api/api-keys", values);
      
      // Mock API response
      const mockResponse = {
        apiKey: "mk1_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      };
      
      // Store the new API key to display to the user
      setNewApiKey(mockResponse.apiKey);
      
      // Close the form dialog and open the API key display dialog
      setShowNewApiKeyDialog(true);
      
      // Reset form
      apiKeyForm.reset({
        name: "",
      });
    } catch (error) {
      toast({
        title: "API key creation failed",
        description: "There was an error creating your API key. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteApiKey = async (keyId: string) => {
    try {
      // In a real app, this would be an API call
      // await apiRequest("DELETE", `/api/api-keys/${keyId}`, {});
      
      toast({
        title: "API key deleted",
        description: "The API key has been deleted successfully.",
      });
      
      // Update API keys in the UI
      // queryClient.invalidateQueries({ queryKey: ['/api/api-keys'] });
    } catch (error) {
      toast({
        title: "Deletion failed",
        description: "There was an error deleting the API key.",
        variant: "destructive",
      });
    }
  };

  const handleAvatarUpload = () => {
    // In a real app, this would trigger a file input
    setIsUploading(true);
    
    // Simulate upload delay
    setTimeout(() => {
      setIsUploading(false);
      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated successfully.",
      });
    }, 1500);
  };

  const handleDeleteAccount = () => {
    toast({
      title: "Account deletion requested",
      description: "A confirmation email has been sent to your registered email address.",
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
            <h1 className="text-lg font-semibold text-gray-900">Settings</h1>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Tabs defaultValue="profile">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                  <TabsTrigger value="notifications">Notifications</TabsTrigger>
                  <TabsTrigger value="api">API Keys</TabsTrigger>
                </TabsList>
                
                {/* Profile Tab */}
                <TabsContent value="profile">
                  <Card>
                    <CardHeader>
                      <CardTitle>Profile</CardTitle>
                      <CardDescription>
                        Manage your personal information
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col md:flex-row gap-8">
                        {/* Avatar Section */}
                        <div className="flex flex-col items-center space-y-4">
                          <Avatar className="h-24 w-24">
                            {userData?.avatarUrl ? (
                              <AvatarImage src={userData.avatarUrl} alt={userData.fullName || userData.username} />
                            ) : (
                              <AvatarFallback className="text-2xl">
                                {userData ? (userData.fullName || userData.username).split(" ").map((n: string) => n[0]).join("") : "U"}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <Button 
                            variant="outline" 
                            onClick={handleAvatarUpload}
                            disabled={isUploading || isLoading}
                          >
                            {isUploading ? "Uploading..." : "Change Avatar"}
                          </Button>
                        </div>
                        
                        {/* Profile Form */}
                        <div className="flex-1">
                          <Form {...profileForm}>
                            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                              <FormField
                                control={profileForm.control}
                                name="name"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl>
                                      <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={profileForm.control}
                                name="email"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                      <Input type="email" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={profileForm.control}
                                name="phone"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Phone Number</FormLabel>
                                    <FormControl>
                                      <Input {...field} />
                                    </FormControl>
                                    <FormDescription>
                                      Your phone number will be used for account recovery
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={profileForm.control}
                                name="bio"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Bio</FormLabel>
                                    <FormControl>
                                      <Textarea 
                                        className="h-24"
                                        placeholder="Tell us a little about yourself"
                                        {...field} 
                                      />
                                    </FormControl>
                                    <FormDescription>
                                      You can @mention other users and organizations to link to them.
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <Button type="submit">Save Changes</Button>
                            </form>
                          </Form>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Danger Zone */}
                  <Card className="mt-6 border-red-100">
                    <CardHeader>
                      <CardTitle className="text-red-600">Danger Zone</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-500">
                        Once you delete your account, there is no going back. This action cannot be undone.
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="destructive" onClick={handleDeleteAccount}>Delete Account</Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
                
                {/* Security Tab */}
                <TabsContent value="security">
                  <Card>
                    <CardHeader>
                      <CardTitle>Security</CardTitle>
                      <CardDescription>
                        Manage your account security
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...securityForm}>
                        <form onSubmit={securityForm.handleSubmit(onSecuritySubmit)} className="space-y-6">
                          <FormField
                            control={securityForm.control}
                            name="currentPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Current Password</FormLabel>
                                <FormControl>
                                  <Input type="password" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={securityForm.control}
                            name="newPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>New Password</FormLabel>
                                <FormControl>
                                  <Input type="password" {...field} />
                                </FormControl>
                                <FormDescription>
                                  Password must be at least 6 characters
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={securityForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Confirm New Password</FormLabel>
                                <FormControl>
                                  <Input type="password" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <Button type="submit">Change Password</Button>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                  
                  {/* Two-Factor Authentication */}
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle>Two-Factor Authentication</CardTitle>
                      <CardDescription>
                        Add an extra layer of security to your account
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium">Authenticator App</h3>
                          <p className="text-sm text-gray-500">
                            Use an authenticator app to generate one-time codes.
                          </p>
                        </div>
                        <Button variant="outline">Setup</Button>
                      </div>
                      
                      <div className="border-t border-gray-200 my-6"></div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium">SMS Authentication</h3>
                          <p className="text-sm text-gray-500">
                            Receive one-time codes via SMS.
                          </p>
                        </div>
                        <Button variant="outline">Setup</Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Sessions */}
                  <Card className="mt-6">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>Sessions</CardTitle>
                          <CardDescription>
                            Manage your active sessions
                          </CardDescription>
                        </div>
                        <Button variant="outline">Sign Out All Sessions</Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-sm font-medium">Current Session</h3>
                              <p className="text-xs text-gray-500">
                                Chrome on Windows • San Francisco, CA, USA • 192.168.1.1
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Started April 20, 2023 at 2:30 PM
                              </p>
                            </div>
                            <Badge className="bg-green-100 text-green-800">Active</Badge>
                          </div>
                        </div>
                        
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-sm font-medium">Mobile App</h3>
                              <p className="text-xs text-gray-500">
                                iPhone 13 • San Francisco, CA, USA • 192.168.1.2
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Started April 18, 2023 at 10:15 AM
                              </p>
                            </div>
                            <Button variant="ghost" size="sm">Sign Out</Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Notifications Tab */}
                <TabsContent value="notifications">
                  <Card>
                    <CardHeader>
                      <CardTitle>Notification Settings</CardTitle>
                      <CardDescription>
                        Manage your notification preferences
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...notificationForm}>
                        <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-6">
                          <FormField
                            control={notificationForm.control}
                            name="emailNotifications"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">Email Notifications</FormLabel>
                                  <FormDescription>
                                    Receive notifications via email
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={notificationForm.control}
                            name="bookingConfirmations"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">Booking Confirmations</FormLabel>
                                  <FormDescription>
                                    Receive notifications when bookings are created or modified
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={notificationForm.control}
                            name="callNotifications"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">Call Notifications</FormLabel>
                                  <FormDescription>
                                    Receive notifications for missed calls and messages
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={notificationForm.control}
                            name="marketingEmails"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">Marketing Emails</FormLabel>
                                  <FormDescription>
                                    Receive emails about new features and promotions
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <Button type="submit">Save Preferences</Button>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* API Keys Tab */}
                <TabsContent value="api">
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>API Keys</CardTitle>
                          <CardDescription>
                            Manage API keys for programmatic access
                          </CardDescription>
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button>Create API Key</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Create API Key</DialogTitle>
                              <DialogDescription>
                                Give your API key a name to help you identify it later.
                              </DialogDescription>
                            </DialogHeader>
                            <Form {...apiKeyForm}>
                              <form onSubmit={apiKeyForm.handleSubmit(onApiKeySubmit)} className="space-y-6">
                                <FormField
                                  control={apiKeyForm.control}
                                  name="name"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>API Key Name</FormLabel>
                                      <FormControl>
                                        <Input placeholder="e.g. Production Server" {...field} />
                                      </FormControl>
                                      <FormDescription>
                                        This is only for your reference and won't affect the key's functionality.
                                      </FormDescription>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <DialogFooter>
                                  <Button type="submit">Create API Key</Button>
                                </DialogFooter>
                              </form>
                            </Form>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {apiKeys.length > 0 ? (
                        <div className="space-y-4">
                          {apiKeys.map((key) => (
                            <div key={key.id} className="p-4 border rounded-lg">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className="text-sm font-medium">{key.name}</h3>
                                  <p className="text-xs text-gray-500">
                                    {key.prefix}••••••••
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    Created on {new Date(key.created).toLocaleDateString()} • Last used on {new Date(key.lastUsed).toLocaleDateString()}
                                  </p>
                                </div>
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => handleDeleteApiKey(key.id)}
                                >
                                  Revoke
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
                            />
                          </svg>
                          <h3 className="mt-2 text-sm font-medium text-gray-900">No API keys</h3>
                          <p className="mt-1 text-sm text-gray-500">
                            Create an API key to get started.
                          </p>
                          <div className="mt-6">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button>Create API Key</Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Create API Key</DialogTitle>
                                  <DialogDescription>
                                    Give your API key a name to help you identify it later.
                                  </DialogDescription>
                                </DialogHeader>
                                <Form {...apiKeyForm}>
                                  <form onSubmit={apiKeyForm.handleSubmit(onApiKeySubmit)} className="space-y-6">
                                    <FormField
                                      control={apiKeyForm.control}
                                      name="name"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>API Key Name</FormLabel>
                                          <FormControl>
                                            <Input placeholder="e.g. Production Server" {...field} />
                                          </FormControl>
                                          <FormDescription>
                                            This is only for your reference and won't affect the key's functionality.
                                          </FormDescription>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    <DialogFooter>
                                      <Button type="submit">Create API Key</Button>
                                    </DialogFooter>
                                  </form>
                                </Form>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  {/* API Documentation */}
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle>API Documentation</CardTitle>
                      <CardDescription>
                        Learn how to use our API
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-4 border rounded-lg">
                          <h3 className="text-sm font-medium">Getting Started Guide</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            Learn how to authenticate and make your first API request.
                          </p>
                          <Button variant="link" className="px-0 mt-2" asChild>
                            <a href="#" target="_blank" rel="noopener noreferrer">
                              View Guide
                            </a>
                          </Button>
                        </div>
                        
                        <div className="p-4 border rounded-lg">
                          <h3 className="text-sm font-medium">API Reference</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            Complete documentation of all API endpoints.
                          </p>
                          <Button variant="link" className="px-0 mt-2" asChild>
                            <a href="#" target="_blank" rel="noopener noreferrer">
                              View Reference
                            </a>
                          </Button>
                        </div>
                        
                        <div className="p-4 border rounded-lg">
                          <h3 className="text-sm font-medium">Code Samples</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            Sample code snippets for various programming languages.
                          </p>
                          <Button variant="link" className="px-0 mt-2" asChild>
                            <a href="#" target="_blank" rel="noopener noreferrer">
                              View Samples
                            </a>
                          </Button>
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
      
      {/* This section was causing component errors - removed */}
      
      {/* New API Key Dialog */}
      <Dialog open={showNewApiKeyDialog} onOpenChange={setShowNewApiKeyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>API Key Created</DialogTitle>
            <DialogDescription>
              Your new API key has been created. This is the only time you'll be able to see it, so please copy it now.
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-gray-50 p-4 rounded-md overflow-x-auto my-4">
            <code className="text-sm break-all">{newApiKey}</code>
          </div>
          
          <p className="text-sm text-amber-600">
            Make sure to store this key securely. For security reasons, we won't be able to show it again.
          </p>
          
          <DialogFooter>
            <Button 
              onClick={() => {
                navigator.clipboard.writeText(newApiKey || "");
                toast({
                  title: "Copied to clipboard",
                  description: "The API key has been copied to your clipboard.",
                });
              }}
            >
              Copy to Clipboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;
