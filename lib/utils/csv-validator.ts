// lib/utils/csv-validator.ts
import Papa from "papaparse";

export const REQUIRED_COLUMNS = ["name", "regNum"] as const;

export const OPTIONAL_COLUMNS = [
  "email",
  "mobile",
  "mciNumber",
  "address",
  "city",
  "state",
  "country",
  "reference",
  "note",
] as const;

export const ALL_COLUMNS = [...REQUIRED_COLUMNS, ...OPTIONAL_COLUMNS];

export interface ParsedRow {
  __rowNumber: number;
  [key: string]: string | number;
}

export interface ValidationIssue {
  row: number;
  column?: string;
  message: string;
}

export interface ValidationResult {
  ok: boolean;
  headers: string[];
  missingRequired: string[];
  unknownColumns: string[];
  duplicateRegNums: string[];
  emptyRegNumRows: number[];
  issues: ValidationIssue[];
  preview: ParsedRow[];
  totalRows: number;
  validRows: number;
}

export function parseAndValidate(
  file: File,
  existingRegNums: Set<string> = new Set(),
): Promise<ValidationResult> {
  return new Promise((resolve, reject) => {
    Papa.parse<ParsedRow>(file, {
      header: true,
      skipEmptyLines: "greedy",
      transformHeader: (h) => h.trim(),
      complete: (results) => {
        try {
          const rows = (results.data || []).filter(
            (r) => Object.keys(r).length > 0,
          );

          const headers = (results.meta.fields || []).map((h) => h.trim());
          const lower = headers.map((h) => h.toLowerCase());

          const missingRequired = REQUIRED_COLUMNS.filter(
            (c) => !lower.includes(c.toLowerCase()),
          );

          const unknownColumns = headers.filter(
            (h) =>
              !ALL_COLUMNS.some((c) => c.toLowerCase() === h.toLowerCase()),
          );

          const issues: ValidationIssue[] = [];
          const seen = new Map<string, number>();
          const duplicates = new Set<string>();
          const emptyRegNumRows: number[] = [];
          let validRows = 0;

          rows.forEach((row, idx) => {
            const rowNum = idx + 2; // +2 = header row + 0-index
            let rowOk = true;

            // required: name
            const name = String(row["name"] ?? "").trim();
            if (!name) {
              issues.push({
                row: rowNum,
                column: "name",
                message: "Name is required",
              });
              rowOk = false;
            }

            // required: regNum
            const regNum = String(row["regNum"] ?? "").trim();
            if (!regNum) {
              issues.push({
                row: rowNum,
                column: "regNum",
                message: "Registration number is required",
              });
              emptyRegNumRows.push(rowNum);
              rowOk = false;
            } else {
              const key = regNum.toLowerCase();
              if (seen.has(key)) {
                duplicates.add(regNum);
                issues.push({
                  row: rowNum,
                  column: "regNum",
                  message: `Duplicate regNum (also on row ${seen.get(key)})`,
                });
                rowOk = false;
              } else {
                seen.set(key, rowNum);
              }
              if (existingRegNums.has(key)) {
                issues.push({
                  row: rowNum,
                  column: "regNum",
                  message: "Already exists in this event",
                });
                rowOk = false;
              }
            }

            // email format (optional but validate if present)
            const email = String(row["email"] ?? "").trim();
            if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
              issues.push({
                row: rowNum,
                column: "email",
                message: "Invalid email format",
              });
              rowOk = false;
            }

            if (rowOk) validRows++;
          });

          resolve({
            ok:
              missingRequired.length === 0 &&
              issues.length === 0 &&
              rows.length > 0,
            headers,
            missingRequired,
            unknownColumns,
            duplicateRegNums: Array.from(duplicates),
            emptyRegNumRows,
            issues,
            preview: rows.slice(0, 5).map((r, i) => {
              const { __rowNumber: _ignoredRowNumber, ...rowData } =
                r as ParsedRow;
              return {
                __rowNumber: i + 2,
                ...rowData,
              };
            }),
            totalRows: rows.length,
            validRows,
          });
        } catch (e) {
          reject(e);
        }
      },
      error: (err) => reject(err),
    });
  });
}

export function buildTemplateCsv(): string {
  const header = ALL_COLUMNS.join(",");
  const sample = [
    "John Doe",
    "REG001",
    "john@example.com",
    "9876543210",
    "MCI12345",
    "123 Main St",
    "Mumbai",
    "Maharashtra",
    "India",
    "REF-A",
    "VIP guest",
  ].join(",");
  return `${header}\n${sample}\n`;
}

export function downloadTemplate() {
  const blob = new Blob([buildTemplateCsv()], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "onsitewala-users-template.csv";
  a.click();
  URL.revokeObjectURL(url);
}
