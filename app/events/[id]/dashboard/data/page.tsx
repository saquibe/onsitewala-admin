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
        categories={data.categories}
        categoryGroups={data.categoryGroups}
        permissions={data.permissions}
        onAddUser={data.addUser}
        onImportCSV={async () => {}}
        onExportCSV={() => {}}
        onExportWithScans={() => {}}
        onDeleteAllUsers={() => {}}
        onRefresh={data.refresh}
        onTogglePermission={data.togglePermission}
        onBulkAllowAll={(userTypeId, categoryIds) =>
          data.bulkAllowAll(userTypeId)
        }
        onBulkBlockAll={(userTypeId, categoryIds) =>
          data.bulkBlockAll(userTypeId)
        }
      />
    </div>
  );
}
