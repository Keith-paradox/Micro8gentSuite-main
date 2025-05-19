import { QueryClient, QueryFunction, DefaultOptions } from "@tanstack/react-query";

// Auth error constants for better maintainability
const AUTH_ERROR_MESSAGE = 'Unauthorized: You need to log in to access this resource';
const SESSION_EXPIRED_MESSAGE = 'Your session has expired. Please log in again.';

/**
 * Throws an error if the response is not OK, with specific handling for auth errors
 */
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    // Special handling for authentication errors
    if (res.status === 401) {
      throw new Error(AUTH_ERROR_MESSAGE);
    }
    
    if (res.status === 403) {
      throw new Error('Forbidden: You do not have permission to access this resource');
    }
    
    // Handle other errors with detailed information when available
    try {
      const errorData = await res.json();
      if (errorData.message) {
        throw new Error(`${res.status}: ${errorData.message}`);
      }
    } catch {
      // If the error response isn't JSON, fall back to text or status
      const text = (await res.text()) || res.statusText;
      throw new Error(`${res.status}: ${text}`);
    }
  }
}

/**
 * Makes an API request with proper error handling
 */
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Create headers with authorization and content type
  const headers: Record<string, string> = {};
  
  if (data) {
    headers['Content-Type'] = 'application/json';
  }
  
  // Make the request
  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include", // Always include credentials for session cookies
  });

  // Create a clone of the response before checking for errors
  const resClone = res.clone();
  
  await throwIfResNotOk(resClone);
  return res;
}

/**
 * Unauthorized behavior types
 */
type UnauthorizedBehavior = "returnNull" | "throw";

/**
 * Factory function that creates query functions with specific auth error handling
 */
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    try {
      const res = await fetch(queryKey[0] as string, {
        credentials: "include",
      });

      // Handle 401 Unauthorized based on the specified behavior
      if (res.status === 401) {
        if (unauthorizedBehavior === "returnNull") {
          return null;
        } else {
          throw new Error(AUTH_ERROR_MESSAGE);
        }
      }

      // Handle other errors
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`${res.status}: ${errorText || res.statusText}`);
      }
      
      return await res.json();
    } catch (error) {
      // Re-throw the error to be caught by the query's onError handler
      throw error;
    }
  };

// Query client default options
const defaultOptions: DefaultOptions = {
  queries: {
    queryFn: getQueryFn({ on401: "throw" }),
    refetchInterval: false,
    refetchOnWindowFocus: true, // Changed to true to detect session timeouts 
    staleTime: 1000 * 60 * 5, // 5 minutes - better balance between performance and freshness
    retry: (failureCount, error) => {
      // Don't retry auth errors, but retry other errors up to 2 times
      if (error instanceof Error && error.message.includes('Unauthorized')) {
        return false;
      }
      return failureCount < 2;
    },
  },
  mutations: {
    retry: false,
    onError: (error) => {
      // Global mutation error handling can be added here
      console.error('Mutation error:', error);
    },
  },
};

// Create and export the query client
export const queryClient = new QueryClient({ defaultOptions });
