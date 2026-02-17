import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { complaintAPI, userAPI } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { UserPlus, Eye, Clock, Calendar, User, AlertCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function AllComplaints() {
  const queryClient = useQueryClient();
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const { data: complaints = [], isLoading } = useQuery({
    queryKey: ["all-complaints"],
    queryFn: async () => {
      const response = await complaintAPI.getAll();
      return response.data || [];
    },
  });

  const { data: staff = [] } = useQuery({
    queryKey: ["staff-profiles"],
    queryFn: async () => {
      try {
        const response = await userAPI.getStaff();
        return response.data || [];
      } catch (e) {
        console.error("Failed to fetch staff:", e);
        return [];
      }
    },
  });

  const assignMutation = useMutation({
    mutationFn: async ({ complaintId, assignedTo }: { complaintId: string; assignedTo: string }) => {
      await complaintAPI.assign({ complaintId, assignedToId: assignedTo });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-complaints"] });
      toast({ title: "Complaint assigned successfully" });
    },
    onError: (err: any) => {
      toast({ title: "Assignment failed", description: err.response?.data?.message || err.message, variant: "destructive" });
    },
  });

  return (
    <div className="space-y-8 p-1 sm:p-4 max-w-[1600px] mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-blue-600 pb-2">
          All Complaints
        </h1>
        <p className="text-muted-foreground text-lg">
          Overview and management of all student grievances
        </p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {complaints.map((c: any, i: number) => (
          <motion.div
            key={c._id || c.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex"
          >
            <Card className="flex flex-col w-full border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-card/50 backdrop-blur-sm group overflow-hidden">
              {/* Decorative top border */}
              <div className={`h-1 w-full ${c.priority === 'HIGH' || c.status === 'ESCALATED' ? 'bg-destructive' : 'bg-primary/50'}`} />

              <CardHeader className="pb-3 space-y-3">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <Badge variant="outline" className="mb-1 text-xs uppercase tracking-wider font-semibold opacity-70">
                      Category : {c.category}
                    </Badge>
                    <h3 className="font-bold text-lg leading-tight line-clamp-1" title={c.subject}>
                      {c.subject}
                    </h3>
                  </div>
                  <div className="shrink-0">
                    <StatusBadge status={c.status} />
                  </div>
                </div>
                {c.duplicateCount > 0 && (
                  <div className="flex items-center gap-2 text-destructive text-xs font-medium bg-destructive/10 p-2 rounded-md">
                    <AlertCircle className="w-4 h-4" />
                    <span>{c.duplicateCount} Duplicate Complaint{c.duplicateCount > 1 ? 's' : ''} detected</span>
                  </div>
                )}
              </CardHeader>

              <CardContent className="flex-1 pb-4">
                <p className="text-muted-foreground text-sm line-clamp-3 mb-4 leading-relaxed">
                  {c.description}
                </p>

                <Separator className="my-3 opacity-50" />

                <div className="grid grid-cols-2 gap-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5" />
                    <span className="truncate max-w-[120px]" title={c.studentId?.name || "Student"}>
                      {c.studentId?.name || "Unknown Student"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{format(new Date(c.createdAt || c.created_at), "MMM d, yyyy")}</span>
                  </div>
                  <div className="flex items-center gap-2 col-span-2">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Priority: <span className={`font-medium ${c.priority === 'HIGH' ? 'text-destructive' : ''}`}>{c.priority || 'NORMAL'}</span></span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-0 gap-3">
                <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => { setSelectedComplaint(c); setViewDialogOpen(true); }}
                    >
                      <Eye className="w-4 h-4 mr-2" /> View Details
                    </Button>
                  </DialogTrigger>
                  {/* We reuse the same dialog content structure for simplicity, populated by state */}
                  {selectedComplaint && selectedComplaint._id === c._id && (
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="text-xl">{c.subject}</DialogTitle>
                        <div className="flex gap-2 mt-2">
                          <Badge>{c.category}</Badge>
                          <StatusBadge status={c.status} />
                        </div>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div>
                          <h4 className="font-medium mb-1 text-sm text-muted-foreground uppercase">Description</h4>
                          <p className="bg-muted/30 p-3 rounded-md text-sm leading-relaxed">{c.description}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium mb-1 text-sm text-muted-foreground uppercase">Submitted By</h4>
                            <p className="font-medium">{c.studentId?.name}</p>
                            <p className="text-xs text-muted-foreground">{c.studentId?.email}</p>
                          </div>
                          <div>
                            <h4 className="font-medium mb-1 text-sm text-muted-foreground uppercase">Date</h4>
                            <p>{format(new Date(c.createdAt), "PPP p")}</p>
                          </div>
                        </div>
                        {c.assignedTo ? (
                          <div className="bg-primary/5 border border-primary/20 p-3 rounded-md flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-sm text-primary">Assigned Staff</h4>
                              <p className="text-sm">{c.assignedTo.name} ({c.assignedTo.role})</p>
                            </div>
                            {/* <Button variant="ghost" size="sm" className="h-8">Change</Button> */}
                          </div>
                        ) : (
                          <div className="bg-muted/30 p-3 rounded-md border border-dashed flex items-center justify-between">
                            <span className="text-sm text-muted-foreground italic">No staff assigned yet</span>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  )}
                </Dialog>

                {!c.assignedTo && !c.assigned_to ? (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="flex-1" variant="default">
                        <UserPlus className="w-4 h-4 mr-2" /> Assign
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Assign Complaint</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <p className="text-sm text-muted-foreground">Select a staff member to handle this complaint.</p>
                        {staff.length === 0 ? (
                          <div className="text-center py-6 bg-muted/20 rounded-lg">
                            <p className="text-muted-foreground">No staff available.</p>
                            <Button variant="link" size="sm" className="mt-2">Add Staff Members</Button>
                          </div>
                        ) : (
                          <div className="grid gap-2 max-h-[300px] overflow-y-auto pr-2">
                            {staff.map((s: any) => (
                              <Button
                                key={s.id || s._id}
                                variant="outline"
                                className="w-full justify-between h-auto py-3 px-4"
                                onClick={() => assignMutation.mutate({ complaintId: c._id || c.id, assignedTo: s.id || s._id })}
                              >
                                <div className="flex flex-col items-start text-left">
                                  <span className="font-medium">{s.name}</span>
                                  <span className="text-xs text-muted-foreground">{s.role} • {s.department || "General"}</span>
                                </div>
                                <UserPlus className="w-4 h-4 opacity-50" />
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                ) : (
                  <Button variant="secondary" className="flex-1 cursor-default opacity-80 hover:opacity-100">
                    <span className="truncate">{c.assignedTo?.name || "Assigned"}</span>
                  </Button>
                )}
              </CardFooter>
            </Card>
          </motion.div>
        ))}

        {complaints.length === 0 && (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-muted/40 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-10 h-10 text-muted-foreground/30" />
            </div>
            <h3 className="text-xl font-semibold">No complaints found</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mt-2">
              There are currently no complaints in the system. New grievance submissions will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
