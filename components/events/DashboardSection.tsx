// components/events/DashboardSection.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
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
  Loader2,
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
import {
  dashboardApi,
  type DashboardStats,
  type RecentScan,
  type Event,
} from "@/lib/api";

const PALETTE = [
  "hsl(24 95% 53%)",
  "hsl(200 95% 45%)",
  "hsl(142 76% 36%)",
  "hsl(280 80% 50%)",
  "hsl(0 84% 60%)",
  "hsl(45 90% 50%)",
];

function shiftScanActivityToLocal(
  scanActivity: Array<{ hour: string; scans: number }>,
): Array<{ hour: string; scans: number }> {
  if (!scanActivity || scanActivity.length === 0) {
    return scanActivity ?? [];
  }

  const offsetHours = -new Date().getTimezoneOffset() / 60;
  const wholeOffset = Math.round(offsetHours);

  const buckets: number[] = new Array(24).fill(0);

  for (let i = 0; i < scanActivity.length; i++) {
    const row = scanActivity[i];
    const utcHour = Number(row.hour.slice(0, 2));
    const localHour = (utcHour + wholeOffset + 24) % 24;
    buckets[localHour] = buckets[localHour] + row.scans;
  }

  const result: Array<{ hour: string; scans: number }> = [];
  for (let h = 0; h < 24; h++) {
    result.push({
      hour: (h < 10 ? "0" : "") + h + ":00",
      scans: buckets[h],
    });
  }
  return result;
}

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

interface DashboardSectionProps {
  event: Event;
}

export function DashboardSection({ event }: DashboardSectionProps) {
  const { toast } = useToast();
  const eventStatus = getDaysRemaining(event.startDate, event.endDate);

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats["stats"] | null>(null);
  const [usersByType, setUsersByType] = useState<DashboardStats["usersByType"]>(
    [],
  );
  const [dayWisePrinted, setDayWisePrinted] = useState<
    DashboardStats["dayWisePrinted"]
  >([]);
  const [dayWiseTotal, setDayWiseTotal] = useState<
    DashboardStats["dayWiseTotal"]
  >([]);
  const [scanActivity, setScanActivity] = useState<
    DashboardStats["scanActivity"]
  >([]);
  const [scansByGroup, setScansByGroup] = useState<
    DashboardStats["scansByGroup"]
  >([]);
  const [dataQuality, setDataQuality] = useState<
    DashboardStats["dataQuality"] | null
  >(null);
  const [recentScans, setRecentScans] = useState<RecentScan[]>([]);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, scansRes] = await Promise.all([
        dashboardApi.getStats(event._id),
        dashboardApi.getRecentScans(event._id, 10),
      ]);
      setStats(statsRes.stats);
      setUsersByType(statsRes.usersByType);
      setDayWisePrinted(statsRes.dayWisePrinted);
      setDayWiseTotal(statsRes.dayWiseTotal);
      setScanActivity(statsRes.scanActivity);
      setScansByGroup(statsRes.scansByGroup);
      setDataQuality(statsRes.dataQuality);
      setRecentScans(scansRes);
    } catch (e: any) {
      toast({
        title: "Failed to load dashboard",
        description: e?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [event._id, toast]);

  const localScanActivity = shiftScanActivityToLocal(scanActivity);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleExport = () => {
    toast({
      title: "Export started",
      description: "Dashboard snapshot is being prepared...",
    });
  };

  const handleRefresh = async () => {
    await loadDashboard();
    toast({ title: "Refreshed", description: "Dashboard data updated" });
  };

  if (loading || !stats) {
    return (
      <div className="p-4 sm:p-6 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-orange-600 mx-auto mb-3" />
          <p className="text-sm text-neutral-500">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  const typeChartConfig = (() => {
    const cfg: ChartConfig = {};
    usersByType.forEach((t, i) => {
      cfg[t.type] = {
        label: t.type,
        color: PALETTE[i % PALETTE.length],
      };
    });
    return cfg;
  })();

  const printedVsNotPrinted = [
    {
      name: "Printed",
      value: stats.badgesPrinted,
      fill: "hsl(142 76% 36%)",
    },
    {
      name: "Not Printed",
      value: stats.badgesNotPrinted,
      fill: "hsl(0 84% 60%)",
    },
  ];

  const recentActivity = recentScans.slice(0, 5).map((s) => ({
    icon: QrCode,
    text: `Scan recorded: ${s.category} for ${s.regNum}`,
    time: new Date(s.scannedAt).toLocaleTimeString(),
    color: "text-orange-600",
  }));

  const dataQualityRows = dataQuality
    ? [
        {
          label: "Missing email",
          count: dataQuality.missingEmail,
          total: stats.totalAttendees,
        },
        {
          label: "Missing phone",
          count: dataQuality.missingPhone,
          total: stats.totalAttendees,
        },
        {
          label: "Missing IMC number",
          count: dataQuality.missingImc,
          total: stats.totalAttendees,
        },
      ]
    : [];

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
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
          {/* <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="h-9"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Export
          </Button> */}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="w-11 h-11 rounded-lg bg-green-50 flex items-center justify-center mb-3">
              <BadgeCheck className="w-5 h-5 text-green-600" />
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
            <div className="w-11 h-11 rounded-lg bg-orange-50 flex items-center justify-center mb-3">
              <Users className="w-5 h-5 text-orange-600" />
            </div>
            <div className="text-3xl font-bold text-neutral-900">
              {stats.totalAttendees.toLocaleString()}
            </div>
            <div className="text-sm text-neutral-500 mt-1">Total Attendees</div>
          </CardContent>
        </Card>
      </div>

      {/* Printed vs Not Printed + Users by Type */}
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

      {/* Day-wise Printed by Type */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Day-wise Printed by Type</CardTitle>
          <CardDescription className="text-xs">
            Each user type has its own color across all days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={typeChartConfig} className="w-full h-[320px]">
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

      {/* Day-wise Total Registrations by Type */}
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
          <ChartContainer config={typeChartConfig} className="w-full h-[320px]">
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

      {/* Scan Activity by Hour */}
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
            <AreaChart
              data={localScanActivity}
              margin={{ left: -20, right: 10 }}
            >
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

      {/* Category Coverage */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-neutral-900">
            Category Coverage
          </h2>
          <p className="text-sm text-neutral-500">
            % of attendees scanned per category
          </p>
        </div>

        {scansByGroup.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-sm text-neutral-500">
              No categories yet for this event.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {scansByGroup.map((group) => (
              <Card key={group.groupName}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <FolderTree className="w-4 h-4 text-orange-600" />
                    <CardTitle className="text-base">
                      {group.groupName}
                    </CardTitle>
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
                        const pct =
                          cat.total > 0
                            ? Math.round((cat.scanned / cat.total) * 100)
                            : 0;
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
                                <Progress
                                  value={pct}
                                  className="h-1.5 flex-1"
                                />
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
        )}
      </div>

      {/* Data Quality */}
      {/* <Card>
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
          {dataQualityRows.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-neutral-700">{item.label}</span>
              <div className="flex items-center gap-3">
                <span className="text-xs text-neutral-500">
                  {item.total > 0
                    ? Math.round((item.count / item.total) * 100)
                    : 0}
                  %
                </span>
                <Badge variant="outline" className="text-xs">
                  {item.count}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card> */}

      {/* Recent activity feed */}
      {recentActivity.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivity.map((a, i) => {
              const Icon = a.icon;
              return (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <Icon className={`w-4 h-4 ${a.color} flex-shrink-0`} />
                  <span className="flex-1 text-neutral-700 truncate">
                    {a.text}
                  </span>
                  <span className="text-xs text-neutral-400">{a.time}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
