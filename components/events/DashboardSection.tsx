// components/events/DashboardSection.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Users,
  BadgeCheck,
  BadgeX,
  Percent,
  FolderTree,
  AlertTriangle,
  Clock,
  QrCode,
  Printer,
  Download,
  RefreshCw,
  Info,
  CheckCircle2,
  UserPlus,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import type { Event } from "@/lib/api";

// ============================================
// MOCK DATA — to be replaced by API later
// ============================================

const stats = {
  totalAttendees: 1248,
  badgesPrinted: 432,
  badgesNotPrinted: 816,
  printCoverage: 35,
  scansToday: 890,
  scansTotal: 2134,
  categories: 156,
  reprints: 12,
  failedPrints: 3,
  duplicates: 7,
};

const printedVsNotPrinted = [
  { name: "Printed", value: stats.badgesPrinted, fill: "hsl(142 76% 36%)" },
  {
    name: "Not Printed",
    value: stats.badgesNotPrinted,
    fill: "hsl(0 84% 60%)",
  },
];

const usersByType = [
  { type: "Delegate", total: 520, printed: 210, color: "hsl(24 95% 53%)" },
  { type: "Faculty", total: 180, printed: 82, color: "hsl(200 95% 45%)" },
  { type: "Student", total: 340, printed: 95, color: "hsl(142 76% 36%)" },
  { type: "Sponsor", total: 96, printed: 30, color: "hsl(280 80% 50%)" },
  { type: "Guest", total: 112, printed: 15, color: "hsl(0 84% 60%)" },
];

const dayWisePrinted = [
  {
    day: "Day 1",
    Delegate: 45,
    Faculty: 22,
    Student: 12,
    Sponsor: 5,
    Guest: 3,
  },
  {
    day: "Day 2",
    Delegate: 68,
    Faculty: 30,
    Student: 28,
    Sponsor: 10,
    Guest: 4,
  },
  {
    day: "Day 3",
    Delegate: 60,
    Faculty: 20,
    Student: 40,
    Sponsor: 12,
    Guest: 6,
  },
  {
    day: "Day 4",
    Delegate: 37,
    Faculty: 10,
    Student: 15,
    Sponsor: 3,
    Guest: 2,
  },
];

const dayWiseTotal = [
  {
    day: "Day 1",
    Delegate: 120,
    Faculty: 40,
    Student: 80,
    Sponsor: 20,
    Guest: 15,
  },
  {
    day: "Day 2",
    Delegate: 150,
    Faculty: 45,
    Student: 95,
    Sponsor: 25,
    Guest: 20,
  },
  {
    day: "Day 3",
    Delegate: 140,
    Faculty: 50,
    Student: 100,
    Sponsor: 30,
    Guest: 22,
  },
  {
    day: "Day 4",
    Delegate: 110,
    Faculty: 45,
    Student: 65,
    Sponsor: 21,
    Guest: 55,
  },
];

const scansByGroup = [
  {
    groupName: "Food Scan",
    categories: [
      { categoryName: "Breakfast - 13/09/2026", scanned: 79, total: 120 },
      { categoryName: "DINNER - 12/09/2026", scanned: 293, total: 340 },
      { categoryName: "FACULTY LUNCH - 12/09/2026", scanned: 18, total: 45 },
      { categoryName: "GALA DINNER - 12/09/2026", scanned: 272, total: 350 },
      { categoryName: "LUNCH - 12/09/2026", scanned: 452, total: 500 },
      { categoryName: "LUNCH - 13/09/2026", scanned: 354, total: 400 },
    ],
  },
  {
    groupName: "Gift",
    categories: [{ categoryName: "KIT", scanned: 462, total: 600 }],
  },
  {
    groupName: "Certificate",
    categories: [{ categoryName: "Certificate", scanned: 380, total: 500 }],
  },
];

// Scan activity by hour (today)
const scanActivity = [
  { hour: "08:00", scans: 12 },
  { hour: "09:00", scans: 45 },
  { hour: "10:00", scans: 98 },
  { hour: "11:00", scans: 156 },
  { hour: "12:00", scans: 142 },
  { hour: "13:00", scans: 88 },
  { hour: "14:00", scans: 105 },
  { hour: "15:00", scans: 76 },
  { hour: "16:00", scans: 54 },
  { hour: "17:00", scans: 32 },
  { hour: "18:00", scans: 12 },
];

// Top operators/desks
const topOperators = [
  { name: "Desk A - Priya", scans: 245 },
  { name: "Desk B - Amit", scans: 210 },
  { name: "Desk C - Rohan", scans: 178 },
  { name: "Desk D - Sneha", scans: 156 },
  { name: "Desk E - Vikram", scans: 101 },
];

// Live scan feed
const recentScans = [
  {
    regNo: "SPOT-0041",
    name: "Dr. Saivardhan Reddy",
    category: "LUNCH - 12/09/2026",
    time: "2 min ago",
  },
  {
    regNo: "REG-0120",
    name: "Dr. Poorna Royal",
    category: "KIT",
    time: "4 min ago",
  },
  {
    regNo: "SPOT-0039",
    name: "Dr. Sambaraju Sindhu",
    category: "GALA DINNER",
    time: "7 min ago",
  },
  {
    regNo: "REG-0345",
    name: "Dr. Sai Sujala Neela",
    category: "Breakfast",
    time: "11 min ago",
  },
  {
    regNo: "SPOT-0038",
    name: "Dr. Shaistha Zoha",
    category: "FACULTY LUNCH",
    time: "14 min ago",
  },
];

// Recent activity feed
const recentActivity = [
  {
    icon: UserPlus,
    text: "12 attendees imported via CSV",
    time: "3 min ago",
    color: "text-blue-600",
  },
  {
    icon: Printer,
    text: "Badge printed for SPOT-0041",
    time: "5 min ago",
    color: "text-green-600",
  },
  {
    icon: QrCode,
    text: "Scan recorded: KIT for REG-0120",
    time: "7 min ago",
    color: "text-orange-600",
  },
  {
    icon: AlertTriangle,
    text: "3 failed prints detected",
    time: "15 min ago",
    color: "text-red-600",
  },
  {
    icon: CheckCircle2,
    text: "Category 'Breakfast' added",
    time: "1 hr ago",
    color: "text-green-600",
  },
];

const PALETTE = [
  "hsl(24 95% 53%)",
  "hsl(200 95% 45%)",
  "hsl(142 76% 36%)",
  "hsl(280 80% 50%)",
  "hsl(0 84% 60%)",
  "hsl(45 90% 50%)",
];

const printedVsNotConfig = {
  printed: { label: "Printed", color: "hsl(142 76% 36%)" },
  notPrinted: { label: "Not Printed", color: "hsl(0 84% 60%)" },
} satisfies ChartConfig;

const typeBarConfig = {
  total: { label: "Total", color: "hsl(24 95% 53%)" },
  printed: { label: "Printed", color: "hsl(142 76% 36%)" },
} satisfies ChartConfig;

const scanActivityConfig = {
  scans: { label: "Scans", color: "hsl(24 95% 53%)" },
} satisfies ChartConfig;

// ============================================
// Helpers
// ============================================

function getDaysRemaining(startDate: string, endDate: string) {
  const today = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  const dayOfEvent =
    Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const totalDays =
    Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  if (today < start) return { status: "upcoming", dayOfEvent: 0, totalDays };
  if (today > end) return { status: "past", dayOfEvent: totalDays, totalDays };
  return { status: "live", dayOfEvent, totalDays };
}

// ============================================
// Component
// ============================================

interface DashboardSectionProps {
  event: Event;
}

export function DashboardSection({ event }: DashboardSectionProps) {
  const { toast } = useToast();
  const [isLive, setIsLive] = useState(true);
  const eventStatus = getDaysRemaining(event.startDate, event.endDate);

  // Live clock simulation
  useEffect(() => {
    const t = setInterval(() => setIsLive((p) => !p), 5000);
    return () => clearInterval(t);
  }, []);

  const handleExport = () => {
    toast({
      title: "Export started",
      description: "Dashboard snapshot is being prepared...",
    });
    // window.print() or html2canvas later
  };

  const handleRefresh = () => {
    toast({ title: "Refreshed", description: "Dashboard data updated" });
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* ============================================ */}
      {/* Header with live status + actions */}
      {/* ============================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-neutral-900">Dashboard</h1>
            {eventStatus.status === "live" && (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                LIVE
              </span>
            )}
            {eventStatus.status === "upcoming" && (
              <Badge variant="outline" className="text-[11px]">
                Upcoming
              </Badge>
            )}
            {eventStatus.status === "past" && (
              <Badge variant="outline" className="text-[11px]">
                Past
              </Badge>
            )}
          </div>
          <p className="text-sm text-neutral-500 mt-1">
            {event.eventName}
            {eventStatus.status === "live" && (
              <>
                {" • "}
                <span className="font-medium text-neutral-700">
                  Day {eventStatus.dayOfEvent} of {eventStatus.totalDays}
                </span>
              </>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="h-9"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="h-9"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Export
          </Button>
        </div>
      </div>

      {/* ============================================ */}
      {/* Top Stat Cards — 6 KPI tiles */}
      {/* ============================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-11 h-11 rounded-lg bg-green-50 flex items-center justify-center">
                <BadgeCheck className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-[10px] font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                +12 today
              </span>
            </div>
            <div className="text-3xl font-bold text-neutral-900">
              {stats.badgesPrinted.toLocaleString()}
            </div>
            <div className="text-sm text-neutral-500 mt-1">Badges Printed</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="w-11 h-11 rounded-lg bg-red-50 flex items-center justify-center mb-3">
              <BadgeX className="w-5 h-5 text-red-600" />
            </div>
            <div className="text-3xl font-bold text-neutral-900">
              {stats.badgesNotPrinted.toLocaleString()}
            </div>
            <div className="text-sm text-neutral-500 mt-1">
              Badges Not Printed
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="w-11 h-11 rounded-lg bg-blue-50 flex items-center justify-center mb-3">
              <Percent className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-neutral-900">
              {stats.printCoverage}%
            </div>
            <div className="text-sm text-neutral-500 mt-1 mb-2">
              Print Coverage
            </div>
            <Progress value={stats.printCoverage} className="h-1.5" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-11 h-11 rounded-lg bg-orange-50 flex items-center justify-center">
                <Users className="w-5 h-5 text-orange-600" />
              </div>
              <span className="text-[10px] font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                {stats.totalAttendees.toLocaleString()}
              </span>
            </div>
            <div className="text-3xl font-bold text-neutral-900">
              {stats.totalAttendees.toLocaleString()}
            </div>
            <div className="text-sm text-neutral-500 mt-1">Total Attendees</div>
          </CardContent>
        </Card>
      </div>

      {/* ============================================ */}
      {/* Printed vs Not Printed + Users by Type */}
      {/* ============================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Printed vs Not Printed</CardTitle>
            <CardDescription className="text-xs">
              Badge printing status across all attendees
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={printedVsNotConfig}
              className="mx-auto aspect-square max-h-[280px]"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={printedVsNotPrinted}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  strokeWidth={5}
                >
                  {printedVsNotPrinted.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartLegend
                  content={<ChartLegendContent nameKey="name" />}
                  className="-translate-y-2 flex-wrap gap-2"
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Users by Type (Total vs Printed)
            </CardTitle>
            <CardDescription className="text-xs">
              Registration count and printed badges per user type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={typeBarConfig}
              className="mx-auto aspect-square max-h-[280px]"
            >
              <BarChart data={usersByType} margin={{ left: -20 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="type"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent />}
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="total" fill="var(--color-total)" radius={4} />
                <Bar dataKey="printed" fill="var(--color-printed)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* ============================================ */}
      {/* Day-wise Printed by Type */}
      {/* ============================================ */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Day-wise Printed by Type</CardTitle>
          <CardDescription className="text-xs">
            Each user type has its own color across all days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={(() => {
              const cfg: ChartConfig = {};
              usersByType.forEach((t, i) => {
                cfg[t.type] = {
                  label: t.type,
                  color: PALETTE[i % PALETTE.length],
                };
              });
              return cfg;
            })()}
            className="w-full h-[320px]"
          >
            <LineChart data={dayWisePrinted} margin={{ left: -20, right: 10 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11 }}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              {usersByType.map((t, i) => (
                <Line
                  key={t.type}
                  type="monotone"
                  dataKey={t.type}
                  stroke={PALETTE[i % PALETTE.length]}
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* ============================================ */}
      {/* Day-wise Total Registrations by Type */}
      {/* ============================================ */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Day-wise Total Registrations by Type
          </CardTitle>
          <CardDescription className="text-xs">
            Stacked view of registrations per user type across days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={(() => {
              const cfg: ChartConfig = {};
              usersByType.forEach((t, i) => {
                cfg[t.type] = {
                  label: t.type,
                  color: PALETTE[i % PALETTE.length],
                };
              });
              return cfg;
            })()}
            className="w-full h-[320px]"
          >
            <BarChart data={dayWiseTotal} margin={{ left: -20, right: 10 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11 }}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              {usersByType.map((t, i) => (
                <Bar
                  key={t.type}
                  dataKey={t.type}
                  stackId="total"
                  fill={PALETTE[i % PALETTE.length]}
                  radius={
                    i === usersByType.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]
                  }
                />
              ))}
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* ============================================ */}
      {/* Scan Activity by Hour */}
      {/* ============================================ */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-4 h-4 text-orange-600" />
            Scan Activity (Today)
          </CardTitle>
          <CardDescription className="text-xs">
            Scan count per hour — spot peak hours and slow periods
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={scanActivityConfig}
            className="w-full h-[220px]"
          >
            <AreaChart data={scanActivity} margin={{ left: -20, right: 10 }}>
              <defs>
                <linearGradient id="scanGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(24 95% 53%)"
                    stopOpacity={0.4}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(24 95% 53%)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="hour"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11 }}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="scans"
                stroke="hsl(24 95% 53%)"
                strokeWidth={2}
                fill="url(#scanGradient)"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* ============================================ */}
      {/* Category Coverage */}
      {/* ============================================ */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-neutral-900">
            Category Coverage
          </h2>
          <p className="text-sm text-neutral-500">
            % of attendees scanned per category
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {scansByGroup.map((group) => (
            <Card key={group.groupName}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <FolderTree className="w-4 h-4 text-orange-600" />
                  <CardTitle className="text-base">{group.groupName}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-neutral-50">
                      <TableHead className="text-xs">Category</TableHead>
                      <TableHead className="text-xs text-right">
                        Scanned
                      </TableHead>
                      <TableHead className="text-xs w-[120px]">
                        Coverage
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {group.categories.map((cat) => {
                      const pct = Math.round((cat.scanned / cat.total) * 100);
                      return (
                        <TableRow key={cat.categoryName}>
                          <TableCell className="text-sm">
                            {cat.categoryName}
                          </TableCell>
                          <TableCell className="text-right text-sm">
                            <span className="font-medium text-neutral-900">
                              {cat.scanned}
                            </span>
                            <span className="text-neutral-400">
                              /{cat.total}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={pct} className="h-1.5 flex-1" />
                              <span className="text-xs font-medium text-neutral-600 w-8 text-right">
                                {pct}%
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* ============================================ */}
      {/* Data Quality Alerts */}
      {/* ============================================ */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Info className="w-4 h-4 text-orange-600" />
            Data Quality
          </CardTitle>
          <CardDescription className="text-xs">
            Attendees with incomplete information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { label: "Missing email", count: 45, total: stats.totalAttendees },
            { label: "Missing phone", count: 28, total: stats.totalAttendees },
            {
              label: "Missing IMC number",
              count: 156,
              total: stats.totalAttendees,
            },
            {
              label: "Duplicate registration numbers",
              count: 3,
              total: stats.totalAttendees,
            },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-neutral-700">{item.label}</span>
              <div className="flex items-center gap-3">
                <span className="text-xs text-neutral-500">
                  {Math.round((item.count / item.total) * 100)}%
                </span>
                <Badge variant="outline" className="text-xs">
                  {item.count}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
