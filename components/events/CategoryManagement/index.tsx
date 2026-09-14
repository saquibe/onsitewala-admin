// components/events/CategoryManagement/index.tsx
"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tag, FolderTree, Layers } from "lucide-react";
import type { RegDataType, CategoryGroup, Category } from "../types"; // ← RegDataType
import { UserTypesTab } from "./UserTypesTab";
import { CategoryGroupsTab } from "./CategoryGroupsTab";
import { CategoriesTab } from "./CategoriesTab";

interface CategoryManagementProps {
  userTypes: RegDataType[]; // ← RegDataType[]
  categoryGroups: CategoryGroup[];
  categories: Category[];
  onAddUserType: (name: string) => Promise<void>;
  onUpdateUserType: (id: string, name: string) => Promise<void>;
  onDeleteUserType: (id: string) => Promise<void>;
  onAddCategoryGroup: (
    group: Omit<CategoryGroup, "_id" | "eventId">,
  ) => Promise<void>;
  onUpdateCategoryGroup: (
    id: string,
    data: Partial<CategoryGroup>,
  ) => Promise<void>;
  onDeleteCategoryGroup: (id: string) => Promise<void>;
  onAddCategory: (category: Omit<Category, "_id" | "eventId">) => Promise<void>;
  onUpdateCategory: (id: string, data: Partial<Category>) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
  loading?: boolean;
}

export function CategoryManagement({
  userTypes,
  categoryGroups,
  categories,
  onAddUserType,
  onUpdateUserType,
  onDeleteUserType,
  onAddCategoryGroup,
  onUpdateCategoryGroup,
  onDeleteCategoryGroup,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  loading = false,
}: CategoryManagementProps) {
  const [activeTab, setActiveTab] = useState<"types" | "groups" | "categories">(
    "types",
  );

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-3 sm:p-5">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0 mb-4">
          <TabsList className="w-full sm:w-auto inline-flex min-w-full sm:min-w-0">
            <TabsTrigger
              value="types"
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm py-2"
            >
              <Tag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="whitespace-nowrap">User Types</span>
            </TabsTrigger>
            <TabsTrigger
              value="groups"
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm py-2"
            >
              <FolderTree className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="whitespace-nowrap">Groups</span>
            </TabsTrigger>
            <TabsTrigger
              value="categories"
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm py-2"
            >
              <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="whitespace-nowrap">Categories</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="types" className="mt-0">
          <UserTypesTab
            userTypes={userTypes}
            onAdd={onAddUserType}
            onUpdate={onUpdateUserType}
            onDelete={onDeleteUserType}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="groups" className="mt-0">
          <CategoryGroupsTab
            categoryGroups={categoryGroups}
            onAdd={onAddCategoryGroup}
            onUpdate={onUpdateCategoryGroup}
            onDelete={onDeleteCategoryGroup}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="categories" className="mt-0">
          <CategoriesTab
            categories={categories}
            categoryGroups={categoryGroups}
            onAdd={onAddCategory}
            onUpdate={onUpdateCategory}
            onDelete={onDeleteCategory}
            loading={loading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
