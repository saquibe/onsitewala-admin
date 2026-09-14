// app/events/[id]/dashboard/settings/page.tsx
"use client";

import { SettingsSection } from "@/components/events/SettingsSection";
import { useDashboard } from "../layout";

export default function SettingsPage() {
  const { event } = useDashboard();
  if (!event) return null;

  return <SettingsSection event={event} />;
}
