// components/events/CategoryManagement/index.tsx
"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tag, FolderTree, Layers, Plus, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { UserType, CategoryGroup, Category } from "../types";
import { UserTypesTab } from "./UserTypesTab";
import { CategoryGroupsTab } from "./CategoryGroupsTab";
import { CategoriesTab } from "./CategoriesTab";

interface CategoryManagementProps {
  userTypes: UserType[];
  categoryGroups: CategoryGroup[];
  categories: Category[];
  onAddUserType: (name: string) => void;
  onUpdateUserType: (id: string, name: string) => void;
  onDeleteUserType: (id: string) => void;
  onAddCategoryGroup: (group: Omit<CategoryGroup, "id">) => void;
  onUpdateCategoryGroup: (id: string, data: Partial<CategoryGroup>) => void;
  onDeleteCategoryGroup: (id: string) => void;
  onAddCategory: (category: Omit<Category, "id">) => void;
  onUpdateCategory: (id: string, data: Partial<Category>) => void;
  onDeleteCategory: (id: string) => void;
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
    <div className="bg-white rounded-xl border border-neutral-200 p-5">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="mb-4">
          <TabsTrigger value="types" className="flex items-center gap-2">
            <Tag className="w-4 h-4" /> User Types
          </TabsTrigger>
          <TabsTrigger value="groups" className="flex items-center gap-2">
            <FolderTree className="w-4 h-4" /> Category Groups
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Layers className="w-4 h-4" /> Categories
          </TabsTrigger>
        </TabsList>

        <TabsContent value="types">
          <UserTypesTab
            userTypes={userTypes}
            onAdd={onAddUserType}
            onUpdate={onUpdateUserType}
            onDelete={onDeleteUserType}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="groups">
          <CategoryGroupsTab
            categoryGroups={categoryGroups}
            onAdd={onAddCategoryGroup}
            onUpdate={onUpdateCategoryGroup}
            onDelete={onDeleteCategoryGroup}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="categories">
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
