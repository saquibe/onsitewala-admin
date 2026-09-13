// app/events/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  MapPin,
  Users,
  Calendar,
  Search,
  LayoutGrid,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/Header";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { venuesApi, organizersApi, eventsApi } from "@/lib/api";
import type { Venue, Organizer, Event } from "@/lib/api";
import { EventCard } from "@/components/events/EventCard";
import { OrganizerCard } from "@/components/events/OrganizerCard";
import { EmptyState } from "@/components/events/EmptyState";
import {
  EventDialog,
  OrganizerDialog,
  VenueDialog,
} from "@/components/events/Dialogs";
import { VenueCard } from "@/components/events/VenueCard";

type Tab = "events" | "venue" | "organizer";

// Navigation items
const NAV_ITEMS = [
  { id: "events" as Tab, icon: Calendar, label: "Events" },
  { id: "venue" as Tab, icon: MapPin, label: "Venues" },
  { id: "organizer" as Tab, icon: Users, label: "Organizers" },
];

// Helper functions
const getVenueObject = (venue: Venue | string | undefined): Venue | null => {
  if (!venue) return null;
  if (typeof venue === "object" && venue.venueName) return venue;
  return null;
};

const getOrganizerObject = (
  organizer: Organizer | string | undefined,
): Organizer | null => {
  if (!organizer) return null;
  if (typeof organizer === "object" && organizer.organizerName)
    return organizer;
  return null;
};

export default function EventsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>("events");
  const [events, setEvents] = useState<Event[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventSearch, setEventSearch] = useState("");

  const [eventDialog, setEventDialog] = useState(false);
  const [venueDialog, setVenueDialog] = useState(false);
  const [organizerDialog, setOrganizerDialog] = useState(false);
  const [editVenue, setEditVenue] = useState<Venue | null>(null);
  const [editOrganizer, setEditOrganizer] = useState<Organizer | null>(null);

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [eventsRes, venuesRes, organizersRes] = await Promise.all([
        eventsApi.getEvents({ limit: 100 }),
        venuesApi.getVenues({ limit: 100 }),
        organizersApi.getOrganizers({ limit: 100 }),
      ]);

      const eventsData = eventsRes.data || eventsRes || [];
      const venuesData = venuesRes.data || venuesRes || [];
      const organizersData = organizersRes.data || organizersRes || [];

      setEvents(Array.isArray(eventsData) ? eventsData : []);
      setVenues(Array.isArray(venuesData) ? venuesData : []);
      setOrganizers(Array.isArray(organizersData) ? organizersData : []);
    } catch (error: any) {
      console.error("Load data error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openEvent = (id: string) => router.push(`/events/${id}/dashboard`);

  // Filter events
  const filteredEvents = events.filter((e) => {
    const search = eventSearch.toLowerCase();
    const venue = getVenueObject(e.venueId);
    const organizer = getOrganizerObject(e.organizerId);
    const venueName = venue?.venueName?.toLowerCase() || "";
    const organizerName = organizer?.organizerName?.toLowerCase() || "";
    const city = venue?.city?.toLowerCase() || "";

    return (
      e.eventName?.toLowerCase().includes(search) ||
      e.eventShortName?.toLowerCase().includes(search) ||
      venueName.includes(search) ||
      organizerName.includes(search) ||
      city.includes(search)
    );
  });

  const handleDeleteEvent = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      await eventsApi.deleteEvent(id);
      toast({
        title: "Success",
        description: "Event deleted successfully",
      });
      loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete event",
        variant: "destructive",
      });
    }
  };

  const getPageTitle = () => {
    if (tab === "venue") return "Venues";
    if (tab === "organizer") return "Organizers";
    return "Events";
  };

  const getAddButtonText = () => {
    if (tab === "venue") return "Add Venue";
    if (tab === "organizer") return "Add Organizer";
    return "Add Event";
  };

  const handleAddClick = () => {
    if (tab === "events") setEventDialog(true);
    else if (tab === "venue") setVenueDialog(true);
    else setOrganizerDialog(true);
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

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Header />

      <div className="flex-1 flex">
        {/* Desktop Sidebar - Hidden on mobile */}
        <aside className="hidden md:flex w-16 lg:w-20 bg-neutral-900 text-white flex-col items-center py-6 gap-2 flex-shrink-0">
          <div className="w-10 h-10 rounded-lg bg-orange-600 flex items-center justify-center">
            <LayoutGrid className="w-5 h-5" />
          </div>
          <nav className="mt-4 flex flex-col gap-3">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition ${
                  tab === item.id ? "bg-white/15" : "hover:bg-white/10"
                }`}
                title={item.label}
              >
                <item.icon className="w-5 h-5" />
              </button>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto pb-20 md:pb-0">
          {/* Header with Tabs */}
          <div className="bg-white border-b border-neutral-200 px-4 sm:px-6 pt-4">
            <div className="flex items-center justify-between gap-3">
              <h1 className="text-lg sm:text-xl font-bold text-neutral-900 capitalize">
                {getPageTitle()}
              </h1>
              <Button
                onClick={handleAddClick}
                className="bg-orange-600 hover:bg-orange-700 text-white h-9 sm:h-10 px-3 sm:px-4"
                size="sm"
              >
                <Plus className="w-4 h-4 sm:mr-1" />
                <span className="hidden sm:inline">{getAddButtonText()}</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </div>

            {/* Desktop Tabs */}
            <div className="hidden sm:flex gap-6 mt-3">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className={`pb-3 text-sm capitalize transition border-b-2 ${
                    tab === item.id
                      ? "border-orange-600 text-orange-600 font-semibold"
                      : "border-transparent text-neutral-500 hover:text-neutral-800"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {tab === "events" && (
              <>
                <div className="mb-4 relative max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <Input
                    value={eventSearch}
                    onChange={(e) => setEventSearch(e.target.value)}
                    placeholder="Search events..."
                    className="pl-10 bg-white h-10"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
                  {filteredEvents.map((ev) => {
                    const venue = getVenueObject(ev.venueId);
                    const organizer = getOrganizerObject(ev.organizerId);
                    return (
                      <EventCard
                        key={ev._id}
                        event={ev}
                        venue={venue}
                        organizer={organizer}
                        onOpen={openEvent}
                        onDelete={handleDeleteEvent}
                      />
                    );
                  })}
                </div>
                {filteredEvents.length === 0 && (
                  <EmptyState
                    title="No events found"
                    description='Click "Add Event" to create your first event.'
                    buttonText="Add Event"
                    onAdd={() => setEventDialog(true)}
                  />
                )}
              </>
            )}

            {tab === "venue" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
                {venues.map((v) => (
                  <VenueCard key={v._id} venue={v} onEdit={setEditVenue} />
                ))}
                {venues.length === 0 && (
                  <EmptyState
                    title="No venues found"
                    description='Click "Add Venue" to create your first venue.'
                    buttonText="Add Venue"
                    onAdd={() => setVenueDialog(true)}
                  />
                )}
              </div>
            )}

            {tab === "organizer" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
                {organizers.map((o) => (
                  <OrganizerCard
                    key={o._id}
                    organizer={o}
                    onEdit={setEditOrganizer}
                  />
                ))}
                {organizers.length === 0 && (
                  <EmptyState
                    title="No organizers found"
                    description='Click "Add Organizer" to create your first organizer.'
                    buttonText="Add Organizer"
                    onAdd={() => setOrganizerDialog(true)}
                  />
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-neutral-900 text-white safe-area-bottom">
        <nav className="flex items-center justify-around h-16">
          {NAV_ITEMS.map((item) => {
            const isActive = tab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`flex flex-col items-center justify-center flex-1 h-full transition relative ${
                  isActive
                    ? "text-orange-500"
                    : "text-white/60 active:text-white/80"
                }`}
                aria-label={item.label}
              >
                <item.icon
                  className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : ""}`}
                />
                <span
                  className={`text-[10px] mt-0.5 ${isActive ? "font-semibold" : ""}`}
                >
                  {item.label}
                </span>
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-orange-500 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Dialogs */}
      <EventDialog
        open={eventDialog}
        onOpenChange={setEventDialog}
        venues={venues}
        organizers={organizers}
        onSuccess={loadData}
      />

      <VenueDialog
        open={venueDialog || !!editVenue}
        editing={editVenue}
        onOpenChange={(o) => {
          if (!o) {
            setVenueDialog(false);
            setEditVenue(null);
          }
        }}
        onSuccess={loadData}
      />

      <OrganizerDialog
        open={organizerDialog || !!editOrganizer}
        editing={editOrganizer}
        onOpenChange={(o) => {
          if (!o) {
            setOrganizerDialog(false);
            setEditOrganizer(null);
          }
        }}
        onSuccess={loadData}
      />
    </div>
  );
}
