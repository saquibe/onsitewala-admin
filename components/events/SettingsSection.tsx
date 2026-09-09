// components/events/SettingsSection.tsx
"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { Event } from "@/lib/api";

interface SettingsSectionProps {
  event: Event;
}

export function SettingsSection({ event }: SettingsSectionProps) {
  const { toast } = useToast();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Success", description: "Settings updated successfully" });
  };

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-neutral-900">Settings</h1>
        <p className="text-sm text-neutral-500">Configure this event</p>
      </div>
      <form onSubmit={handleSave}>
        <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-4">
          <div className="space-y-2">
            <Label>Event Name</Label>
            <Input defaultValue={event.eventName} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Event Short Name</Label>
              <Input defaultValue={event.eventShortName} />
            </div>
            <div className="space-y-2">
              <Label>Operator Login Code</Label>
              <Input defaultValue={event.operatorLoginCode} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                defaultValue={
                  new Date(event.startDate).toISOString().split("T")[0]
                }
              />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                defaultValue={
                  new Date(event.endDate).toISOString().split("T")[0]
                }
              />
            </div>
          </div>
          <Button
            type="submit"
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            Save Settings
          </Button>
        </div>
      </form>
    </div>
  );
}
