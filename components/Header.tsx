// components/Header.tsx
"use client";

import { useRouter } from "next/navigation";
import { ShieldCheck, LogOut, User, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

interface HeaderProps {
  showEventInfo?: boolean;
  eventName?: string;
  eventStatus?: string;
  startDate?: string;
  endDate?: string;
}

export function Header({
  showEventInfo = false,
  eventName,
  eventStatus,
  startDate,
  endDate,
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

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return "A";
    const nameParts = user.fullName?.split(" ") || ["A"];
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return nameParts[0][0].toUpperCase();
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (!user) return "Admin";
    return user.fullName || user.email || "Admin";
  };

  // Get user email
  const getUserEmail = () => {
    if (!user) return "admin@onsitewala.in";
    return user.email || "admin@onsitewala.in";
  };

  return (
    <header className="brand-header-gradient text-white">
      <div className="px-6 h-14 flex items-center justify-between">
        {/* Left side - Brand */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-5 h-5 text-orange-400" />
          </div>
          <div className="font-bold whitespace-nowrap">OnsiteWala</div>
          <span className="text-white/30">/</span>
          <span className="text-white/70 text-sm whitespace-nowrap">
            Admin Panel
          </span>

          {/* Event info (optional) */}
          {showEventInfo && eventName && (
            <>
              <span className="text-white/30 hidden sm:inline">/</span>
              <span className="text-sm font-medium truncate hidden sm:inline">
                {eventName}
              </span>
              {eventStatus && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full bg-white/15 hidden sm:inline`}
                >
                  {eventStatus}
                </span>
              )}
              {startDate && endDate && (
                <span className="text-xs text-white/60 hidden lg:inline">
                  {startDate} → {endDate}
                </span>
              )}
            </>
          )}
        </div>

        {/* Right side - User menu */}
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 hover:bg-white/10 px-3 py-1.5 rounded-lg transition group">
                <Avatar className="w-8 h-8 border-2 border-white/20">
                  <AvatarFallback className="bg-orange-500 text-white text-sm font-medium">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <div className="text-sm font-medium leading-none">
                    {getUserDisplayName()}
                  </div>
                  <div className="text-xs text-white/60 mt-1">
                    {getUserEmail()}
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-white/60 group-hover:text-white transition" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {getUserDisplayName()}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {getUserEmail()}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => router.push("/profile")}
              >
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
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
