import React from "react";
import { BrandedSpinner } from "./branded-spinner";
import { cn } from "@/lib/utils";

interface LoaderProps {
  fullScreen?: boolean;
  text?: string;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "primary" | "secondary" | "accent" | "white";
  className?: string;
  inline?: boolean;
}

export function Loader({
  fullScreen = false,
  text,
  size = "md",
  variant = "primary",
  className,
  inline = false
}: LoaderProps) {
  // For full screen loader
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
        <BrandedSpinner size={size} variant={variant} className={className} />
        {text && (
          <p className="mt-4 text-center text-sm font-medium text-muted-foreground">
            {text}
          </p>
        )}
      </div>
    );
  }
  
  // For inline loader
  if (inline) {
    return <BrandedSpinner size={size} variant={variant} className={className} />;
  }
  
  // Normal embedded loader
  return (
    <div className={cn("flex flex-col items-center justify-center p-4", className)}>
      <BrandedSpinner size={size} variant={variant} />
      {text && (
        <p className="mt-2 text-center text-sm font-medium text-muted-foreground">
          {text}
        </p>
      )}
    </div>
  );
}