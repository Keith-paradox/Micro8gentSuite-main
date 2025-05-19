import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useLocation } from "wouter";
import { useQueryParams } from "@/hooks/use-query-params";

// Validation schema
const resetPasswordSchema = z
  .object({
    email: z.string().email({
      message: "Please enter a valid email address.",
    }),
    token: z.string().min(1, {
      message: "Reset token is required.",
    }),
    password: z.string().min(6, {
      message: "Password must be at least 6 characters.",
    }),
    confirmPassword: z.string().min(6, {
      message: "Confirm password must be at least 6 characters.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { token, email } = useQueryParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(true);

  // Check if token and email are present
  useEffect(() => {
    if (!token || !email) {
      setIsTokenValid(false);
      toast({
        title: "Invalid reset link",
        description: "The password reset link is invalid or has expired.",
        variant: "destructive",
      });
    }
  }, [token, email, toast]);

  // Initialize form
  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: email || "",
      token: token || "",
      password: "",
      confirmPassword: "",
    },
  });

  // Form submission handler
  async function onSubmit(data: ResetPasswordFormValues) {
    setIsSubmitting(true);
    
    try {
      await apiRequest(
        "POST",
        "/api/auth/reset-password",
        {
          email: data.email,
          token: data.token,
          password: data.password,
        }
      );
      
      setIsSubmitted(true);
      toast({
        title: "Password reset successful",
        description: "Your password has been reset. You can now log in with your new password.",
      });
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        setLocation("/auth/login");
      }, 3000);
    } catch (error) {
      console.error("Reset password error:", error);
      toast({
        title: "Password reset failed",
        description: "The reset link is invalid or has expired. Please request a new reset link.",
        variant: "destructive",
      });
      setIsTokenValid(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isTokenValid) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-red-500">
              Invalid Reset Link
            </CardTitle>
            <CardDescription className="text-center">
              The password reset link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p>Please request a new password reset link.</p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button variant="outline" asChild>
              <Link href="/auth/forgot-password">
                Request New Reset Link
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-50">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Reset Your Password
          </CardTitle>
          <CardDescription className="text-center">
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isSubmitted ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <input type="hidden" {...form.register("email")} />
                <input type="hidden" {...form.register("token")} />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Resetting..." : "Reset Password"}
                </Button>
              </form>
            </Form>
          ) : (
            <div className="text-center py-4 space-y-4">
              <div className="text-green-600 font-medium">
                Password reset successful!
              </div>
              <p className="text-sm text-muted-foreground">
                Your password has been reset. You will be redirected to the login page shortly.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center gap-2">
          <Link href="/auth/login" className="text-sm text-primary hover:underline">
            Return to login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

export default ResetPasswordPage;