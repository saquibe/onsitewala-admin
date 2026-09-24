// components/events/DataManagement/index.tsx
"use client";

import { useMemo, useState } from "react";
import {
  Upload,
  Download,
  RefreshCw,
  FileText,
  Loader2,
  Trash2,
  AlertTriangle,
  Database,
  CheckCircle2,
  XCircle,
  Info,
  FileDown,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { useToast } from "@/hooks/use-toast";
import type { PrintUser, RegDataType } from "../types";
import {
  ALL_COLUMNS,
  OPTIONAL_COLUMNS,
  REQUIRED_COLUMNS,
  ValidationResult,
  downloadTemplate,
  parseAndValidate,
} from "@/lib/utils/csv-validator";

interface DataManagementProps {
  users: PrintUser[];
  userTypes: RegDataType[];
  onImportCSV: (file: File, regDataTypeId: string) => Promise<number>;
  onExportCSV: () => void;
  onExportWithScans: () => void | Promise<void>;
  onDeleteAllUsers: () => Promise<void>;
  onRefresh: () => void;
  loading?: boolean;
}

const ACCEPTED_EXT = [".csv", ".xlsx", ".xls"];

export function DataManagement({
  users,
  userTypes,
  onImportCSV,
  onExportCSV,
  onExportWithScans,
  onDeleteAllUsers,
  onRefresh,
  loading = false,
}: DataManagementProps) {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [selectedUserType, setSelectedUserType] = useState(
    userTypes[0]?._id || "",
  );
  const [isUploading, setIsUploading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isExportingScans, setIsExportingScans] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // existing regNums in this event, lowercased
  const existingRegNums = useMemo(
    () =>
      new Set(
        users
          .map((u) => String((u as any).regNum ?? "").toLowerCase())
          .filter(Boolean),
      ),
    [users],
  );

  const resetFile = () => {
    setFile(null);
    setValidation(null);
    const input = document.getElementById(
      "csv-file-input",
    ) as HTMLInputElement | null;
    if (input) input.value = "";
  };

  const handleFileChange = async (f: File | null) => {
    setValidation(null);
    if (!f) {
      setFile(null);
      return;
    }

    const ext = "." + (f.name.split(".").pop() || "").toLowerCase();
    if (!ACCEPTED_EXT.includes(ext)) {
      toast({
        title: "Unsupported file type",
        description: `Please upload one of: ${ACCEPTED_EXT.join(", ")}`,
        variant: "destructive",
      });
      resetFile();
      return;
    }

    if (f.size === 0) {
      toast({
        title: "File is empty",
        description: "The selected file has no content.",
        variant: "destructive",
      });
      resetFile();
      return;
    }

    setFile(f);

    // CSV can be validated in browser; xlsx needs server-side parse
    if (ext === ".csv") {
      setIsValidating(true);
      try {
        const result = await parseAndValidate(f, existingRegNums);
        setValidation(result);
      } catch (e: any) {
        toast({
          title: "Could not read file",
          description: e?.message ?? "Failed to parse the CSV.",
          variant: "destructive",
        });
      } finally {
        setIsValidating(false);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please choose a CSV or Excel file first.",
        variant: "destructive",
      });
      return;
    }
    if (!selectedUserType) {
      toast({
        title: "No user type selected",
        description: "Please select a user type before importing.",
        variant: "destructive",
      });
      return;
    }
    if (validation && !validation.ok) {
      toast({
        title: "Fix errors before importing",
        description: `${validation.issues.length} issue(s) found in your file.`,
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const count = await onImportCSV(file, selectedUserType);
      toast({
        title: "Import complete",
        description: `${count} user(s) imported successfully.`,
      });
      resetFile();
    } catch {
      // Error toasted in parent
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await onDeleteAllUsers();
      setShowDeleteDialog(false);
    } catch {
      // Error toasted in parent
    }
  };

  const canUpload =
    !!file &&
    !!selectedUserType &&
    !isUploading &&
    !isValidating &&
    (!validation || validation.ok);

  return (
    <div className="space-y-6">
      {/* ── Import / Export ─────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">
              Import / Export Users
            </h2>
            <p className="text-sm text-neutral-500">
              Upload users via CSV or Excel, or download all users as CSV.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={async () => {
              setIsRefreshing(true);
              try {
                await Promise.resolve(onRefresh());
              } finally {
                setIsRefreshing(false);
              }
            }}
            disabled={isRefreshing || loading}
            className="gap-2"
          >
            {isRefreshing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Refreshing…
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Refresh
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* ── Import ── */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-neutral-900 mb-2 flex items-center gap-2">
              <Upload className="w-4 h-4 text-orange-600" /> Import Data
            </h3>

            {/* Format guide */}
            <FormatGuide />

            <div className="space-y-3 mt-4">
              {/* User Type */}
              <div className="space-y-1.5">
                <Label className="text-xs text-neutral-600">
                  Select User Type *
                </Label>
                <Select
                  value={selectedUserType}
                  onValueChange={setSelectedUserType}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select user type" />
                  </SelectTrigger>
                  <SelectContent>
                    {userTypes.length === 0 ? (
                      <div className="p-2 text-xs text-neutral-500 text-center">
                        No user types available
                      </div>
                    ) : (
                      userTypes.map((ut) => (
                        <SelectItem key={ut._id} value={ut._id}>
                          {ut.regDataTypeName}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* File */}
              <div className="space-y-1.5">
                <Label className="text-xs text-neutral-600">
                  Choose File (.csv, .xlsx, .xls) *
                </Label>
                <Input
                  id="csv-file-input"
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={(e) =>
                    handleFileChange(e.target.files?.[0] || null)
                  }
                  className="max-w-full"
                />
                {file && (
                  <span className="text-xs text-neutral-600 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" /> {file.name}
                    {isValidating && (
                      <Loader2 className="w-3 h-3 animate-spin ml-1" />
                    )}
                  </span>
                )}
              </div>

              {/* Pre-flight validation result */}
              {validation && <ValidationReport result={validation} />}

              <Button
                onClick={handleUpload}
                disabled={!canUpload}
                className="bg-orange-600 hover:bg-orange-700 text-white w-full sm:w-auto"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-1" />
                    Upload File
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* ── Export ── */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-neutral-900 mb-2 flex items-center gap-2">
              <Download className="w-4 h-4 text-blue-600" /> Export
            </h3>
            <p className="text-xs text-neutral-500 mb-3">
              Download all users as CSV or include scan data.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={onExportCSV} className="gap-2">
                <Download className="w-4 h-4" /> Download CSV
              </Button>
              <Button
                variant="outline"
                disabled={isExportingScans}
                onClick={async () => {
                  setIsExportingScans(true);
                  try {
                    await onExportWithScans();
                  } finally {
                    setIsExportingScans(false);
                  }
                }}
                className="gap-2"
              >
                {isExportingScans ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Exporting…
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4" />
                    Export Users + Scans
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Users count ─────────────────────────────────────────── */}
      {/* <div className="bg-white rounded-xl border border-neutral-200 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-neutral-900">
              Total Registered Users
            </h3>
            <p className="text-sm text-neutral-500 mt-1">
              {users.length.toLocaleString()}{" "}
              {users.length === 1 ? "user" : "users"} in this event
            </p>
          </div>
          <div className="w-14 h-14 rounded-lg bg-orange-50 flex items-center justify-center">
            <Database className="w-6 h-6 text-orange-600" />
          </div>
        </div>
      </div> */}

      {/* ── Danger zone ─────────────────────────────────────────── */}
      <div className="border-2 border-red-200 rounded-lg p-5 bg-red-50">
        <div className="flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="font-semibold text-red-800">
              Danger Zone: Delete all users
            </h3>
            <p className="text-sm text-red-600 mt-1">
              This action is irreversible. Consider downloading a CSV backup
              first.
            </p>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              disabled={users.length === 0}
              className="mt-3 gap-2"
            >
              <Trash2 className="w-4 h-4" /> Delete ALL Users
            </Button>
          </div>
        </div>
      </div>

      {/* ── Delete dialog ───────────────────────────────────────── */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Delete ALL Users
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete all{" "}
              <strong>{users.length}</strong> users and their associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDelete}
            >
              Yes, Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Sub-components
   ──────────────────────────────────────────────────────────── */

function FormatGuide() {
  const [open, setOpen] = useState(true);
  return (
    <div className="rounded-lg border border-blue-100 bg-blue-50/60 p-3 text-xs">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 text-blue-900 font-semibold"
      >
        <span className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5" /> File format guide
        </span>
        <span className="text-blue-700">{open ? "Hide" : "Show"}</span>
      </button>

      {open && (
        <div className="mt-2 space-y-2 text-blue-900/90">
          <div>
            <p className="font-medium mb-1">Required columns:</p>
            <div className="flex flex-wrap gap-1">
              {REQUIRED_COLUMNS.map((c) => (
                <Badge
                  key={c}
                  className="bg-red-100 text-red-800 hover:bg-red-100 text-[10px]"
                >
                  {c} *
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <p className="font-medium mb-1">Optional columns:</p>
            <div className="flex flex-wrap gap-1">
              {OPTIONAL_COLUMNS.map((c) => (
                <Badge
                  key={c}
                  variant="secondary"
                  className="text-[10px] bg-white text-neutral-700"
                >
                  {c}
                </Badge>
              ))}
            </div>
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-blue-900/80">
            <li>Header row must be the first row.</li>
            <li>Column names are case-insensitive.</li>
            <li>
              Save Excel sheets as <strong>.csv</strong>, <strong>.xlsx</strong>{" "}
              or <strong>.xls</strong>.
            </li>
            <li>regNum must be unique within the file and the event.</li>
          </ul>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={downloadTemplate}
            className="gap-2 bg-white border-blue-200 text-blue-800 hover:bg-blue-50 mt-1"
          >
            <FileDown className="w-3.5 h-3.5" /> Download CSV template
          </Button>
        </div>
      )}
    </div>
  );
}

function ValidationReport({ result }: { result: ValidationResult }) {
  const [showAllIssues, setShowAllIssues] = useState(false);
  const visibleIssues = showAllIssues
    ? result.issues
    : result.issues.slice(0, 5);

  const status = result.ok ? "ok" : "error";

  return (
    <div
      className={`rounded-lg border p-3 text-xs ${
        status === "ok"
          ? "border-green-200 bg-green-50"
          : "border-red-200 bg-red-50"
      }`}
    >
      <div className="flex items-center gap-2 font-semibold mb-2">
        {status === "ok" ? (
          <>
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span className="text-green-800">
              File looks good — {result.totalRows} row
              {result.totalRows === 1 ? "" : "s"} ready to import
            </span>
          </>
        ) : (
          <>
            <XCircle className="w-4 h-4 text-red-600" />
            <span className="text-red-800">
              Fix these issues before importing
            </span>
          </>
        )}
      </div>

      {/* Summary badges */}
      <div className="flex flex-wrap gap-1 mb-2">
        <Badge variant="secondary" className="text-[10px]">
          {result.totalRows} rows
        </Badge>
        <Badge
          variant="secondary"
          className="text-[10px] bg-green-100 text-green-800"
        >
          {result.validRows} valid
        </Badge>
        {result.issues.length > 0 && (
          <Badge className="text-[10px] bg-red-100 text-red-800 hover:bg-red-100">
            {result.issues.length} issues
          </Badge>
        )}
      </div>

      {/* Missing required columns */}
      {result.missingRequired.length > 0 && (
        <div className="mb-2 text-red-800">
          <strong>Missing required column(s):</strong>{" "}
          {result.missingRequired.join(", ")}
        </div>
      )}

      {/* Unknown columns */}
      {result.unknownColumns.length > 0 && (
        <div className="mb-2 text-amber-800">
          <strong>Ignored unknown column(s):</strong>{" "}
          {result.unknownColumns.join(", ")}
        </div>
      )}

      {/* Detected headers */}
      {result.headers.length > 0 && (
        <div className="mb-2 text-neutral-700">
          <strong>Detected columns:</strong> {result.headers.join(", ")}
        </div>
      )}

      {/* Issues table */}
      {result.issues.length > 0 && (
        <div className="mt-2 border-t border-red-200 pt-2">
          <div className="font-semibold text-red-800 mb-1">Row errors:</div>
          <div className="max-h-48 overflow-auto rounded border border-red-200 bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[10px] h-7">Row</TableHead>
                  <TableHead className="text-[10px] h-7">Column</TableHead>
                  <TableHead className="text-[10px] h-7">Problem</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleIssues.map((i, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="text-[11px] py-1">{i.row}</TableCell>
                    <TableCell className="text-[11px] py-1 font-mono">
                      {i.column ?? "—"}
                    </TableCell>
                    <TableCell className="text-[11px] py-1">
                      {i.message}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {result.issues.length > 5 && (
            <button
              type="button"
              onClick={() => setShowAllIssues((s) => !s)}
              className="mt-1 text-red-700 underline text-[11px]"
            >
              {showAllIssues
                ? "Show fewer"
                : `Show all ${result.issues.length} issues`}
            </button>
          )}
        </div>
      )}

      {/* Preview */}
      {result.preview.length > 0 && (
        <details className="mt-2">
          <summary className="cursor-pointer text-neutral-700 flex items-center gap-1">
            <Eye className="w-3 h-3" /> Preview first {result.preview.length}{" "}
            rows
          </summary>
          <div className="mt-1 overflow-auto rounded border border-neutral-200 bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[10px] h-7">#</TableHead>
                  {ALL_COLUMNS.map((c) => (
                    <TableHead key={c} className="text-[10px] h-7">
                      {c}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.preview.map((r, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="text-[11px] py-1">
                      {r.__rowNumber}
                    </TableCell>
                    {ALL_COLUMNS.map((c) => (
                      <TableCell key={c} className="text-[11px] py-1">
                        {String(r[c] ?? "")}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </details>
      )}
    </div>
  );
}
