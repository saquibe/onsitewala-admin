// app/events/[id]/dashboard/privileges/page.tsx
"use client";

import { Privileges } from "@/components/events/Privileges";
import { useDashboardData } from "../_context/DataContext";

export default function PrivilegesPage() {
  const data = useDashboardData();

  return (
    <div className="p-4 sm:p-6">
      <Privileges
        userTypes={data.userTypes}
        categories={data.categories}
        permissions={data.permissions}
        onTogglePermission={data.togglePermission}
        onBulkAllowAll={data.bulkAllowAll}
        onBulkBlockAll={data.bulkBlockAll}
        loading={data.loadingPermissions}
      />
    </div>
  );
}
