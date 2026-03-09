import { useQuery } from "@tanstack/react-query";
import { complaintAPI } from "@/lib/api";
import { KPICard } from "@/components/KPICard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText, CheckCircle, Clock, AlertTriangle, TrendingUp, Filter, Download } from "lucide-react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, CartesianGrid, Legend
} from "recharts";
import { format, subDays, startOfDay, endOfDay, isWithinInterval } from "date-fns";

// Elegant Color Palette
const COLORS = [
  "hsl(239, 84%, 67%)", // Primary
  "hsl(160, 84%, 39%)", // Success
  "hsl(38, 92%, 50%)",  // Warning
  "hsl(0, 84%, 60%)",   // Destructive
  "hsl(280, 50%, 50%)", // Purple
  "hsl(200, 90%, 50%)", // Blue
];

const CUSTOM_TOOLTIP_STYLE = {
  backgroundColor: "rgba(255, 255, 255, 0.9)",
  borderRadius: "12px",
  border: "none",
  boxShadow: "0 10px 40px -10px rgba(0,0,0,0.2)",
  padding: "12px",
  color: "#1a1a1a"
};

export default function Analytics() {
  const { data: complaints = [], isLoading } = useQuery({
    queryKey: ["analytics-complaints"],
    queryFn: async () => {
      const response = await complaintAPI.getAll();
      return response.data || [];
    },
    refetchInterval: 5000, // Poll every 5 seconds for "real-time" updates
  });

  // Calculate Stats
  const total = complaints.length;
  const resolved = complaints.filter((c: any) => c.status === "RESOLVED").length;
  const inProgress = complaints.filter((c: any) => c.status === "IN_PROGRESS").length;
  const escalated = complaints.filter((c: any) => c.statusEscalated || c.escalated || c.status === "ESCALATED").length;
  const pending = complaints.filter((c: any) => c.status === "PENDING").length;

  const resolvedRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  // Chart Data Preparation
  const statusData = [
    { name: "Pending", value: pending, color: COLORS[4] },
    { name: "In Progress", value: inProgress, color: COLORS[5] },
    { name: "Resolved", value: resolved, color: COLORS[1] },
    { name: "Escalated", value: escalated, color: COLORS[3] },
    { name: "Closed", value: complaints.filter((c: any) => c.status === "CLOSED").length, color: COLORS[2] },
  ].filter(d => d.value > 0);

  const categoryData = ["Academic", "Infrastructure", "Placement", "Hostel", "Library", "Other"]
    .map(c => ({
      name: c,
      count: complaints.filter((x: any) => x.category === c).length
    }))
    .filter(d => d.count > 0)
    .sort((a, b) => b.count - a.count); // Sort by count desc

  // Weekly Trend Aggregation (Real Data)
  const getWeeklyTrend = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = subDays(new Date(), 6 - i);
      return {
        date: d,
        name: format(d, 'EEE'), // Mon, Tue, etc.
        complaints: 0
      };
    });

    // Populate counts
    complaints.forEach((c: any) => {
      const date = new Date(c.createdAt);
      const dayStat = last7Days.find(d =>
        isWithinInterval(date, { start: startOfDay(d.date), end: endOfDay(d.date) })
      );
      if (dayStat) {
        dayStat.complaints += 1;
      }
    });

    return last7Days.map(({ name, complaints }) => ({ name, complaints }));
  };

  const trendData = getWeeklyTrend();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="space-y-8 p-1 sm:p-4 max-w-[1600px] mx-auto">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4"
      >
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-blue-600 pb-2">
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground text-lg">
            Real-time insights and performance metrics
          </p>
        </div>
        {/* <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="w-4 h-4" /> Filter
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" /> Export
          </Button>
        </div> */}
      </motion.div>

      {/* KPI Cards Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <KPICard
          title="Total Complaints"
          value={total}
          icon={FileText}
          subtitle="All time received"
          featured={true}
        />
        <KPICard
          title="Resolution Rate"
          value={`${resolvedRate}%`}
          icon={CheckCircle}
          subtitle={`${resolved} resolved issues`}
          featured={true}
        />
        <KPICard
          title="Active Issues"
          value={inProgress + pending}
          icon={Clock}
          subtitle={`${escalated} escalated`}
          featured={true}
        />
        <KPICard
          title="Avg. Response Time"
          value="24h"
          icon={TrendingUp}
          featured={true}
          subtitle="Target: < 48h"
        />
      </motion.div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">

        {/* Main Chart - Category Distribution */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-4"
        >
          <Card className="h-full border-0 shadow-xl bg-card/40 backdrop-blur-md ring-1 ring-white/10">
            <CardHeader>
              <CardTitle>Complaint Categories</CardTitle>
              <CardDescription>Distribution of issues by department</CardDescription>
            </CardHeader>
            <CardContent>
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={categoryData} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.1} />
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="name"
                      type="category"
                      tick={{ fill: 'currentColor', fontSize: 12 }}
                      width={100}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      contentStyle={{ ...CUSTOM_TOOLTIP_STYLE, backgroundColor: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))', border: '1px solid hsl(var(--border))' }}
                    />
                    <Bar
                      dataKey="count"
                      fill="url(#colorGradient)"
                      radius={[0, 4, 4, 0]}
                      barSize={30}
                      animationDuration={1500}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[350px] flex flex-col items-center justify-center text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-muted">
                  <FileText className="w-12 h-12 mb-4 opacity-50" />
                  <p>No category data available yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Secondary Chart - Status Donut */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="lg:col-span-3"
        >
          <Card className="h-full border-0 shadow-xl bg-card/40 backdrop-blur-md ring-1 ring-white/10">
            <CardHeader>
              <CardTitle>Status Overview</CardTitle>
              <CardDescription>Current state of all tickets</CardDescription>
            </CardHeader>
            <CardContent>
              {statusData.length > 0 ? (
                <div className="relative h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={110}
                        paddingAngle={5}
                        dataKey="value"
                        cornerRadius={6}
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ ...CUSTOM_TOOLTIP_STYLE, backgroundColor: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))', border: '1px solid hsl(var(--border))' }}
                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        iconType="circle"
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center Text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-bold">{total}</span>
                    <span className="text-xs text-muted-foreground uppercase tracking-widest">Total</span>
                  </div>
                </div>
              ) : (
                <div className="h-[350px] flex flex-col items-center justify-center text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-muted">
                  <TrendingUp className="w-12 h-12 mb-4 opacity-50" />
                  <p>No status data available yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Weekly Trend Area Chart (Real Data) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-0 shadow-xl bg-card/40 backdrop-blur-md ring-1 ring-white/10">
          <CardHeader>
            <CardTitle>Activity Trend</CardTitle>
            <CardDescription>Complaints received over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorComplaints" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'currentColor', opacity: 0.7 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'currentColor', opacity: 0.7 }} />
                  <Tooltip
                    contentStyle={{ ...CUSTOM_TOOLTIP_STYLE, backgroundColor: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))', border: '1px solid hsl(var(--border))' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="complaints"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorComplaints)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
