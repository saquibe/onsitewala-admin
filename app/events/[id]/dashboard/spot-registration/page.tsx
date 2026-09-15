// app/events/[id]/dashboard/spot-registration/page.tsx
"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { SpotRegistration } from "@/components/events/SpotRegistration";
import { useDashboardData } from "../_context/DataContext";

function SpotRegistrationContent() {
  const data = useDashboardData();

  return (
    <SpotRegistration
      users={data.printUsers}
      userTypes={data.userTypes}
      categories={data.categories}
      categoryGroups={data.categoryGroups}
      permissions={data.permissions}
      onAddUser={data.addUser}
      onEditUser={data.editUser}
      onTogglePermission={data.togglePermission}
      onBulkAllowAll={data.bulkAllowAll}
      onBulkBlockAll={data.bulkBlockAll}
      onPrintBadge={data.printBadge}
      loading={data.loadingCategories || data.loadingUserTypes}
    />
  );
}

export default function SpotRegistrationPage() {
  return (
    <Suspense
      fallback={
        <div className="p-4 sm:p-6 flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
        </div>
      }
    >
      <SpotRegistrationContent />
    </Suspense>
  );
}
