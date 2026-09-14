// app/events/[id]/dashboard/spot-registration/page.tsx
"use client";

import { SpotRegistration } from "@/components/events/SpotRegistration";
import { useDashboardData } from "../_context/DataContext";

export default function SpotRegistrationPage() {
  const data = useDashboardData();

  return (
    <SpotRegistration
      users={data.printUsers}
      userTypes={data.userTypes}
      categories={data.categories}
      categoryGroups={data.categoryGroups}
      permissions={data.permissions}
      onAddUser={data.addUser}
      onTogglePermission={data.togglePermission}
      onBulkAllowAll={data.bulkAllowAll}
      onBulkBlockAll={data.bulkBlockAll}
      onPrintBadge={data.printBadge}
    />
  );
}
