import { useState } from "react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Check, CreditCard, Download, HelpCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Subscription } from "@/lib/types";

// Define plan features and details
const planFeatures = {
  free: [
    "1 voice assistant number",
    "50 call minutes per month",
    "Basic call analytics",
    "Business hours management",
    "Email support"
  ],
  basic: [
    "2 voice assistant numbers",
    "500 call minutes per month",
    "Advanced call analytics",
    "Booking management",
    "Custom voice selection",
    "Priority email support"
  ],
  premium: [
    "5 voice assistant numbers",
    "2000 call minutes per month",
    "Premium call analytics & insights",
    "Advanced booking management",
    "Custom voice training",
    "Multiple business locations",
    "24/7 priority support"
  ],
  enterprise: [
    "Unlimited voice assistant numbers",
    "Unlimited call minutes",
    "Custom analytics & reporting",
    "Enterprise-grade integrations",
    "Dedicated account manager",
    "Custom workflow automation",
    "SLA guarantees"
  ]
};

const planPricing = {
  free: { monthly: 0, annually: 0 },
  basic: { monthly: 49, annually: 470 },
  premium: { monthly: 149, annually: 1430 },
  enterprise: { monthly: "Custom", annually: "Custom" }
};

const SubscriptionPage = () => {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annually">("monthly");
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"free" | "basic" | "premium" | "enterprise">("basic");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCreditCardForm, setShowCreditCardForm] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch the current subscription data from the API
  const { data: subscriptionData, isLoading: isLoadingSubscription } = useQuery<Subscription>({ 
    queryKey: ['/api/subscriptions/current'],
    retry: false,
    staleTime: 1000 * 60 * 5 // 5 minutes
  });
  
  // Current subscription - use API data if available, otherwise use default values
  const currentSubscription = {
    plan: (subscriptionData?.plan as "free" | "basic" | "premium" | "enterprise") || "free",
    status: (subscriptionData?.status as "active" | "canceled" | "past_due" | "trialing") || "active",
    currentPeriodStart: subscriptionData?.currentPeriodStart ? new Date(subscriptionData.currentPeriodStart) : new Date(2023, 3, 1),
    currentPeriodEnd: subscriptionData?.currentPeriodEnd ? new Date(subscriptionData.currentPeriodEnd) : new Date(2023, 4, 1),
    usage: {
      // This would be calculated from actual call data in a real app
      callMinutes: 32, // This would need to come from a calls API endpoint
      // Set allowance based on plan
      totalAllowed: (subscriptionData?.plan as string) === "free" ? 50 :
                    (subscriptionData?.plan as string) === "basic" ? 1000 :
                    (subscriptionData?.plan as string) === "premium" ? 5000 : 10000
    }
  };

  // Mock data for payment methods
  const paymentMethods = [
    {
      id: "card_1",
      type: "card",
      brand: "visa",
      last4: "4242",
      expMonth: 12,
      expYear: 2024,
      isDefault: true
    }
  ];

  // Mock data for invoices
  const invoices = [
    {
      id: "inv_001",
      amount: 0,
      status: "paid",
      date: new Date(2023, 3, 1),
      periodStart: new Date(2023, 3, 1),
      periodEnd: new Date(2023, 4, 1),
      pdf: "#"
    },
    {
      id: "inv_002",
      amount: 0,
      status: "paid",
      date: new Date(2023, 2, 1),
      periodStart: new Date(2023, 2, 1),
      periodEnd: new Date(2023, 3, 1),
      pdf: "#"
    }
  ];

  const handleUpgradePlan = (plan: "free" | "basic" | "premium" | "enterprise") => {
    setSelectedPlan(plan);
    setShowUpgradeDialog(true);
  };

  const handleConfirmUpgrade = async () => {
    setIsProcessing(true);
    
    try {
      // Create a checkout session for the selected plan
      const response = await apiRequest("POST", "/api/subscriptions/checkout", { 
        plan: selectedPlan, 
        billingCycle 
      });
      
      if (response.url) {
        // Redirect to the Stripe checkout page
        window.location.href = response.url;
      } else {
        throw new Error("No checkout URL returned from the server");
      }
      
      // Close the dialog (this will only run if the redirect doesn't happen immediately)
      setShowUpgradeDialog(false);
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast({
        title: "Checkout failed",
        description: "There was an error setting up the payment page. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const addPaymentMethod = async () => {
    try {
      setIsProcessing(true);
      // Create a billing portal session
      const response = await fetch('/api/subscriptions/billing-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });
      
      if (!response.ok) {
        throw new Error(`Error creating billing portal: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Always show the appropriate message to the user before redirecting
      if (data.message) {
        toast({
          title: "Stripe Portal Information",
          description: data.message,
          variant: "default",
          duration: 5000, // Show for 5 seconds to ensure user sees it
        });
        
        // Delay redirect slightly to ensure toast is visible
        setTimeout(() => {
          if (data.url) {
            window.location.href = data.url;
          }
        }, 1000);
      } else if (data.url) {
        // Redirect to the Stripe billing portal if no message
        window.location.href = data.url;
      } else {
        throw new Error("No redirect URL returned from the server");
      }
    } catch (error) {
      console.error("Error opening billing portal:", error);
      toast({
        title: "Payment Portal Error",
        description: "There was an error opening the payment management portal. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const removePaymentMethod = async (id: string) => {
    try {
      // For removing a payment method, we'll use the billing portal as well
      await addPaymentMethod();
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error removing the payment method. Please try again later.",
        variant: "destructive",
      });
    }
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
            <h1 className="text-lg font-semibold text-gray-900">Subscription & Billing</h1>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Tabs defaultValue="plans">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
                  <TabsTrigger value="payment">Payment Methods</TabsTrigger>
                  <TabsTrigger value="invoices">Billing History</TabsTrigger>
                </TabsList>
                
                {/* Plans Tab */}
                <TabsContent value="plans">
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle>Current Subscription</CardTitle>
                      <CardDescription>
                        Details about your current subscription plan
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isLoadingSubscription ? (
                        <div className="flex justify-center items-center py-4">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                      ) : (
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                          <div>
                            <div className="flex items-center">
                              <h3 className="text-lg font-semibold text-gray-900 capitalize">
                                {currentSubscription.plan} Plan
                              </h3>
                              <Badge className="ml-2 bg-green-100 text-green-800">
                                {currentSubscription.status.toUpperCase()}
                              </Badge>
                            </div>
                            <p className="mt-1 text-sm text-gray-500">
                              Billing Period: {format(currentSubscription.currentPeriodStart, "MMMM d, yyyy")} to {format(currentSubscription.currentPeriodEnd, "MMMM d, yyyy")}
                            </p>
                          </div>
                        
                        <div className="mt-4 md:mt-0">
                          <div className="flex items-center">
                            <p className="text-sm text-gray-600">Usage:</p>
                            <p className="ml-2 text-sm font-medium">
                              {currentSubscription.usage.callMinutes} / {currentSubscription.usage.totalAllowed} minutes
                            </p>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                            <div 
                              className="bg-primary h-2.5 rounded-full" 
                              style={{ width: `${(currentSubscription.usage.callMinutes / currentSubscription.usage.totalAllowed) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  <div className="flex justify-end mb-6">
                    <div className="inline-flex items-center rounded-md bg-white">
                      <button
                        type="button"
                        onClick={() => setBillingCycle("monthly")}
                        className={`rounded-l-md py-2 px-4 text-sm font-medium ${billingCycle === "monthly" ? "bg-primary text-white" : "bg-white text-gray-700 hover:bg-gray-50"}`}
                      >
                        Monthly
                      </button>
                      <button
                        type="button"
                        onClick={() => setBillingCycle("annually")}
                        className={`rounded-r-md py-2 px-4 text-sm font-medium ${billingCycle === "annually" ? "bg-primary text-white" : "bg-white text-gray-700 hover:bg-gray-50"}`}
                      >
                        Annually <span className="text-xs text-green-500 font-normal">(Save 20%)</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Free Plan */}
                    <Card className={`border-2 ${currentSubscription.plan === "free" ? "border-primary" : "border-transparent"}`}>
                      <CardHeader>
                        <CardTitle>Free</CardTitle>
                        <CardDescription>
                          Get started with basic features
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold mb-4">$0</p>
                        <div className="space-y-2">
                          {planFeatures.free.map((feature, index) => (
                            <div key={index} className="flex items-start">
                              <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                              <p className="text-sm">{feature}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter>
                        {currentSubscription.plan === "free" ? (
                          <Button className="w-full" disabled>
                            Current Plan
                          </Button>
                        ) : (
                          <Button variant="outline" className="w-full" onClick={() => handleUpgradePlan("free")}>
                            Downgrade
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                    
                    {/* Basic Plan */}
                    <Card className={`border-2 ${currentSubscription.plan === "basic" ? "border-primary" : "border-transparent"}`}>
                      <CardHeader>
                        <CardTitle>Basic</CardTitle>
                        <CardDescription>
                          Perfect for small businesses
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold mb-4">
                          ${typeof planPricing.basic[billingCycle] === "number" ? planPricing.basic[billingCycle] : planPricing.basic[billingCycle]}
                          <span className="text-sm font-normal text-gray-500 ml-1">/{billingCycle === "monthly" ? "mo" : "yr"}</span>
                        </p>
                        <div className="space-y-2">
                          {planFeatures.basic.map((feature, index) => (
                            <div key={index} className="flex items-start">
                              <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                              <p className="text-sm">{feature}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter>
                        {currentSubscription.plan === "basic" ? (
                          <Button className="w-full" disabled>
                            Current Plan
                          </Button>
                        ) : (
                          <Button className="w-full" onClick={() => handleUpgradePlan("basic")}>
                            {currentSubscription.plan === "free" ? "Upgrade" : "Downgrade"}
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                    
                    {/* Premium Plan */}
                    <Card className={`border-2 ${currentSubscription.plan === "premium" ? "border-primary" : "border-transparent"}`}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>Premium</CardTitle>
                            <CardDescription>
                              For growing businesses
                            </CardDescription>
                          </div>
                          <Badge className="bg-primary text-white">Popular</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold mb-4">
                          ${typeof planPricing.premium[billingCycle] === "number" ? planPricing.premium[billingCycle] : planPricing.premium[billingCycle]}
                          <span className="text-sm font-normal text-gray-500 ml-1">/{billingCycle === "monthly" ? "mo" : "yr"}</span>
                        </p>
                        <div className="space-y-2">
                          {planFeatures.premium.map((feature, index) => (
                            <div key={index} className="flex items-start">
                              <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                              <p className="text-sm">{feature}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter>
                        {currentSubscription.plan === "premium" ? (
                          <Button className="w-full" disabled>
                            Current Plan
                          </Button>
                        ) : (
                          <Button className="w-full" onClick={() => handleUpgradePlan("premium")}>
                            {currentSubscription.plan === "enterprise" ? "Downgrade" : "Upgrade"}
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                    
                    {/* Enterprise Plan */}
                    <Card className={`border-2 ${currentSubscription.plan === "enterprise" ? "border-primary" : "border-transparent"}`}>
                      <CardHeader>
                        <CardTitle>Enterprise</CardTitle>
                        <CardDescription>
                          Custom solutions for large businesses
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold mb-4">
                          {typeof planPricing.enterprise[billingCycle] === "number" ? `$${planPricing.enterprise[billingCycle]}` : planPricing.enterprise[billingCycle]}
                          {typeof planPricing.enterprise[billingCycle] === "number" && (
                            <span className="text-sm font-normal text-gray-500 ml-1">/{billingCycle === "monthly" ? "mo" : "yr"}</span>
                          )}
                        </p>
                        <div className="space-y-2">
                          {planFeatures.enterprise.map((feature, index) => (
                            <div key={index} className="flex items-start">
                              <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                              <p className="text-sm">{feature}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter>
                        {currentSubscription.plan === "enterprise" ? (
                          <Button className="w-full" disabled>
                            Current Plan
                          </Button>
                        ) : (
                          <Button className="w-full" variant="default" onClick={() => window.open('mailto:sales@micro8gents.com?subject=Enterprise Plan Inquiry')}>
                            Contact Sales
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  </div>
                  
                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500">
                      Need help choosing the right plan? <a href="#" className="text-primary hover:underline">Contact our sales team</a> for assistance.
                    </p>
                  </div>
                </TabsContent>
                
                {/* Payment Methods Tab */}
                <TabsContent value="payment">
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle>Payment Methods</CardTitle>
                          <CardDescription>
                            Manage your payment methods for billing
                          </CardDescription>
                        </div>
                        <Button onClick={() => {
                          toast({
                            title: "Stripe Portal Information",
                            description: "Stripe Billing Portal is not configured in development mode. This would redirect to Stripe in production.",
                            duration: 5000
                          });
                        }}>Add Payment Method</Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {paymentMethods.length > 0 ? (
                        <div className="space-y-4">
                          {paymentMethods.map((method) => (
                            <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                              <div className="flex items-center">
                                <div className="w-10 h-6 bg-gray-100 flex items-center justify-center rounded mr-4">
                                  <CreditCard className="h-4 w-4 text-gray-500" />
                                </div>
                                <div>
                                  <p className="font-medium capitalize">{method.brand} •••• {method.last4}</p>
                                  <p className="text-sm text-gray-500">Expires {method.expMonth}/{method.expYear}</p>
                                </div>
                                {method.isDefault && (
                                  <Badge className="ml-4 bg-blue-100 text-blue-800">Default</Badge>
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                {!method.isDefault && (
                                  <Button variant="outline" size="sm">
                                    Set as Default
                                  </Button>
                                )}
                                <Button variant="outline" size="sm" onClick={() => removePaymentMethod(method.id)}>
                                  Remove
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <CreditCard className="h-12 w-12 text-gray-400 mx-auto" />
                          <h3 className="mt-2 text-sm font-medium text-gray-900">No payment methods</h3>
                          <p className="mt-1 text-sm text-gray-500">
                            Add a payment method to manage your subscription.
                          </p>
                          <div className="mt-6">
                            <Button onClick={() => {
                              toast({
                                title: "Stripe Portal Information",
                                description: "Stripe Billing Portal is not configured in development mode. This would redirect to Stripe in production.",
                                duration: 5000
                              });
                            }}>Add Payment Method</Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Invoices Tab */}
                <TabsContent value="invoices">
                  <Card>
                    <CardHeader>
                      <CardTitle>Billing History</CardTitle>
                      <CardDescription>
                        View and download your past invoices
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {invoices.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Date
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Amount
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Status
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Period
                                </th>
                                <th scope="col" className="relative px-6 py-3">
                                  <span className="sr-only">Download</span>
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {invoices.map((invoice) => (
                                <tr key={invoice.id}>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {format(invoice.date, "MMMM d, yyyy")}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    ${invoice.amount.toFixed(2)}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <Badge className={`bg-green-100 text-green-800`}>
                                      {invoice.status.toUpperCase()}
                                    </Badge>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {format(invoice.periodStart, "MMM d")} - {format(invoice.periodEnd, "MMM d, yyyy")}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Button variant="ghost" size="sm" className="flex items-center" asChild>
                                      <a href={invoice.pdf} target="_blank" rel="noopener noreferrer">
                                        <Download className="h-4 w-4 mr-1" />
                                        PDF
                                      </a>
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
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
                              d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          <h3 className="mt-2 text-sm font-medium text-gray-900">No invoices</h3>
                          <p className="mt-1 text-sm text-gray-500">
                            Your billing history will appear here.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
              
              {/* Plan Cancellation Card */}
              <Card className="mt-6 border-red-100">
                <CardHeader>
                  <CardTitle className="text-red-600">Cancel Subscription</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    Cancelling your subscription will stop automatic billing at the end of your current billing period.
                    You will still have access to your subscription until {format(currentSubscription.currentPeriodEnd, "MMMM d, yyyy")}.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="destructive">Cancel Subscription</Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </main>
      </div>
      
      {/* Upgrade Plan Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upgrade to {selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} Plan</DialogTitle>
            <DialogDescription>
              {selectedPlan === "free" 
                ? "You're about to downgrade to the Free plan. You'll lose access to premium features at the end of your current billing cycle."
                : `You're about to upgrade to the ${selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} plan.`}
            </DialogDescription>
          </DialogHeader>
          
          {selectedPlan !== "free" && (
            <div className="py-4">
              <div className="flex items-center justify-between mb-4">
                <p className="font-medium">Plan Cost</p>
                <p>
                  ${typeof planPricing[selectedPlan][billingCycle] === "number" 
                    ? planPricing[selectedPlan][billingCycle] 
                    : "Custom"} 
                  {typeof planPricing[selectedPlan][billingCycle] === "number" && `/${billingCycle === "monthly" ? "month" : "year"}`}
                </p>
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <p className="font-medium">Billing Cycle</p>
                <p className="capitalize">{billingCycle}</p>
              </div>
              
              <div className="mt-6 mb-2">
                <h4 className="text-sm font-medium mb-2">What's included:</h4>
                <div className="space-y-2">
                  {planFeatures[selectedPlan].map((feature, index) => (
                    <div key={index} className="flex items-start">
                      <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      <p className="text-sm">{feature}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpgradeDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmUpgrade} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                selectedPlan === "free" ? "Confirm Downgrade" : "Confirm Upgrade"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Credit Card Form Dialog */}
      <Dialog open={showCreditCardForm} onOpenChange={setShowCreditCardForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Payment Method</DialogTitle>
            <DialogDescription>
              Enter your credit card information to add a new payment method.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label htmlFor="card-number" className="text-sm font-medium">Card Number</label>
              <input 
                id="card-number" 
                type="text" 
                placeholder="1234 5678 9012 3456" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="expiration" className="text-sm font-medium">Expiration Date</label>
                <input 
                  id="expiration" 
                  type="text" 
                  placeholder="MM / YY" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="cvc" className="text-sm font-medium">CVC</label>
                <input 
                  id="cvc" 
                  type="text" 
                  placeholder="123" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">Name on Card</label>
              <input 
                id="name" 
                type="text" 
                placeholder="John Doe" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div className="flex items-center">
              <input 
                id="default" 
                type="checkbox" 
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label htmlFor="default" className="ml-2 text-sm text-gray-600">
                Make this my default payment method
              </label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreditCardForm(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              setShowCreditCardForm(false);
              toast({
                title: "Payment method added",
                description: "Your new payment method has been added successfully.",
              });
            }}>
              Add Payment Method
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubscriptionPage;
