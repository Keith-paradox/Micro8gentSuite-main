import React from "react";
import { cn } from "@/lib/utils";

interface BrandedSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "primary" | "secondary" | "accent" | "white";
  className?: string;
  showLogo?: boolean;
}

export function BrandedSpinner({ 
  size = "md", 
  variant = "primary", 
  className,
  showLogo = true
}: BrandedSpinnerProps) {
  // Predefined size and color classes to avoid recalculation
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
    xl: "h-24 w-24",
  };

  const variantClasses = {
    primary: "text-primary",
    secondary: "text-gray-600",
    accent: "text-blue-500",
    white: "text-white",
  };

  // Calculate logo scale based on spinner size
  const logoScaleClass = size === "sm" 
    ? "scale-50" 
    : size === "md" 
      ? "scale-60" 
      : "scale-75";

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer spinning ring */}
      <svg
        className={cn(
          "animate-spin", 
          sizeClasses[size], 
          variantClasses[variant],
          className
        )}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      
      {/* Company logo in the center */}
      {showLogo && (
        <div className={cn(
          "absolute inset-0 flex items-center justify-center",
          logoScaleClass
        )}>
          <svg 
            className={cn(
              "h-5 w-5", 
              variantClasses[variant]
            )} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            ></path>
          </svg>
        </div>
      )}
    </div>
  );
}