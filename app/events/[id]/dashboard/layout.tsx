// app/events/[id]/dashboard/layout.tsx
"use client";

import { use, useEffect, useState, createContext, useContext } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  ShieldCheck,
  LayoutDashboard,
  ScanLine,
  Printer,
  FolderTree,
  KeyRound,
  Database,
  Settings,
  Loader2,
  UserPlus,
} from "lucide-react";
import { Header } from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import { eventsApi } from "@/lib/api";
import type { Event } from "@/lib/api";
import { DashboardDataProvider } from "./_context/DataContext";

interface DashboardContextType {
  eventId: string;
  event: Event | null;
  loading: boolean;
  reloadEvent: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | null>(null);

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) {
    throw new Error("useDashboard must be used within DashboardLayout");
  }
  return ctx;
}

const NAV_ITEMS = [
  { path: "", icon: LayoutDashboard, label: "Dashboard" },
  { path: "print", icon: Printer, label: "Print Center" },
  { path: "scan", icon: ScanLine, label: "Scan" },
  { path: "spot-registration", icon: UserPlus, label: "Spot Registration" },
  { path: "category", icon: FolderTree, label: "Category" },
  { path: "privileges", icon: KeyRound, label: "Privileges" },
  { path: "data", icon: Database, label: "Data" },
  { path: "settings", icon: Settings, label: "Settings" },
];

const MOBILE_NAV_ITEMS = [
  { path: "", icon: LayoutDashboard, label: "Home" },
  { path: "print", icon: Printer, label: "Print" },
  { path: "scan", icon: ScanLine, label: "Scan" },
  { path: "spot-registration", icon: UserPlus, label: "Register" },
  { path: "data", icon: Database, label: "Data" },
];

export default function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  const loadEvent = async () => {
    setLoading(true);
    try {
      const data = await eventsApi.getEventById(id);
      setEvent(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load event",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvent();
  }, [id]);

  const basePath = `/events/${id}/dashboard`;
  const getCurrentSection = () => {
    if (pathname === basePath) return "";
    const remaining = pathname.replace(`${basePath}/`, "");
    return remaining.split("/")[0];
  };
  const currentSection = getCurrentSection();

  const navigateTo = (path: string) => {
    if (path === "") {
      router.push(basePath);
    } else {
      router.push(`${basePath}/${path}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-neutral-50">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col bg-neutral-50">
        <Header />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900">
              Event Not Found
            </h2>
            <p className="text-sm text-neutral-500 mt-2">
              The event you're looking for doesn't exist.
            </p>
            <button
              onClick={() => router.push("/events")}
              className="mt-4 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg"
            >
              Back to Events
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DashboardContext.Provider
      value={{ eventId: id, event, loading, reloadEvent: loadEvent }}
    >
      <DashboardDataProvider eventId={id}>
        {/* KEY CHANGE: h-screen + overflow-hidden on outer wrapper */}
        <div className="h-screen flex flex-col bg-neutral-50 overflow-hidden">
          <Header
            showEventInfo={true}
            eventName={event.eventName}
            eventStatus={event.dynamicStatus || "Draft"}
            startDate={event.startDate}
            endDate={event.endDate}
            showBackButton={true}
            backUrl="/events"
          />

          {/* KEY CHANGE: min-h-0 so children can scroll internally */}
          <div className="flex-1 flex min-h-0">
            {/* Sidebar — fixed height, internal scroll if needed */}
            <aside className="hidden md:flex w-56 lg:w-60 bg-white border-r border-neutral-200 flex-col flex-shrink-0 overflow-y-auto">
              <div className="p-4 border-b border-neutral-100">
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  <ShieldCheck className="w-4 h-4 text-orange-600" />
                  <span>Admin Panel</span>
                </div>
              </div>
              <nav className="flex-1 p-3 space-y-1">
                {NAV_ITEMS.map((item) => {
                  const isActive = currentSection === item.path;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.path || "home"}
                      onClick={() => navigateTo(item.path)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                        isActive
                          ? "bg-orange-50 text-orange-700 font-semibold"
                          : "text-neutral-600 hover:bg-neutral-50"
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 flex-shrink-0 ${
                          isActive ? "text-orange-600" : "text-neutral-400"
                        }`}
                      />
                      <span className="flex-1 text-left truncate">
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </aside>

            {/* Main content — scrolls independently */}
            <main className="flex-1 overflow-y-auto pb-20 md:pb-0 min-w-0">
              {children}
            </main>
          </div>

          {/* Mobile bottom nav */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-neutral-200 safe-area-bottom">
            <nav className="flex items-center justify-around h-16">
              {MOBILE_NAV_ITEMS.map((item) => {
                const isActive = currentSection === item.path;
                const Icon = item.icon;
                return (
                  <button
                    key={item.path || "home"}
                    onClick={() => navigateTo(item.path)}
                    className={`flex flex-col items-center justify-center flex-1 h-full transition relative ${
                      isActive ? "text-orange-600" : "text-neutral-500"
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : ""}`}
                    />
                    <span
                      className={`text-[10px] mt-0.5 ${
                        isActive ? "font-semibold" : ""
                      }`}
                    >
                      {item.label}
                    </span>
                    {isActive && (
                      <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-orange-600 rounded-full" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </DashboardDataProvider>
    </DashboardContext.Provider>
  );
}
