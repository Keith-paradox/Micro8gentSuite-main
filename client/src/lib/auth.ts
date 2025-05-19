import { useState, useEffect } from "react";
import { User } from "./types";
import { apiRequest, queryClient } from "./queryClient";
import { useQuery } from "@tanstack/react-query";

// Function to check if user is authenticated
export async function isAuthenticated() {
  try {
    const user = await queryClient.fetchQuery({
      queryKey: ['/api/auth/me'],
      queryFn: getQueryFn({ on401: "returnNull" })
    });
    
    return !!user;
  } catch (error) {
    return false;
  }
}

// Function to get the current user
export async function getCurrentUser(): Promise<User | null> {
  try {
    return await queryClient.fetchQuery({
      queryKey: ['/api/auth/me'],
      queryFn: getQueryFn({ on401: "returnNull" })
    });
  } catch (error) {
    return null;
  }
}

// Function to log in a user
export async function login(username: string, password: string): Promise<User> {
  const response = await apiRequest("POST", "/api/auth/login", { username, password });
  
  // Invalidate the auth query to refetch current user
  queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
  
  return await response.json();
}

// Function to register a new user
export async function register(userData: {
  username: string;
  password: string;
  email: string;
  businessName: string;
}): Promise<void> {
  await apiRequest("POST", "/api/auth/register", userData);
}

// Function to log out the current user
export async function logout(): Promise<void> {
  try {
    await apiRequest("POST", "/api/auth/logout", {});
    
    // Clear any cached user data
    queryClient.setQueryData(['/api/auth/me'], null);
    
    // Invalidate the auth query to force a refetch on next navigation
    queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    
    // Remove any other sensitive data from the query cache
    queryClient.clear();
  } catch (error) {
    console.error('Logout failed:', error);
    
    // Even if the logout API call fails, we clear the client-side data
    queryClient.setQueryData(['/api/auth/me'], null);
    queryClient.clear();
    
    // Re-throw the error for the caller to handle
    throw error;
  }
}

// Private function to handle query fetching
function getQueryFn<T>({ on401 }: { on401: "returnNull" | "throw" }) {
  return async ({ queryKey }: { queryKey: string[] }) => {
    const res = await fetch(queryKey[0], {
      credentials: "include",
    });

    if (on401 === "returnNull" && res.status === 401) {
      return null;
    }

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`${res.status}: ${text || res.statusText}`);
    }
    
    return await res.json() as T;
  };
}

// Function to update the current user's password
export async function updatePassword(
  currentPassword: string,
  newPassword: string
): Promise<void> {
  await apiRequest("PUT", "/api/auth/password", {
    currentPassword,
    newPassword,
  });
}

// Function to request a password reset
export async function requestPasswordReset(email: string): Promise<void> {
  await apiRequest("POST", "/api/auth/request-reset", { email });
}

// Function to reset password with token
export async function resetPassword(
  token: string,
  newPassword: string
): Promise<void> {
  await apiRequest("POST", "/api/auth/reset-password", {
    token,
    newPassword,
  });
}

// Function to update the user's profile
export async function updateProfile(profileData: Partial<User>): Promise<User> {
  const response = await apiRequest("PUT", "/api/profile", profileData);
  
  // Invalidate the auth query to refetch current user with updated profile
  queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
  
  return await response.json();
}

// React hook for auth state
export function useAuth() {
  const { data: user, isLoading, isError, error } = useQuery<User | null>({
    queryKey: ['/api/auth/me'],
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    isError,
    error,
  };
}
