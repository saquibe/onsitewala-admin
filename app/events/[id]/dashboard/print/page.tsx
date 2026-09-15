// app/events/[id]/dashboard/print/page.tsx
"use client";

import { PrintCenter } from "@/components/events";
import { useDashboardData } from "../_context/DataContext";

export default function PrintPage() {
  const data = useDashboardData();

  return (
    <div className="p-4 sm:p-6">
      <PrintCenter
        users={data.printUsers}
        userTypes={data.userTypes}
        onPrintBadge={data.printBadge}
        onBulkPrint={data.bulkPrint}
        onImportCSV={async () => {}}
        onExportCSV={() => {}}
        loading={data.loadingUserTypes}
      />
    </div>
  );
}
