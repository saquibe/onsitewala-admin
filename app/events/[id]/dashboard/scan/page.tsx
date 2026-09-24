// app/events/[id]/dashboard/scan/page.tsx
"use client";

import { ScanCenter } from "@/components/events";
import { useDashboardData } from "../_context/DataContext";

export default function ScanPage() {
  const data = useDashboardData();

  // Build category cards from summary (falls back to categories list)
  const categoryCards = data.categories.map((c) => {
    const flat = data.scanSummary
      .flatMap((g) =>
        g.categories.map((x) => ({ ...x, group: g.groupCategory })),
      )
      .find((x) => x.categoryId === c._id);

    return {
      id: c._id,
      name: c.categoryName,
      code: c.categoryCode,
      group:
        data.categoryGroups.find((g) => g._id === c.groupCategoryId)
          ?.groupCategoryName || "",
      scannedCount: flat?.scanned ?? 0,
      totalCount: flat?.total ?? 0,
      coverage: flat?.coverage ?? 0,
    };
  });

  return (
    <div className="p-4 sm:p-6">
      <ScanCenter
        categories={categoryCards}
        users={data.scanUsers}
        userTypes={data.userTypes}
        onScanUser={data.scanUser}
        onRefreshSummary={data.refreshScanSummary}
        loading={data.loadingScanSummary}
      />
    </div>
  );
}
