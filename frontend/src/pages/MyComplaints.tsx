import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { complaintAPI } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

export default function MyComplaints() {
  const { profile } = useAuth();

  const { data: complaints = [], isLoading } = useQuery({
    queryKey: ["my-complaints"],
    queryFn: async () => {
      const response = await complaintAPI.getMy();
      return response.data || [];
    },
    enabled: !!profile,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Complaints</h1>
        <p className="text-muted-foreground mt-1">Track all your submitted complaints</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : complaints.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="text-center py-16">
            <FileText className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
            <h3 className="text-lg font-medium">No complaints yet</h3>
            <p className="text-muted-foreground text-sm mt-1">Submit your first complaint to get started</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {complaints.map((c: any, i: number) => (
            <motion.div
              key={c._id || c.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="glass-card hover:shadow-lg transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-sm">{c.subject}</h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{c.description}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <Badge variant="secondary" className="text-xs">{c.category}</Badge>
                        <Badge variant="outline" className="text-xs">{c.target}</Badge>
                        {c.duplicateCount > 0 && (
                          <Badge variant={c.duplicateCount >= 3 ? "destructive" : "secondary"} className="text-xs">
                            {c.duplicateCount} Duplicate{c.duplicateCount > 1 ? "s" : ""}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(c.createdAt || c.created_at), "MMM d, yyyy")}
                        </span>
                      </div>
                      {c.response && (
                        <div className="mt-3 p-3 rounded-lg bg-success/5 border border-success/10">
                          <p className="text-xs font-medium text-success">Response:</p>
                          <p className="text-sm mt-1">{c.response}</p>
                        </div>
                      )}
                    </div>
                    <StatusBadge status={c.status} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

