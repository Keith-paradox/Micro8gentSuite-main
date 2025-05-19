import { useLocation } from "wouter";

export function useQueryParams(): Record<string, string> {
  const [location] = useLocation();
  
  if (typeof window === "undefined") {
    return {};
  }
  
  const params = new URLSearchParams(window.location.search);
  const result: Record<string, string> = {};
  
  params.forEach((value, key) => {
    result[key] = value;
  });
  
  return result;
}