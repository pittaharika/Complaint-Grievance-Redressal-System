import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { complaintAPI, userAPI } from "@/lib/api";
import { KPICard } from "@/components/KPICard";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function DashboardHome() {
  const { profile } = useAuth();
  const role = profile?.role;

  const { data: complaints = [] } = useQuery({
    queryKey: ["complaints", role],
    queryFn: async () => {
      let response;
      if (role === "ADMIN") {
        // Updated to fetch aggregated stats including duplicates
        try {
          const statsResponse = await userAPI.getDashboardStats();
          return statsResponse.data || { stats: {}, recentComplaints: [] };
        } catch (e) {
          console.error("Failed to fetch dashboard stats", e);
          // Fallback to old method if endpoint fails
          const fallbackCmd = await complaintAPI.getAll();
          return fallbackCmd.data || [];
        }
      } else if (role === "STUDENT") {
        response = await complaintAPI.getMy();
      } else {
        response = await complaintAPI.getAssigned();
      }
      return response.data || [];
    },
    enabled: !!profile,
  });

  // Handle different data structures (Admin gets object with stats, others get array)
  const isStatsObject = role === "ADMIN" && complaints.stats;

  const total = isStatsObject ? complaints.stats.total : complaints.length;
  const resolved = isStatsObject ? complaints.stats.resolved : complaints.filter((c: any) => c.status === "RESOLVED").length;
  const inProgress = isStatsObject ? complaints.stats.inProgress : complaints.filter((c: any) => c.status === "IN_PROGRESS").length;
  const escalated = isStatsObject ? complaints.stats.escalated : complaints.filter((c: any) => c.status === "ESCALATED").length;

  const resolvedRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  const recentComplaints = isStatsObject ? complaints.recentComplaints : complaints.slice(0, 5);

  return (
    <div className="space-y-8 p-1 sm:p-4 max-w-[1600px] mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-blue-600 pb-2">
          {role === "ADMIN" ? "Admin Overview" : `Welcome, ${profile?.name}`}
        </h1>
        <p className="text-muted-foreground mt-1 text-lg">
          {role === "ADMIN"
            ? "Monitor and manage all complaints across departments"
            : role === "STUDENT"
              ? "Track your complaints and submit new ones"
              : "Manage complaints assigned to you"}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Complaints" value={total} icon={FileText} delay={0} featured={true} />
        <KPICard title="Resolved" value={`${resolvedRate}%`} subtitle={`${resolved} complaints`} icon={CheckCircle} delay={0.1} featured={true} />
        <KPICard title="In Progress" value={inProgress} icon={Clock} delay={0.2} featured={true} />
        <KPICard title="Escalated" value={escalated} icon={AlertTriangle} delay={0.3} featured={true} />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Recent Complaints</CardTitle>
          </CardHeader>
          <CardContent>
            {recentComplaints.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">No complaints yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentComplaints.map((c: any) => (
                  <div key={c._id || c.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{c.subject}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {c.category} • {format(new Date(c.createdAt || c.created_at), "MMM d, yyyy")}
                      </p>
                    </div>
                    <StatusBadge status={c.status} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

