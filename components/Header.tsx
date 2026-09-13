// components/Header.tsx
"use client";

import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  LogOut,
  User,
  ChevronDown,
  ArrowLeft,
  Home,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { formatDateRange } from "@/lib/utils/date";

interface HeaderProps {
  showEventInfo?: boolean;
  eventName?: string;
  eventStatus?: string;
  startDate?: string;
  endDate?: string;
  showBackButton?: boolean;
  backUrl?: string;
  onBack?: () => void;
}

export function Header({
  showEventInfo = false,
  eventName,
  eventStatus,
  startDate,
  endDate,
  showBackButton = false,
  backUrl,
  onBack,
}: HeaderProps) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      router.push("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getUserInitials = () => {
    if (!user) return "A";
    const nameParts = user.fullName?.split(" ") || ["A"];
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return nameParts[0][0].toUpperCase();
  };

  const getUserDisplayName = () => {
    if (!user) return "Admin";
    return user.fullName || user.email || "Admin";
  };

  const getUserEmail = () => {
    if (!user) return "admin@onsitewala.in";
    return user.email || "admin@onsitewala.in";
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backUrl) {
      router.push(backUrl);
    } else {
      router.back();
    }
  };

  const handleGoHome = () => {
    router.push("/events");
  };

  return (
    <header className="brand-header-gradient text-white sticky top-0 z-50 safe-area-top">
      <div className="px-3 sm:px-4 md:px-6 h-14 flex items-center justify-between gap-2">
        {/* Left side - Brand with Back Button */}
        <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1">
          {/* Back Button */}
          {showBackButton && (
            <button
              onClick={handleBack}
              className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 hover:bg-white/10 rounded-lg transition flex-shrink-0"
              title="Go Back"
              aria-label="Go back"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-white/80 hover:text-white transition" />
            </button>
          )}

          {/* Home/Brand Button */}
          <button
            onClick={handleGoHome}
            className="flex items-center gap-1.5 sm:gap-2 hover:bg-white/10 px-1.5 sm:px-2 py-1.5 rounded-lg transition flex-shrink-0"
            title="Go to Dashboard"
            aria-label="Go to dashboard"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/10 backdrop-blur flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
            </div>
            <div className="font-bold whitespace-nowrap hidden sm:block text-sm">
              OnsiteWala
            </div>
          </button>

          <span className="text-white/30 hidden md:inline">/</span>
          <span className="text-white/70 text-xs sm:text-sm whitespace-nowrap hidden md:inline">
            Admin Panel
          </span>

          {/* Event info (optional) */}
          {showEventInfo && eventName && (
            <>
              <span className="text-white/30 hidden lg:inline">/</span>
              <span className="text-xs sm:text-sm font-medium truncate hidden lg:inline max-w-[200px]">
                {eventName}
              </span>
              {eventStatus && (
                <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full bg-white/15 hidden sm:inline whitespace-nowrap">
                  {eventStatus}
                </span>
              )}
              {startDate && endDate && (
                <span className="text-[10px] sm:text-xs text-white/60 hidden xl:inline whitespace-nowrap">
                  {formatDateRange(startDate, endDate)}
                </span>
              )}
            </>
          )}
        </div>

        {/* Right side - User menu */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {/* Quick Home Button (mobile only) */}
          <button
            onClick={handleGoHome}
            className="text-white/70 hover:text-white transition p-2 rounded-lg hover:bg-white/10 md:hidden"
            title="Dashboard"
            aria-label="Go to dashboard"
          >
            <Home className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center gap-2 hover:bg-white/10 px-1.5 sm:px-2 md:px-3 py-1.5 rounded-lg transition"
                aria-label="User menu"
              >
                <Avatar className="w-7 h-7 sm:w-8 sm:h-8 border-2 border-white/20">
                  {user?.profileImage ? (
                    <AvatarImage
                      src={user.profileImage}
                      alt={getUserDisplayName()}
                    />
                  ) : (
                    <AvatarFallback className="bg-orange-500 text-white text-xs sm:text-sm font-medium">
                      {getUserInitials()}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="hidden md:block text-left">
                  <div className="text-sm font-medium leading-none truncate max-w-[120px]">
                    {getUserDisplayName()}
                  </div>
                  <div className="text-xs text-white/60 mt-1 truncate max-w-[120px]">
                    {getUserEmail()}
                  </div>
                </div>
                <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-white/60 transition hidden sm:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none truncate">
                    {getUserDisplayName()}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground truncate">
                    {getUserEmail()}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={handleGoHome}
              >
                <Home className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => router.push("/profile")}
              >
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-red-600"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
