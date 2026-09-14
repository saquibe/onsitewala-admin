// app/events/[id]/dashboard/category/page.tsx
"use client";

import { CategoryManagement } from "@/components/events";
import { useDashboardData } from "../_context/DataContext";

export default function CategoryPage() {
  const data = useDashboardData();

  return (
    <div className="p-4 sm:p-6">
      <CategoryManagement
        userTypes={data.userTypes as any}
        categoryGroups={data.categoryGroups}
        categories={data.categories}
        onAddUserType={data.addUserType}
        onUpdateUserType={data.updateUserType}
        onDeleteUserType={data.deleteUserType}
        onAddCategoryGroup={data.addCategoryGroup}
        onUpdateCategoryGroup={data.updateCategoryGroup}
        onDeleteCategoryGroup={data.deleteCategoryGroup}
        onAddCategory={data.addCategory}
        onUpdateCategory={data.updateCategory}
        onDeleteCategory={data.deleteCategory}
        loading={data.loadingCategories || data.loadingGroups}
      />
    </div>
  );
}
