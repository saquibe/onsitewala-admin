// app/events/[id]/dashboard/spot-registration/page.tsx
"use client";

import { SpotRegistration } from "@/components/events/SpotRegistration";
import { useDashboardData } from "../_context/DataContext";

export default function SpotRegistrationPage() {
  const data = useDashboardData();

  console.log("🔵 [SpotRegistrationPage] categories:", data.categories.length);
  console.log("🔵 [SpotRegistrationPage] userTypes:", data.userTypes.length);

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
      loading={data.loadingCategories || data.loadingUserTypes}
    />
  );
}
