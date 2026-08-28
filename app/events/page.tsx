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
      console.log("Loading data...");

      const [eventsRes, venuesRes, organizersRes] = await Promise.all([
        eventsApi.getEvents({ limit: 100 }),
        venuesApi.getVenues({ limit: 100 }),
        organizersApi.getOrganizers({ limit: 100 }),
      ]);

      console.log("Events response:", eventsRes);
      console.log("Venues response:", venuesRes);
      console.log("Organizers response:", organizersRes);

      // Handle different response structures
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
        {/* Mini sidebar */}
        <aside className="w-16 lg:w-20 bg-neutral-900 text-white flex flex-col items-center py-6 gap-2">
          <div className="w-10 h-10 rounded-lg bg-orange-600 flex items-center justify-center">
            <LayoutGrid className="w-5 h-5" />
          </div>
          <nav className="mt-4 flex flex-col gap-3">
            <button
              onClick={() => setTab("events")}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition ${
                tab === "events" ? "bg-white/15" : "hover:bg-white/10"
              }`}
              title="Events"
            >
              <Calendar className="w-5 h-5" />
            </button>
            <button
              onClick={() => setTab("venue")}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition ${
                tab === "venue" ? "bg-white/15" : "hover:bg-white/10"
              }`}
              title="Venues"
            >
              <MapPin className="w-5 h-5" />
            </button>
            <button
              onClick={() => setTab("organizer")}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition ${
                tab === "organizer" ? "bg-white/15" : "hover:bg-white/10"
              }`}
              title="Organizers"
            >
              <Users className="w-5 h-5" />
            </button>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          {/* Tabs */}
          <div className="bg-white border-b border-neutral-200 px-6 pt-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-neutral-900 capitalize">
                {tab === "venue"
                  ? "Venues"
                  : tab === "organizer"
                    ? "Organizers"
                    : "Events"}
              </h1>
              <Button
                onClick={() => {
                  if (tab === "events") setEventDialog(true);
                  else if (tab === "venue") setVenueDialog(true);
                  else setOrganizerDialog(true);
                }}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add{" "}
                {tab === "venue"
                  ? "Venue"
                  : tab === "organizer"
                    ? "Organizer"
                    : "Event"}
              </Button>
            </div>
            <div className="flex gap-6 mt-3">
              {(["events", "venue", "organizer"] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`pb-3 text-sm capitalize transition border-b-2 ${
                    tab === t
                      ? "border-orange-600 text-orange-600 font-semibold"
                      : "border-transparent text-neutral-500 hover:text-neutral-800"
                  }`}
                >
                  {t === "venue"
                    ? "Venues"
                    : t === "organizer"
                      ? "Organizers"
                      : "Events"}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {tab === "events" && (
              <>
                <div className="mb-4 relative max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <Input
                    value={eventSearch}
                    onChange={(e) => setEventSearch(e.target.value)}
                    placeholder="Search events by name, venue, or organizer..."
                    className="pl-10 bg-white"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
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
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
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
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
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
