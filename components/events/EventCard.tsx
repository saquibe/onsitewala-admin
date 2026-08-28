// components/events/EventCard.tsx
"use client";

import {
  Calendar,
  MapPin,
  Users,
  MoreVertical,
  Edit,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Event, Venue, Organizer } from "@/lib/api";
import { formatDateRange } from "@/lib/utils/date";

interface EventCardProps {
  event: Event;
  venue?: Venue | null;
  organizer?: Organizer | null;
  onOpen: (id: string) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}

export function EventCard({
  event,
  venue,
  organizer,
  onOpen,
  onDelete,
}: EventCardProps) {
  const getStatusColor = (status?: string) => {
    const colors: Record<string, string> = {
      Upcoming: "bg-blue-100 text-blue-700 border-blue-200",
      Live: "bg-green-100 text-green-700 border-green-200",
      Past: "bg-neutral-100 text-neutral-500 border-neutral-200",
    };
    return (
      colors[status || ""] ||
      "bg-neutral-100 text-neutral-600 border-neutral-200"
    );
  };

  const getStatusLabel = (status?: string) => status || "Draft";

  return (
    <div
      onClick={() => onOpen(event._id)}
      className="bg-white rounded-xl border border-neutral-200 overflow-hidden cursor-pointer group hover:shadow-md transition-shadow"
    >
      <div className="relative h-40 overflow-hidden">
        <img
          src={
            event.uploadEventLogo ||
            "https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=400"
          }
          alt={event.eventName}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
        />
        <div className="absolute top-3 left-3">
          <Badge className={`${getStatusColor(event.dynamicStatus)} border`}>
            {getStatusLabel(event.dynamicStatus)}
          </Badge>
        </div>
        <div
          className="absolute top-3 right-3"
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-7 h-7 rounded-md bg-white/90 backdrop-blur flex items-center justify-center text-neutral-700 hover:bg-white">
                <MoreVertical className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onOpen(event._id)}>
                <Edit className="w-4 h-4 mr-2" /> Open
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onClick={(e) => onDelete(event._id, e)}
              >
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="p-4">
        <div className="text-xs text-orange-600 font-semibold">
          {event.eventShortName}
        </div>
        <h3 className="font-bold text-neutral-900 mt-1 line-clamp-2">
          {event.eventName}
        </h3>
        <div className="mt-3 space-y-1.5 text-sm text-neutral-600">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-neutral-400" />
            {formatDateRange(event.startDate, event.endDate)}
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-neutral-400" />
            {venue?.venueName || "Unknown Venue"}
            {venue?.city && `, ${venue.city}`}
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-neutral-400" />
            {organizer?.organizerName || "Unknown Organizer"}
          </div>
        </div>
      </div>
    </div>
  );
}
