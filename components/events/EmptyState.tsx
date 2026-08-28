// components/events/EmptyState.tsx
"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title: string;
  description: string;
  buttonText: string;
  onAdd: () => void;
}

export function EmptyState({
  title,
  description,
  buttonText,
  onAdd,
}: EmptyStateProps) {
  return (
    <div className="text-center py-20">
      <div className="text-neutral-400">
        <div className="text-lg font-medium text-neutral-600">{title}</div>
        <p className="mt-1 text-sm">{description}</p>
        <Button
          onClick={onAdd}
          className="mt-4 bg-orange-600 hover:bg-orange-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          {buttonText}
        </Button>
      </div>
    </div>
  );
}
