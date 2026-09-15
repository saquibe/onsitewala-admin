// app/events/[id]/dashboard/data/page.tsx
"use client";

import { DataManagement } from "@/components/events";
import { useDashboardData } from "../_context/DataContext";

export default function DataPage() {
  const data = useDashboardData();

  return (
    <div className="p-4 sm:p-6">
      <DataManagement
        users={data.printUsers}
        userTypes={data.userTypes}
        onImportCSV={data.importCSV}
        onExportCSV={() => {}}
        onExportWithScans={() => {}}
        onDeleteAllUsers={data.deleteAllUsers}
        onRefresh={data.refresh}
        loading={data.loadingPrintUsers}
      />
    </div>
  );
}
