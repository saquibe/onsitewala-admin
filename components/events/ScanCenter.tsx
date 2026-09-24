// components/events/ScanCenter.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import {
  ScanLine,
  Search,
  ChevronLeft,
  CheckCircle,
  Camera,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Clock,
  History,
  Keyboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import type {
  ScanCategory,
  ScanUser,
  RegDataType,
  ScanResultData,
} from "./types";

interface ScanCenterProps {
  categories: ScanCategory[];
  users: ScanUser[];
  userTypes: RegDataType[];
  onScanUser: (regNum: string, categoryId: string) => Promise<ScanResultData>;
  onRefreshSummary?: () => Promise<void> | void;
  loading?: boolean;
}

type ScanMode = "mobile" | "manual" | "web";

interface RecentScan {
  regNum: string;
  name: string;
  userTypeName: string;
  at: string;
}

export function ScanCenter({
  categories,
  users,
  userTypes,
  onScanUser,
  onRefreshSummary,
  loading = false,
}: ScanCenterProps) {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [scanMode, setScanMode] = useState<ScanMode>("web");
  const [scanningRegNum, setScanningRegNum] = useState<string | null>(null);
  const [recentScans, setRecentScans] = useState<RecentScan[]>([]);

  const [successResult, setSuccessResult] = useState<ScanResultData | null>(
    null,
  );
  const [conflictMessage, setConflictMessage] = useState<string | null>(null);
  const [notAllowedMessage, setNotAllowedMessage] = useState<string | null>(
    null,
  );

  const selectedCategoryData = categories.find(
    (c) => c.id === selectedCategory,
  );

  const isScanning = scanningRegNum !== null;

  const performScan = async (regNum: string, categoryId: string) => {
    const trimmed = regNum.trim();
    if (!trimmed) return;
    if (scanningRegNum !== null) return; // block concurrent scans
    // console.log("[performScan] starting for", trimmed, categoryId);

    setScanningRegNum(trimmed);
    try {
      const result = await onScanUser(trimmed, categoryId);
      // console.log("[performScan] result received:", result);

      // ⬇️ If result is undefined or missing .registration, this will throw
      if (!result || !result.registration || !result.scannedAt) {
        console.error("[performScan] bad result shape!", result);
        throw new Error("Bad scan result shape");
      }

      // Show the success popup
      setSuccessResult(result);
      // console.log("[performScan] successResult set");

      // Push to recently scanned list
      setRecentScans((prev) =>
        [
          {
            regNum: result.registration.regNum,
            name: result.registration.name,
            userTypeName: result.regDataType.regDataTypeName,
            at: result.scannedAt,
          },
          ...prev.filter(
            (r) =>
              r.regNum.toLowerCase() !==
              result.registration.regNum.toLowerCase(),
          ),
        ].slice(0, 20),
      );

      // Refresh summary in the background after a delay
      setTimeout(() => {
        try {
          onRefreshSummary?.();
        } catch {
          // ignore
        }
      }, 800);
    } catch (e: any) {
      const status = e?.response?.status ?? e?.status;
      const message =
        e?.response?.data?.message ||
        e?.message ||
        "Failed to scan registration.";

      if (status === 409) {
        setConflictMessage(message);
      } else if (status === 403) {
        setNotAllowedMessage(message);
      } else if (status === 404) {
        toast({
          title: "Not found",
          description: message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Scan failed",
          description: message,
          variant: "destructive",
        });
      }
    } finally {
      setScanningRegNum(null);
    }
  };

  // ── Landing: category cards ───────────────────────────────
  if (!selectedCategory) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">
              Scan Categories
            </h2>
            <p className="text-sm text-neutral-500">
              Pick a category to start scanning attendees.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => onRefreshSummary?.()}
            disabled={loading}
            className="gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Refresh
          </Button>
        </div>

        {categories.length === 0 ? (
          <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
            <ScanLine className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900">
              No categories available
            </h3>
            <p className="text-sm text-neutral-500 mt-2">
              Create categories for this event to enable scanning.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <CategoryCard
                key={cat.id}
                category={cat}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setScanMode("web");
                }}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Scan view ─────────────────────────────────────────────
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
      <div className="lg:col-span-3">
        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-neutral-900">
                Scan – {selectedCategoryData?.name}
              </h2>
              <p className="text-sm text-neutral-500">
                Group: {selectedCategoryData?.group}
                {selectedCategoryData?.scannedCount !== undefined &&
                  ` · ${selectedCategoryData.scannedCount}/${
                    selectedCategoryData.totalCount ?? 0
                  } scanned`}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setSelectedCategory(null)}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </Button>
          </div>

          <Tabs
            value={scanMode}
            onValueChange={(v) => setScanMode(v as ScanMode)}
          >
            <TabsList className="mb-4">
              <TabsTrigger value="mobile" className="flex items-center gap-2">
                <Camera className="w-4 h-4" /> Mobile scan
              </TabsTrigger>
              <TabsTrigger value="manual" className="flex items-center gap-2">
                <Search className="w-4 h-4" /> Manual scan
              </TabsTrigger>
              <TabsTrigger value="web" className="flex items-center gap-2">
                <Keyboard className="w-4 h-4" /> Web scan
              </TabsTrigger>
            </TabsList>

            <TabsContent value="mobile">
              <MobileScanPanel
                categoryId={selectedCategory}
                isScanning={isScanning}
                onScan={performScan}
              />
            </TabsContent>

            <TabsContent value="manual">
              <ManualScanPanel
                users={users}
                userTypes={userTypes}
                categoryId={selectedCategory}
                scanningRegNum={scanningRegNum}
                onScan={performScan}
              />
            </TabsContent>

            <TabsContent value="web">
              <WebScanPanel
                categoryId={selectedCategory}
                isScanning={isScanning}
                onScan={performScan}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <div className="lg:col-span-1">
        <RecentlyScannedPanel scans={recentScans} />
      </div>

      {/* Success popup */}
      {/* Success popup */}
      {successResult && (
        <SuccessPopup
          result={successResult}
          onClose={() => setSuccessResult(null)}
        />
      )}

      {/* Already-scanned alert */}
      <AlertDialog
        open={!!conflictMessage}
        onOpenChange={(o) => !o && setConflictMessage(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="w-5 h-5" /> Already Scanned
            </AlertDialogTitle>
            <AlertDialogDescription>
              {conflictMessage ||
                "This registration has already been scanned for this category."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setConflictMessage(null)}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Not allowed alert */}
      <AlertDialog
        open={!!notAllowedMessage}
        onOpenChange={(o) => !o && setNotAllowedMessage(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" /> Not Allowed
            </AlertDialogTitle>
            <AlertDialogDescription>
              {notAllowedMessage ||
                "This category is not allowed for this user type. Configure it in Privileges."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setNotAllowedMessage(null)}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   Category card
   ══════════════════════════════════════════════════════════ */
function CategoryCard({
  category,
  onClick,
}: {
  category: ScanCategory;
  onClick: () => void;
}) {
  const pct = category.coverage ?? 0;
  return (
    <button
      onClick={onClick}
      className="text-left p-5 rounded-xl border-2 border-neutral-200 bg-white hover:border-orange-400 hover:shadow-md transition"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
          <ScanLine className="w-5 h-5 text-orange-600" />
        </div>
        {category.code && (
          <Badge variant="outline" className="text-[10px]">
            {category.code}
          </Badge>
        )}
      </div>
      <div className="font-semibold text-neutral-900 truncate">
        {category.name}
      </div>
      <div className="text-xs text-neutral-500 mb-3 truncate">
        {category.group || "—"}
      </div>

      <div className="flex items-center justify-between text-xs text-neutral-600 mb-1">
        <span>
          {category.scannedCount ?? 0}/{category.totalCount ?? 0}
        </span>
        <span>{pct}%</span>
      </div>
      <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-orange-500 rounded-full transition-all"
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </button>
  );
}

/* ══════════════════════════════════════════════════════════
   Manual scan — only shows results after typing
   ══════════════════════════════════════════════════════════ */
function ManualScanPanel({
  users,
  userTypes,
  categoryId,
  scanningRegNum,
  onScan,
}: {
  users: ScanUser[];
  userTypes: RegDataType[];
  categoryId: string;
  scanningRegNum: string | null;
  onScan: (regNum: string, categoryId: string) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [userTypeFilter, setUserTypeFilter] = useState("all");

  const trimmed = searchQuery.trim();
  const hasQuery = trimmed.length > 0;

  const filteredUsers = hasQuery
    ? users.filter((u) => {
        const s = trimmed.toLowerCase();
        return (
          (u.registrationNo.toLowerCase().includes(s) ||
            u.fullName.toLowerCase().includes(s) ||
            u.email.toLowerCase().includes(s) ||
            (u.phone || "").toLowerCase().includes(s)) &&
          (userTypeFilter === "all" ||
            u.userTypeName ===
              userTypes.find((t) => t._id === userTypeFilter)?.regDataTypeName)
        );
      })
    : [];

  return (
    <>
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Reg No, Email, Full Name, Phone"
            className="pl-10"
            autoFocus
          />
        </div>
        <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All user types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All user types</SelectItem>
            {userTypes.map((ut) => (
              <SelectItem key={ut._id} value={ut._id}>
                {ut.regDataTypeName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!hasQuery ? (
        <div className="border border-dashed rounded-lg p-10 text-center">
          <Search className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
          <h4 className="font-semibold text-neutral-900">
            Start typing to search
          </h4>
          <p className="text-sm text-neutral-500 mt-1">
            Enter Reg No, email, name, or phone to find an attendee.
          </p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="border rounded-lg p-10 text-center">
          <p className="text-sm text-neutral-500">
            No matching users for "{trimmed}".
          </p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-neutral-50">
                <TableHead>Name</TableHead>
                <TableHead>User Type</TableHead>
                <TableHead>Reg No</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="text-right">Scan Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => {
                const scannedAt = user.scans?.[categoryId];
                const isScanned = !!scannedAt;
                const isThisRowScanning =
                  scanningRegNum !== null &&
                  scanningRegNum.toLowerCase() ===
                    user.registrationNo.toLowerCase();

                return (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.fullName}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{user.userTypeName}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {user.registrationNo}
                    </TableCell>
                    <TableCell>{user.email || "-"}</TableCell>
                    <TableCell>{user.phone || "-"}</TableCell>
                    <TableCell className="text-right">
                      {isScanned ? (
                        // ✅ SCANNED = RED badge + timestamp
                        <div className="flex flex-col items-end gap-0.5">
                          <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border border-red-200">
                            <CheckCircle className="w-3 h-3 mr-1" /> Scanned
                          </Badge>
                          <span className="text-[10px] text-neutral-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDateTime(scannedAt!)}
                          </span>
                        </div>
                      ) : (
                        // ✅ NOT SCANNED = GREEN button
                        <Button
                          size="sm"
                          variant="default"
                          disabled={isThisRowScanning}
                          onClick={() =>
                            onScan(user.registrationNo, categoryId)
                          }
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          {isThisRowScanning ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                              Scanning…
                            </>
                          ) : (
                            <>
                              <ScanLine className="w-4 h-4 mr-1" /> Scan
                            </>
                          )}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}

/* ══════════════════════════════════════════════════════════
   Mobile scan — camera only
   ══════════════════════════════════════════════════════════ */
function MobileScanPanel({
  categoryId,
  isScanning,
  onScan,
}: {
  categoryId: string;
  isScanning: boolean;
  onScan: (regNum: string, categoryId: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraOn(true);
    } catch (e: any) {
      setCameraError(e?.message || "Unable to access camera.");
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraOn(false);
  };

  return (
    <div className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center">
      <div className="max-w-md mx-auto">
        <div className="aspect-square max-w-xs mx-auto bg-neutral-900 rounded-lg overflow-hidden flex items-center justify-center relative">
          {cameraOn ? (
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />
          ) : (
            <div className="text-neutral-400">
              <Camera className="w-12 h-12 mx-auto mb-2" />
              <p className="text-sm">Camera is off</p>
            </div>
          )}
          {isScanning && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          )}
        </div>

        {cameraError && (
          <p className="mt-2 text-xs text-red-600">{cameraError}</p>
        )}

        <div className="flex justify-center gap-2 mt-4">
          {!cameraOn ? (
            <Button
              onClick={startCamera}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              <Camera className="w-4 h-4 mr-2" /> Start Scanning
            </Button>
          ) : (
            <Button variant="outline" onClick={stopCamera}>
              Stop Camera
            </Button>
          )}
        </div>

        <p className="text-xs text-neutral-500 mt-3">
          Point the camera at the QR code on the badge.
        </p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   Web scan — USB barcode / QR scanner (keyboard-wedge)
   ══════════════════════════════════════════════════════════ */
function WebScanPanel({
  categoryId,
  isScanning,
  onScan,
}: {
  categoryId: string;
  isScanning: boolean;
  onScan: (regNum: string, categoryId: string) => void;
}) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const t = setInterval(() => {
      if (document.activeElement !== inputRef.current) {
        inputRef.current?.focus();
      }
    }, 1000);
    inputRef.current?.focus();
    return () => clearInterval(t);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const regNum = value.trim();
    if (!regNum) return;
    onScan(regNum, categoryId);
    setValue("");
    inputRef.current?.focus();
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-orange-300 bg-orange-50/40 rounded-lg p-8 text-center">
        <ScanLine className="w-12 h-12 text-orange-500 mx-auto mb-3" />
        <h4 className="font-semibold text-neutral-900">
          Ready to scan with web scanner
        </h4>
        <p className="text-sm text-neutral-500 mt-1">
          Click the box below, then scan the badge with your USB barcode / QR
          scanner.
        </p>

        <form onSubmit={submit} className="mt-4 max-w-sm mx-auto">
          <Input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Waiting for scan…"
            autoFocus
            disabled={isScanning}
            className="text-center text-lg tracking-widest"
          />
        </form>

        {isScanning && (
          <div className="mt-3 flex items-center justify-center gap-2 text-sm text-orange-700">
            <Loader2 className="w-4 h-4 animate-spin" /> Processing…
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   Recently scanned sidebar
   ══════════════════════════════════════════════════════════ */
function RecentlyScannedPanel({ scans }: { scans: RecentScan[] }) {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-4 sticky top-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-neutral-900 flex items-center gap-2">
          <History className="w-4 h-4 text-orange-600" /> Recently Scanned
        </h3>
        <Badge variant="outline" className="text-xs">
          {scans.length}
        </Badge>
      </div>

      {scans.length === 0 ? (
        <div className="text-center py-8">
          <History className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
          <p className="text-xs text-neutral-500">
            No scans yet in this session.
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
          {scans.map((s, i) => (
            <div
              key={`${s.regNum}-${i}`}
              className="p-3 rounded-lg bg-green-50 border border-green-100"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-semibold text-neutral-900 truncate">
                  {s.regNum}
                </span>
                <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
              </div>
              <div className="text-xs text-neutral-700 truncate mt-0.5">
                {s.name}
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] text-neutral-500 truncate">
                  {s.userTypeName}
                </span>
                <span className="text-[10px] text-neutral-500 flex items-center gap-1 shrink-0">
                  <Clock className="w-3 h-3" />
                  {formatDateTime(s.at)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   Success popup
   ══════════════════════════════════════════════════════════ */
function SuccessPopup({
  result,
  onClose,
}: {
  result: ScanResultData;
  onClose: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 1000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl animate-in fade-in zoom-in-95 duration-300">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-2xl text-gray-400 hover:text-gray-600"
        >
          ×
        </button>

        <div className="mx-auto mb-5 flex h-28 w-28 items-center justify-center rounded-full bg-green-100">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-500">
            <CheckCircle className="h-14 w-14 text-white" />
          </div>
        </div>

        <h2 className="text-4xl font-bold text-slate-900">Success!</h2>

        <p className="mt-3 text-lg text-gray-500">
          Your scan was completed
          <br />
          successfully.
        </p>

        <Button
          onClick={onClose}
          className="mt-7 h-14 w-full rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-lg font-bold hover:from-blue-600 hover:to-blue-700"
        >
          Done
        </Button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-neutral-500">{label}</span>
      <span className="font-medium text-neutral-900 text-right truncate">
        {value}
      </span>
    </div>
  );
}

function formatDateTime(iso: string) {
  try {
    return new Date(iso).toLocaleString([], {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}
