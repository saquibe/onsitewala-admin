// components/events/VenueCard.tsx
"use client";

import { MapPin, Building2, Globe, Edit, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Venue } from "@/lib/api";

interface VenueCardProps {
  venue: Venue;
  onEdit: (venue: Venue) => void;
}

export function VenueCard({ venue, onEdit }: VenueCardProps) {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
      <div className="h-32 bg-gradient-to-br from-orange-100 to-amber-50 flex items-center justify-center relative">
        {venue.uploadVenuePhoto ? (
          <img
            src={venue.uploadVenuePhoto}
            alt={venue.venueName}
            className="w-full h-full object-cover"
          />
        ) : (
          <MapPin className="w-10 h-10 text-orange-400" />
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-neutral-900">{venue.venueName}</h3>
        <div className="mt-2 space-y-1.5 text-sm text-neutral-600">
          <div className="flex items-start gap-2">
            <MapPin className="w-3.5 h-3.5 mt-0.5 text-neutral-400 flex-shrink-0" />
            <span className="line-clamp-2">{venue.address}</span>
          </div>
          <div className="flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-neutral-400" />
            {venue.city}, {venue.state}, {venue.country}
          </div>
          {venue.website && (
            <div className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-neutral-400" />
              <a
                href={venue.website}
                target="_blank"
                rel="noreferrer"
                className="text-orange-600 hover:underline truncate"
              >
                {venue.website}
              </a>
            </div>
          )}
          {venue.mapLink && (
            <div className="flex items-center gap-2">
              <LinkIcon className="w-3.5 h-3.5 text-neutral-400" />
              <a
                href={venue.mapLink}
                target="_blank"
                rel="noreferrer"
                className="text-orange-600 hover:underline truncate"
              >
                View on Map
              </a>
            </div>
          )}
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button size="sm" variant="outline" onClick={() => onEdit(venue)}>
            <Edit className="w-3.5 h-3.5 mr-1" /> Edit
          </Button>
        </div>
      </div>
    </div>
  );
}
