// components/events/DashboardSection.tsx
import { Users, Printer, ScanLine, FolderTree } from "lucide-react";
import type { Event } from "@/lib/api";
import type { DashboardCard } from "./types";

const DASHBOARD_CARDS: DashboardCard[] = [
  {
    title: "Total Attendees",
    count: 1248,
    icon: Users,
    bg: "bg-orange-50",
    text: "text-orange-600",
  },
  {
    title: "Badges Printed",
    count: 432,
    icon: Printer,
    bg: "bg-blue-50",
    text: "text-blue-600",
  },
  {
    title: "Scans Today",
    count: 890,
    icon: ScanLine,
    bg: "bg-green-50",
    text: "text-green-600",
  },
  {
    title: "Categories",
    count: 156,
    icon: FolderTree,
    bg: "bg-purple-50",
    text: "text-purple-600",
  },
];

interface DashboardSectionProps {
  event: Event;
}

export function DashboardSection({ event }: DashboardSectionProps) {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-neutral-900">Dashboard</h1>
        <p className="text-sm text-neutral-500">
          Overview of {event.eventName}
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {DASHBOARD_CARDS.map((card) => (
          <div
            key={card.title}
            className="bg-white rounded-xl border border-neutral-200 p-5 hover:shadow-md transition"
          >
            <div
              className={`w-11 h-11 rounded-lg ${card.bg} flex items-center justify-center mb-3`}
            >
              <card.icon className={`w-5 h-5 ${card.text}`} />
            </div>
            <div className="text-3xl font-bold text-neutral-900">
              {card.count.toLocaleString()}
            </div>
            <div className="text-sm text-neutral-500 mt-1">{card.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
