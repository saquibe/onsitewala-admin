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
        categories={data.categories}
        categoryGroups={data.categoryGroups}
        permissions={data.permissions}
        onAddUser={data.addUser}
        onEditUser={data.editUser}
        onDeleteUser={data.deleteUser}
        onPrintBadge={data.printBadge}
        onBulkPrint={data.bulkPrint}
        onImportCSV={async () => {}}
        onExportCSV={() => {}}
        onTogglePermission={data.togglePermission}
        onBulkAllowAll={data.bulkAllowAll}
        onBulkBlockAll={data.bulkBlockAll}
      />
    </div>
  );
}
