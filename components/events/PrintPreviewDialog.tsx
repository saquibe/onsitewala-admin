// components/events/PrintPreviewDialog.tsx
"use client";

import { useEffect, useRef } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { PrintUser } from "./types";

interface PrintPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: PrintUser | null;
  onConfirmPrint?: (userId: string) => void;
}

export function PrintPreviewDialog({
  open,
  onOpenChange,
  user,
  onConfirmPrint,
}: PrintPreviewDialogProps) {
  const yesButtonRef = useRef<HTMLButtonElement>(null);

  // Focus the Yes button when the dialog opens — Enter then confirms
  useEffect(() => {
    if (open) {
      // Small delay so the dialog is fully mounted/focused
      const t = setTimeout(() => yesButtonRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Global Enter handler — even if focus drifts, Enter = Yes
  useEffect(() => {
    if (!open || !user) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        onConfirmPrint?.(user.id);
        onOpenChange(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, user, onConfirmPrint, onOpenChange]);

  if (!user) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        className="max-w-sm"
        onEscapeKeyDown={() => onOpenChange(false)}
      >
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Have you printed the badge?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Confirm that the badge for{" "}
            <strong className="text-neutral-900">{user.fullName}</strong> (
            <span className="font-mono">{user.registrationNo}</span>) was
            printed successfully.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto gap-1.5"
          >
            <XCircle className="w-4 h-4" /> No, not printed
          </AlertDialogCancel>
          <Button
            ref={yesButtonRef}
            onClick={() => {
              onConfirmPrint?.(user.id);
              onOpenChange(false);
            }}
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white gap-1.5"
          >
            <CheckCircle className="w-4 h-4" /> Yes, printed
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
