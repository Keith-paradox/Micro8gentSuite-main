import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ReactNode } from "react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: ReactNode;
  iconColor: string;
  title: string;
  value: string | number;
  linkText: string;
  linkHref: string;
}

const StatCard = ({ 
  icon, 
  iconColor, 
  title, 
  value, 
  linkText, 
  linkHref 
}: StatCardProps) => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center">
            <div className={cn("flex-shrink-0 rounded-md p-3", iconColor)}>
              <div className="h-6 w-6 text-white">
                {icon}
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
                <dd>
                  <div className="text-lg font-medium text-gray-900">{value}</div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 px-4 py-4 sm:px-6">
        <div className="text-sm">
          <Link href={linkHref}>
            <div className="font-medium text-primary hover:text-primary cursor-pointer">{linkText}</div>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
};

export default StatCard;
