// app/events/[id]/dashboard/data/page.tsx
"use client";

import { useCallback } from "react";
import { useParams } from "next/navigation";
import { DataManagement } from "@/components/events";
import {
  registrationDataApi,
  type ExportRegistrationDataResponse,
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useDashboardData } from "../_context/DataContext";

export default function DataPage() {
  const data = useDashboardData();
  const params = useParams();
  const eventId = params.id as string;
  const { toast } = useToast();

  // ── Quick CSV — client-side, users only ──
  const handleExportCSV = useCallback(() => {
    if (!data.printUsers.length) {
      toast({
        title: "Nothing to export",
        description: "No users loaded for this event.",
        variant: "destructive",
      });
      return;
    }

    const headers = [
      "regNum",
      "name",
      "userTypeName",
      "email",
      "mobile",
      "mciNumber",
      "city",
      "state",
      "country",
      "reference",
      "note",
      "isPrinted",
      "printedAt",
    ];

    const rows = data.printUsers.map((u) => [
      u.registrationNo,
      u.fullName,
      u.userTypeName,
      u.email,
      u.phone,
      u.imcNumber ?? "",
      u.city ?? "",
      u.state ?? "",
      u.country ?? "",
      u.reference ?? "",
      u.note ?? "",
      u.printed ? "true" : "false",
      u.printedAt ?? "",
    ]);

    const csv =
      headers.join(",") +
      "\n" +
      rows.map((r) => r.map(escapeCell).join(",")).join("\n");

    triggerDownload(
      csv,
      `users-${eventId}-${new Date().toISOString().slice(0, 10)}.csv`,
    );

    toast({
      title: "CSV exported",
      description: `${data.printUsers.length} users written to CSV.`,
    });
  }, [data.printUsers, eventId, toast]);

  // ── Full export — server-side, users × categories × scans ──
  const handleExportWithScans = useCallback(async () => {
    try {
      toast({
        title: "Preparing export…",
        description: "Fetching full dataset from server.",
      });

      const raw: any =
        await registrationDataApi.exportRegistrationData(eventId);

      // Backend returns a flat array of registrations
      const registrations: any[] = Array.isArray(raw) ? raw : [];

      if (registrations.length === 0) {
        toast({
          title: "Nothing to export",
          description: "The server returned no registrations for this event.",
          variant: "destructive",
        });
        return;
      }

      const headers = [
        "regNum",
        "name",
        "userTypeName",
        "email",
        "mobile",
        "mciNumber",
        "address",
        "city",
        "state",
        "country",
        "reference",
        "note",
        "isPrinted",
        "printedAt",
        "groupCategoryName",
        "categoryCode",
        "categoryName",
        "categoryStatus",
        "day",
        "hall",
        "session",
        "time",
        "isAllowed",
        "isScanned",
        "scannedAt",
      ];

      const lines: string[] = [];

      for (const reg of registrations) {
        const base = [
          reg.regNum ?? "",
          reg.name ?? "",
          reg.regDataType?.regDataTypeName ?? "",
          reg.email ?? "",
          reg.mobile ?? "",
          reg.mciNumber ?? "",
          reg.address ?? "",
          reg.city ?? "",
          reg.state ?? "",
          reg.country ?? "",
          reg.reference ?? "",
          reg.note ?? "",
          reg.printing?.isPrinted ? "true" : "false",
          reg.printing?.printedAt ?? "",
        ];

        const cats = Array.isArray(reg.categories) ? reg.categories : [];

        if (cats.length === 0) {
          lines.push(
            [...base, "", "", "", "", "", "", "", "", "", "", ""]
              .map(escapeCell)
              .join(","),
          );
          continue;
        }

        for (const entry of cats) {
          const cat = entry.category ?? {};
          const grp = entry.groupCategory ?? {};

          lines.push(
            [
              ...base,
              grp.groupCategoryName ?? "",
              cat.categoryCode ?? "",
              cat.categoryName ?? "",
              cat.status ?? "",
              cat.day ?? "",
              cat.hall ?? "",
              cat.session ?? "",
              cat.time ?? "",
              entry.isAllowed ? "true" : "false",
              entry.isScanned ? "true" : "false",
              entry.scannedAt ?? "",
            ]
              .map(escapeCell)
              .join(","),
          );
        }
      }

      const csv = headers.join(",") + "\n" + lines.join("\n");

      triggerDownload(
        csv,
        `users-with-scans-${eventId}-${new Date()
          .toISOString()
          .slice(0, 10)}.csv`,
      );

      toast({
        title: "Export complete",
        description: `${registrations.length} registrations exported.`,
      });
    } catch (e: any) {
      console.error("[exportWithScans] error:", e);
      toast({
        title: "Export failed",
        description: e?.message || "Could not fetch export data.",
        variant: "destructive",
      });
    }
  }, [eventId, toast]);

  const handleRefresh = useCallback(async () => {
    try {
      await data.refresh();
      toast({
        title: "Refreshed",
        description: "Latest data loaded from server.",
      });
    } catch (e: any) {
      toast({
        title: "Refresh failed",
        description: e?.message || "Could not reload data.",
        variant: "destructive",
      });
    }
  }, [data, toast]);

  return (
    <div className="p-4 sm:p-6">
      <DataManagement
        users={data.printUsers}
        userTypes={data.userTypes}
        onImportCSV={data.importCSV}
        onExportCSV={handleExportCSV}
        onExportWithScans={handleExportWithScans}
        onDeleteAllUsers={data.deleteAllUsers}
        onRefresh={data.refresh}
        loading={data.loadingPrintUsers}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────── */

function escapeCell(v: any): string {
  if (v == null) return "";
  const s = String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function triggerDownload(csv: string, filename: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
