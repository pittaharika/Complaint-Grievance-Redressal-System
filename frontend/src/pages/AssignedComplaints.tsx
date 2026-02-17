import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { complaintAPI } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { MessageSquare, Inbox } from "lucide-react";

export default function AssignedComplaints() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [response, setResponse] = useState("");
  const [status, setStatus] = useState("RESOLVED");

  const { data: complaints = [], isLoading } = useQuery({
    queryKey: ["assigned-complaints"],
    queryFn: async () => {
      const response = await complaintAPI.getAssigned();
      return response.data || [];
    },
    enabled: !!profile,
  });

  const respondMutation = useMutation({
    mutationFn: async ({ id, response, status }: { id: string; response: string; status: string }) => {
      await complaintAPI.respond(id, { response, status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assigned-complaints"] });
      toast({ title: "Response submitted!" });
      setResponse("");
    },
    onError: (err: any) => {
      toast({ title: "Failed", description: err.response?.data?.message || err.message, variant: "destructive" });
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Assigned Complaints</h1>
        <p className="text-muted-foreground mt-1">Respond to complaints assigned to you</p>
      </div>

      {complaints.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="text-center py-16">
            <Inbox className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
            <h3 className="text-lg font-medium">No assigned complaints</h3>
            <p className="text-muted-foreground text-sm mt-1">You're all caught up!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {complaints.map((c: any, i: number) => (
            <motion.div key={c._id || c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="glass-card hover:shadow-lg transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold">{c.subject}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{c.description}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <Badge variant="secondary" className="text-xs">{c.category}</Badge>
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
                          <p className="text-xs font-medium text-success">Your Response:</p>
                          <p className="text-sm mt-1">{c.response}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <StatusBadge status={c.status} />
                      {c.status !== "RESOLVED" && c.status !== "CLOSED" && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-xs">
                              <MessageSquare className="w-3 h-3 mr-1" /> Respond
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Respond to Complaint</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="p-3 rounded-lg bg-muted">
                                <p className="font-medium text-sm">{c.subject}</p>
                                <p className="text-sm text-muted-foreground mt-1">{c.description}</p>
                              </div>
                              <Textarea
                                placeholder="Type your response..."
                                value={response}
                                onChange={e => setResponse(e.target.value)}
                                rows={4}
                              />
                              <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                  <SelectItem value="RESOLVED">Resolved</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button
                                className="w-full"
                                onClick={() => respondMutation.mutate({ id: c._id || c.id, response, status })}
                                disabled={!response.trim()}
                              >
                                Submit Response
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
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

