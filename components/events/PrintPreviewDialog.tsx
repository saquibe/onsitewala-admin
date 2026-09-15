// components/events/PrintPreviewDialog.tsx
"use client";

import { useEffect, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Printer, X, Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { PrintUser } from "./types";

interface PrintPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: PrintUser | null;
  onConfirmPrint?: (userId: string) => void;
}

export function PrintPreviewDialog({
  open,
  onOpenChange,
  user,
  onConfirmPrint,
}: PrintPreviewDialogProps) {
  const printAreaRef = useRef<HTMLDivElement>(null);

  // Trigger the actual browser print
  const handlePrint = () => {
    if (!user) return;

    // Mark as printed in parent state
    onConfirmPrint?.(user.id);

    // Use browser print (later you'll send to a physical printer via API)
    const printContents = printAreaRef.current?.innerHTML;
    if (printContents) {
      const originalContents = document.body.innerHTML;
      const printWindow = window.open("", "", "width=800,height=600");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Badge - ${user.registrationNo}</title>
              <style>
                body {
                  font-family: system-ui, sans-serif;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  min-height: 100vh;
                  margin: 0;
                  padding: 20px;
                  background: white;
                }
                .badge-wrapper {
                  width: 4in;
                  height: 3in;
                  border: 2px solid #000;
                  border-radius: 12px;
                  padding: 16px;
                  box-sizing: border-box;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: space-between;
                  background: white;
                }
                .badge-event {
                  font-size: 11px;
                  font-weight: 600;
                  color: #ea580c;
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
                  text-align: center;
                }
                .badge-name {
                  font-size: 22px;
                  font-weight: 700;
                  color: #111;
                  text-align: center;
                  line-height: 1.2;
                  margin: 8px 0;
                  word-break: break-word;
                }
                .badge-type {
                  font-size: 12px;
                  color: #666;
                  text-transform: uppercase;
                  letter-spacing: 1px;
                  font-weight: 500;
                }
                .badge-qr {
                  margin-top: 8px;
                }
                .badge-regno {
                  font-size: 12px;
                  font-family: monospace;
                  font-weight: 600;
                  color: #111;
                  margin-top: 4px;
                }
                @media print {
                  body { padding: 0; }
                  .no-print { display: none !important; }
                }
              </style>
            </head>
            <body onload="window.print();window.close();">
              <div class="badge-wrapper">
                <div class="badge-name">${user.fullName}</div>
                <div class="badge-type">${user.userTypeName}</div>
                <div class="badge-qr">${printAreaRef.current?.querySelector("svg")?.outerHTML || ""}</div>
                <div class="badge-regno">${user.registrationNo}</div>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }

    setTimeout(() => onOpenChange(false), 300);
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-orange-600" />
            Print Badge
          </DialogTitle>
        </DialogHeader>

        {/* Badge Preview */}
        <div className="flex justify-center py-4 bg-neutral-50 rounded-lg">
          <div
            ref={printAreaRef}
            className="bg-white border-neutral-900 rounded-xl p-4 w-[340px] h-[255px] flex flex-col items-center shadow-sm"
          >
            {/* Full Name */}
            <div className="text-xl font-bold text-neutral-900 text-center leading-tight px-2 line-clamp-2">
              {user.fullName}
            </div>

            {/* QR Code — only reg no is encoded */}
            <div className="bg-white p-1 rounded mt-3">
              <QRCodeSVG
                value={user.registrationNo}
                size={90}
                level="M"
                includeMargin={false}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto h-10"
          >
            <X className="w-4 h-4 mr-1.5" /> Cancel
          </Button>
          <Button
            onClick={handlePrint}
            className="bg-orange-600 hover:bg-orange-700 text-white w-full sm:w-auto h-10"
          >
            <Printer className="w-4 h-4 mr-1.5" /> Print Badge
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
