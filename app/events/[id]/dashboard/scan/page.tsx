// app/events/[id]/dashboard/scan/page.tsx
"use client";

import { ScanCenter } from "@/components/events";
import { useDashboardData } from "../_context/DataContext";

export default function ScanPage() {
  const data = useDashboardData();

  return (
    <div className="p-4 sm:p-6">
      <ScanCenter
        categories={data.categories.map((c) => ({
          id: c._id,
          name: c.categoryName,
          group:
            data.categoryGroups.find((g) => g._id === c.groupCategoryId)
              ?.groupCategoryName || "",
          count: 0,
        }))}
        users={data.scanUsers}
        userTypes={data.userTypes}
        onScanUser={data.scanUser}
      />
    </div>
  );
}
