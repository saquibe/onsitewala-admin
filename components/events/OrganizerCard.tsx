// components/events/OrganizerCard.tsx
"use client";

import { Users, User, Mail, Phone, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Organizer } from "@/lib/api";

interface OrganizerCardProps {
  organizer: Organizer;
  onEdit: (organizer: Organizer) => void;
}

export function OrganizerCard({ organizer, onEdit }: OrganizerCardProps) {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-5">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
          <Users className="w-6 h-6 text-orange-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-neutral-900 truncate">
            {organizer.organizerName}
          </h3>
          <div className="mt-2 space-y-1.5 text-sm text-neutral-600">
            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
              <span className="truncate">{organizer.contactPersonName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
              <span className="truncate">{organizer.contactPersonEmail}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
              <span className="truncate">{organizer.contactPersonMobile}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <Button size="sm" variant="outline" onClick={() => onEdit(organizer)}>
          <Edit className="w-3.5 h-3.5 mr-1" /> Edit
        </Button>
      </div>
    </div>
  );
}
