import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Building2, 
  Calendar, 
  Phone, 
  BarChart2, 
  CreditCard,
  Settings,
  LogOut,
  Users,
  MessageCircle
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}

const NavItem = ({ href, icon, label, isActive, onClick }: NavItemProps) => {
  if (onClick) {
    return (
      <div 
        className={cn(
          "group flex items-center px-2 py-2 text-sm font-medium rounded-md cursor-pointer",
          "text-gray-600 hover:bg-gray-50 hover:text-primary"
        )}
        onClick={onClick}
      >
        <div className={cn(
          "mr-3 h-6 w-6",
          "text-gray-500 group-hover:text-primary"
        )}>
          {icon}
        </div>
        {label}
      </div>
    );
  }
  
  return (
    <Link href={href}>
      <div 
        className={cn(
          "group flex items-center px-2 py-2 text-sm font-medium rounded-md cursor-pointer",
          isActive 
            ? "bg-gray-100 text-primary" 
            : "text-gray-600 hover:bg-gray-50 hover:text-primary"
        )}
        aria-current={isActive ? "page" : undefined}
      >
        <div className={cn(
          "mr-3 h-6 w-6",
          isActive ? "text-primary" : "text-gray-500 group-hover:text-primary"
        )}>
          {icon}
        </div>
        {label}
      </div>
    </Link>
  );
};

const Sidebar = () => {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const isAdmin = user?.role === 'admin';

  const handleLogout = async () => {
    try {
      await apiRequest('POST', '/api/auth/logout', {});
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
      setLocation('/login');
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Base navigation items
  const navigation = [
    { href: "/dashboard", label: "Dashboard", icon: <Home /> },
    { href: "/business-setup", label: "Business Setup", icon: <Building2 /> },
    { href: "/bookings", label: "Bookings", icon: <Calendar /> },
    { href: "/call-logs", label: "Call Logs", icon: <Phone /> },
    { href: "/reports", label: "Reports", icon: <BarChart2 /> },
    { href: "/ai-assistant", label: "Talk to Judy", icon: <MessageCircle /> },
    { href: "/subscription", label: "Subscription", icon: <CreditCard /> },
    { href: "/settings", label: "Settings", icon: <Settings /> },
  ];
  
  // Add admin link for admin users
  if (isAdmin) {
    navigation.push({ href: "/admin", label: "Admin", icon: <Users /> });
  }

  return (
    <div className="hidden lg:flex lg:flex-shrink-0">
      <div className="flex flex-col w-64 border-r border-gray-200 bg-white">
        <div className="flex flex-col h-full flex-1">
          {/* Logo */}
          <div className="flex items-center h-16 flex-shrink-0 px-4 bg-primary">
            <div className="flex items-center">
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
              </svg>
              <span className="ml-2 text-xl font-bold text-white">Micro8gents</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 flex flex-col pt-5 overflow-y-auto">
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {navigation.map((item) => (
                <NavItem 
                  key={item.href}
                  href={item.href} 
                  icon={item.icon} 
                  label={item.label}
                  isActive={location === item.href}
                />
              ))}
            </nav>
          </div>
          
          {/* Logout button at bottom */}
          <div className="border-t border-gray-200 p-4">
            <NavItem 
              href="#"
              icon={<LogOut />}
              label="Logout"
              onClick={handleLogout}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
