"use client";

import { useState, use, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  LayoutDashboard,
  FolderTree,
  KeyRound,
  Database,
  Settings,
  Calendar,
  ChevronLeft,
  Users,
  Award,
  ScanLine,
  MoreVertical,
  Edit,
  Trash2,
  Plus,
  ArrowRight,
  LogOut,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  getEventById,
  getCategories,
  updateCategory,
  deleteCategory,
  addCategory,
  getAttendees,
  addAttendee,
  addAttendeesFromCsv,
} from "@/lib/store";
import { CategoryItem } from "@/lib/types";

type Section = "dashboard" | "category" | "privileges" | "data" | "settings";
type CategoryTab = "attendee" | "certificate" | "scan";

export default function EventDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const event = getEventById(id);
  const [section, setSection] = useState<Section>("dashboard");
  const [catTab, setCatTab] = useState<CategoryTab>("attendee");
  const [categories, setCategories] = useState<CategoryItem[]>(
    getCategories(id),
  );
  const [catSearch, setCatSearch] = useState("");
  const [catFilter, setCatFilter] = useState<"all" | "active" | "inactive">(
    "all",
  );
  const [editingCat, setEditingCat] = useState<CategoryItem | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  if (!event) {
    return <div className="p-10">Event not found.</div>;
  }

  const refreshCats = () => setCategories(getCategories(id));

  const filteredCats = categories
    .filter((c) => c.type === catTab)
    .filter((c) => catFilter === "all" || c.status === catFilter)
    .filter((c) => c.badgeType.toLowerCase().includes(catSearch.toLowerCase()));

  const openEdit = (c: CategoryItem) => {
    setEditingCat(c);
    setSheetOpen(true);
  };

  const openAdd = () => {
    setEditingCat(null);
    setSheetOpen(true);
  };

  const onDelete = (cid: string) => {
    deleteCategory(cid);
    refreshCats();
  };

  const dashCards = [
    {
      title: "Badge Printed",
      count: 1248,
      icon: Award,
      color: "from-orange-500 to-amber-500",
      bg: "bg-orange-50",
      text: "text-orange-600",
    },
    {
      title: "Certificate Printed",
      count: 432,
      icon: Award,
      color: "from-blue-500 to-cyan-500",
      bg: "bg-blue-50",
      text: "text-blue-600",
    },
    {
      title: "Single Scan Printed",
      count: 890,
      icon: ScanLine,
      color: "from-green-500 to-emerald-500",
      bg: "bg-green-50",
      text: "text-green-600",
    },
    {
      title: "Multi Scan Printed",
      count: 156,
      icon: ScanLine,
      color: "from-purple-500 to-fuchsia-500",
      bg: "bg-purple-50",
      text: "text-purple-600",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      {/* Top event header */}
      <header className="brand-header-gradient text-white">
        <div className="px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => router.push("/events")}
              className="flex items-center gap-1 text-white/70 hover:text-white text-sm"
            >
              <ChevronLeft className="w-4 h-4" /> Events
            </button>
            <span className="text-white/30">/</span>
            <div className="min-w-0">
              <div className="font-bold truncate">{event.fullName}</div>
            </div>
            <Badge className="ml-2 bg-white/15 text-white border-0 capitalize">
              {event.status}
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-white/60 hidden md:inline">
              {event.startDate} → {event.endDate}
            </span>
            <button
              onClick={() => router.push("/")}
              className="text-white/70 hover:text-white"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Sidebar */}
        <aside className="w-60 bg-white border-r border-neutral-200 flex flex-col">
          <div className="p-4 border-b border-neutral-100">
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <ShieldCheck className="w-4 h-4 text-orange-600" />
              <span>Admin Panel</span>
            </div>
          </div>
          <nav className="flex-1 p-3 space-y-1">
            <SidebarItem
              icon={LayoutDashboard}
              label="Dashboard"
              active={section === "dashboard"}
              onClick={() => setSection("dashboard")}
            />
            <div>
              <SidebarItem
                icon={FolderTree}
                label="Category"
                active={section === "category"}
                onClick={() => setSection("category")}
                hasChildren
              />
              {section === "category" && (
                <div className="ml-6 mt-1 space-y-1 border-l border-neutral-200 pl-3">
                  <SubItem
                    label="Attendee"
                    active={catTab === "attendee"}
                    onClick={() => {
                      setCatTab("attendee");
                      setSection("category");
                    }}
                  />
                  <SubItem
                    label="Certificate"
                    active={catTab === "certificate"}
                    onClick={() => {
                      setCatTab("certificate");
                      setSection("category");
                    }}
                  />
                  <SubItem
                    label="Scan"
                    active={catTab === "scan"}
                    onClick={() => {
                      setCatTab("scan");
                      setSection("category");
                    }}
                  />
                </div>
              )}
            </div>
            <SidebarItem
              icon={KeyRound}
              label="Privileges"
              active={section === "privileges"}
              onClick={() => setSection("privileges")}
            />
            <SidebarItem
              icon={Database}
              label="Data"
              active={section === "data"}
              onClick={() => setSection("data")}
            />
            <SidebarItem
              icon={Settings}
              label="Settings"
              active={section === "settings"}
              onClick={() => setSection("settings")}
            />
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          {section === "dashboard" && (
            <div className="p-6">
              <div className="mb-6">
                <h1 className="text-xl font-bold text-neutral-900">
                  Dashboard
                </h1>
                <p className="text-sm text-neutral-500">
                  Overview of {event.fullName}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                {dashCards.map((card) => (
                  <div
                    key={card.title}
                    className="bg-white rounded-xl border border-neutral-200 p-5 hover:shadow-md transition"
                  >
                    <div
                      className={`w-11 h-11 rounded-lg ${card.bg} flex items-center justify-center mb-3`}
                    >
                      <card.icon className={`w-5 h-5 ${card.text}`} />
                    </div>
                    <div className="text-3xl font-bold text-neutral-900">
                      {card.count.toLocaleString()}
                    </div>
                    <div className="text-sm text-neutral-500 mt-1">
                      {card.title}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="bg-white rounded-xl border border-neutral-200 p-5">
                  <h3 className="font-bold text-neutral-900 mb-4">
                    Recent Activity
                  </h3>
                  <div className="space-y-3">
                    {[
                      { t: "Badge printed for REG001", time: "2 min ago" },
                      {
                        t: "Certificate issued to Priya Patel",
                        time: "15 min ago",
                      },
                      { t: "12 attendees imported via CSV", time: "1 hr ago" },
                      { t: 'Scan category "Hall A" added', time: "3 hr ago" },
                    ].map((a, i) => (
                      <div key={i} className="flex items-start gap-3 text-sm">
                        <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5" />
                        <div className="flex-1">
                          <div className="text-neutral-800">{a.t}</div>
                          <div className="text-xs text-neutral-400">
                            {a.time}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-neutral-200 p-5">
                  <h3 className="font-bold text-neutral-900 mb-4">
                    Quick Actions
                  </h3>
                  <div className="space-y-2">
                    {[
                      {
                        label: "Import attendee data",
                        section: "data" as Section,
                      },
                      {
                        label: "Add new badge category",
                        section: "category" as Section,
                      },
                      {
                        label: "Manage operator privileges",
                        section: "privileges" as Section,
                      },
                      {
                        label: "Configure event settings",
                        section: "settings" as Section,
                      },
                    ].map((qa) => (
                      <button
                        key={qa.label}
                        onClick={() => setSection(qa.section)}
                        className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-neutral-50 text-left transition"
                      >
                        <span className="text-sm text-neutral-700">
                          {qa.label}
                        </span>
                        <ArrowRight className="w-4 h-4 text-neutral-400" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {section === "category" && (
            <div className="p-6">
              {/* Sub-tabs */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex gap-1 bg-neutral-100 p-1 rounded-lg">
                  {(["attendee", "certificate", "scan"] as CategoryTab[]).map(
                    (t) => (
                      <button
                        key={t}
                        onClick={() => setCatTab(t)}
                        className={`px-4 py-1.5 text-sm rounded-md capitalize transition ${catTab === t ? "bg-white shadow-sm font-semibold text-orange-600" : "text-neutral-600 hover:text-neutral-900"}`}
                      >
                        {t}
                      </button>
                    ),
                  )}
                </div>
                <Button
                  onClick={openAdd}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Category
                </Button>
              </div>

              {/* Search + Filter */}
              <div className="flex gap-3 mb-4">
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <Input
                    value={catSearch}
                    onChange={(e) => setCatSearch(e.target.value)}
                    placeholder="Search badge type..."
                    className="pl-10"
                  />
                </div>
                <Select
                  value={catFilter}
                  onValueChange={(v) =>
                    setCatFilter(v as "all" | "active" | "inactive")
                  }
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Table */}
              <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-neutral-50">
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Badge Type</TableHead>
                      <TableHead>Scan Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCats.map((c, i) => (
                      <TableRow key={c.id} className="hover:bg-neutral-50">
                        <TableCell className="text-neutral-400">
                          {i + 1}
                        </TableCell>
                        <TableCell className="font-medium">
                          {c.badgeType}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {c.scanCategory}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              c.status === "active"
                                ? "bg-green-100 text-green-700 border-0"
                                : "bg-neutral-100 text-neutral-500 border-0"
                            }
                          >
                            {c.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="w-8 h-8 rounded-md hover:bg-neutral-100 inline-flex items-center justify-center">
                                <MoreVertical className="w-4 h-4 text-neutral-500" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEdit(c)}>
                                <Edit className="w-4 h-4 mr-2" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => onDelete(c.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredCats.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center py-12 text-neutral-400"
                        >
                          No categories found. Click "Add Category" to create
                          one.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {section === "privileges" && <PrivilegesSection />}
          {section === "data" && <DataSection eventId={id} />}
          {section === "settings" && <SettingsSection event={event} />}
        </main>
      </div>

      {/* Edit/Add Category Sheet */}
      <CategorySheet
        open={sheetOpen}
        editing={editingCat}
        catTab={catTab}
        onOpenChange={setSheetOpen}
        onSubmit={(data) => {
          if (editingCat) {
            updateCategory(editingCat.id, data);
          } else {
            addCategory({ ...data, type: catTab });
          }
          refreshCats();
          setSheetOpen(false);
        }}
      />
    </div>
  );
}

function SidebarItem({
  icon: Icon,
  label,
  active,
  onClick,
  hasChildren,
}: {
  icon: any;
  label: string;
  active: boolean;
  onClick: () => void;
  hasChildren?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${active ? "bg-orange-50 text-orange-700 font-semibold" : "text-neutral-600 hover:bg-neutral-50"}`}
    >
      <Icon
        className={`w-4 h-4 ${active ? "text-orange-600" : "text-neutral-400"}`}
      />
      <span className="flex-1 text-left">{label}</span>
      {hasChildren && (
        <ChevronLeft
          className={`w-3 h-3 transition ${active ? "-rotate-90" : ""}`}
        />
      )}
    </button>
  );
}

function SubItem({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left text-sm px-3 py-1.5 rounded-md transition ${active ? "text-orange-700 font-semibold" : "text-neutral-500 hover:text-neutral-800"}`}
    >
      {label}
    </button>
  );
}

function CategorySheet({
  open,
  editing,
  catTab,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  editing: CategoryItem | null;
  catTab: CategoryTab;
  onOpenChange: (o: boolean) => void;
  onSubmit: (data: Omit<CategoryItem, "id" | "type">) => void;
}) {
  const [badgeType, setBadgeType] = useState("");
  const [scanCategory, setScanCategory] = useState<"single" | "multi" | "none">(
    "single",
  );
  const [status, setStatus] = useState<"active" | "inactive">("active");

  useEffect(() => {
    if (editing) {
      setBadgeType(editing.badgeType);
      setScanCategory(editing.scanCategory);
      setStatus(editing.status);
    } else {
      setBadgeType("");
      setScanCategory("single");
      setStatus("active");
    }
  }, [editing, open]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ badgeType, scanCategory, status });
    setBadgeType("");
    setScanCategory("single");
    setStatus("active");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md slide-panel">
        <SheetHeader>
          <SheetTitle>{editing ? "Edit Category" : "Add Category"}</SheetTitle>
          <SheetDescription>
            {editing
              ? "Update the category details below."
              : `Add a new ${catTab} category.`}
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={submit} className="space-y-5 px-4 py-4">
          <div className="space-y-2">
            <Label>Badge Type *</Label>
            <Input
              value={badgeType}
              onChange={(e) => setBadgeType(e.target.value)}
              required
              placeholder="e.g. Delegate, Speaker"
            />
          </div>
          <div className="space-y-2">
            <Label>Scan Category *</Label>
            <Select
              value={scanCategory}
              onValueChange={(v) => setScanCategory(v as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single</SelectItem>
                <SelectItem value="multi">Multi</SelectItem>
                <SelectItem value="none">None</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Status *</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <SheetFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {editing ? "Save Changes" : "Add"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function PrivilegesSection() {
  const roles = [
    { id: "r1", name: "Administrator", users: 3, perms: ["All access"] },
    {
      id: "r2",
      name: "Operator",
      users: 12,
      perms: ["Scan badges", "Print certificates"],
    },
    {
      id: "r3",
      name: "Data Entry",
      users: 5,
      perms: ["Import data", "View attendees"],
    },
    { id: "r4", name: "Viewer", users: 8, perms: ["View dashboard"] },
  ];
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Privileges</h1>
          <p className="text-sm text-neutral-500">
            Manage roles and access levels for this event
          </p>
        </div>
        <Button className="bg-orange-600 hover:bg-orange-700 text-white">
          <Plus className="w-4 h-4 mr-1" /> Add Role
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roles.map((r) => (
          <div
            key={r.id}
            className="bg-white rounded-xl border border-neutral-200 p-5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                  <KeyRound className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900">{r.name}</h3>
                  <div className="text-xs text-neutral-500">
                    {r.users} users
                  </div>
                </div>
              </div>
              <Button size="sm" variant="outline">
                Edit
              </Button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {r.perms.map((p) => (
                <Badge key={p} variant="outline" className="bg-neutral-50">
                  {p}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DataSection({ eventId }: { eventId: string }) {
  const [attendees, setAttendees] = useState(getAttendees(eventId));
  const [addOpen, setAddOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [importMsg, setImportMsg] = useState("");

  // Add form
  const [regNo, setRegNo] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [regType, setRegType] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  const refresh = () => setAttendees(getAttendees(eventId));

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addAttendee(eventId, {
      registrationNumber: regNo,
      firstName,
      lastName,
      registrationType: regType,
      mobileNumber: mobile,
      emailId: email,
      address,
    });
    refresh();
    setAddOpen(false);
    setRegNo("");
    setFirstName("");
    setLastName("");
    setRegType("");
    setMobile("");
    setEmail("");
    setAddress("");
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split(/\r?\n/).filter(Boolean);
      const rows = lines.slice(1).map((line) => {
        const [
          registrationNumber,
          firstName,
          lastName,
          registrationType,
          mobileNumber,
          emailId,
          address,
        ] = line.split(",").map((s) => s?.trim() || "");
        return {
          registrationNumber,
          firstName,
          lastName,
          registrationType,
          mobileNumber,
          emailId,
          address,
        };
      });
      addAttendeesFromCsv(eventId, rows);
      refresh();
      setImportMsg(`Imported ${rows.length} attendees from ${file.name}`);
    };
    reader.readAsText(file);
  };

  const downloadSample = () => {
    const csv =
      'registration number,first name,last name,registration type,mobile number,email id,address\nREG001,Amit,Sharma,Delegate,9876543210,amit@email.com,"123 MG Road, Bengaluru"\n';
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sample-attendees.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = attendees.filter(
    (a) =>
      a.firstName.toLowerCase().includes(search.toLowerCase()) ||
      a.lastName.toLowerCase().includes(search.toLowerCase()) ||
      a.emailId.toLowerCase().includes(search.toLowerCase()) ||
      a.registrationNumber.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Data</h1>
          <p className="text-sm text-neutral-500">
            Import or manually add attendee data
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={downloadSample}>
            <Database className="w-4 h-4 mr-1" /> Download Sample CSV
          </Button>
          <Button
            onClick={() => setAddOpen(true)}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            <Plus className="w-4 h-4 mr-1" /> Add Attendee
          </Button>
        </div>
      </div>

      {/* Import dropzone */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-5">
        <div className="border-2 border-dashed border-neutral-200 rounded-lg p-8 text-center hover:border-orange-400 transition">
          <Database className="w-10 h-10 mx-auto text-neutral-300 mb-3" />
          <div className="font-medium text-neutral-700">
            Import data from file
          </div>
          <div className="text-sm text-neutral-400 mt-1">
            Upload a .csv file with attendee data. Download the sample to see
            the format.
          </div>
          <label className="mt-4 inline-block">
            <input
              type="file"
              accept=".csv"
              onChange={handleFile}
              className="hidden"
            />
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-md cursor-pointer hover:bg-orange-700 text-sm">
              <Plus className="w-4 h-4" /> Choose CSV file
            </span>
          </label>
          {importMsg && (
            <div className="mt-3 text-sm text-green-600">{importMsg}</div>
          )}
        </div>
      </div>

      {/* Attendees table */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="p-4 border-b border-neutral-100">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search attendees..."
              className="pl-10"
            />
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-neutral-50">
              <TableHead>Reg. No.</TableHead>
              <TableHead>First Name</TableHead>
              <TableHead>Last Name</TableHead>
              <TableHead>Reg. Type</TableHead>
              <TableHead>Mobile</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Address</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((a) => (
              <TableRow key={a.id} className="hover:bg-neutral-50">
                <TableCell className="font-medium">
                  {a.registrationNumber}
                </TableCell>
                <TableCell>{a.firstName}</TableCell>
                <TableCell>{a.lastName}</TableCell>
                <TableCell>
                  <Badge variant="outline">{a.registrationType}</Badge>
                </TableCell>
                <TableCell>{a.mobileNumber}</TableCell>
                <TableCell>{a.emailId}</TableCell>
                <TableCell className="max-w-xs truncate text-neutral-500">
                  {a.address}
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-12 text-neutral-400"
                >
                  No attendees yet. Import a CSV or add one manually.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Attendee Sheet */}
      <Sheet open={addOpen} onOpenChange={setAddOpen}>
        <SheetContent className="sm:max-w-md slide-panel">
          <SheetHeader>
            <SheetTitle>Add Attendee</SheetTitle>
            <SheetDescription>
              Manually add a new attendee record.
            </SheetDescription>
          </SheetHeader>
          <form onSubmit={handleAdd} className="space-y-4 px-4 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2 col-span-2">
                <Label>Registration Number *</Label>
                <Input
                  value={regNo}
                  onChange={(e) => setRegNo(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>First Name *</Label>
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Last Name *</Label>
                <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Registration Type *</Label>
                <Input
                  value={regType}
                  onChange={(e) => setRegType(e.target.value)}
                  required
                  placeholder="Delegate"
                />
              </div>
              <div className="space-y-2">
                <Label>Mobile Number *</Label>
                <Input
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Email Id *</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Address *</Label>
                <Textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>
            </div>
            <SheetFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                Add Attendee
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function SettingsSection({ event }: { event: any }) {
  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-neutral-900">Settings</h1>
        <p className="text-sm text-neutral-500">Configure this event</p>
      </div>
      <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-4">
        <div className="space-y-2">
          <Label>Full Name</Label>
          <Input defaultValue={event.fullName} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Short Name</Label>
            <Input defaultValue={event.shortName} />
          </div>
          <div className="space-y-2">
            <Label>Operator Login Code</Label>
            <Input defaultValue={event.operatorLoginCode} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Start Date</Label>
            <Input type="date" defaultValue={event.startDate} />
          </div>
          <div className="space-y-2">
            <Label>End Date</Label>
            <Input type="date" defaultValue={event.endDate} />
          </div>
        </div>
        <Button className="bg-orange-600 hover:bg-orange-700 text-white">
          Save Settings
        </Button>
      </div>
    </div>
  );
}
