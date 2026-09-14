// app/events/[id]/dashboard/page.tsx
"use client";

import { DashboardSection } from "@/components/events/DashboardSection";
import { useDashboard } from "./layout";

export default function DashboardHomePage() {
  const { event } = useDashboard();
  if (!event) return null;

  return (
    <div className="p-4 sm:p-6">
      <DashboardSection event={event} />
    </div>
  );
}
