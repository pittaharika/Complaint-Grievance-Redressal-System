import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { complaintAPI } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Send, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const CATEGORIES = ["Academic", "Infrastructure", "Placement", "Hostel", "Library", "Other"] as const;
const DEPARTMENTS = ["CSE", "ECE", "EEE", "MECH", "CIVIL", "IT"];

export default function NewComplaint() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [category, setCategory] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [target, setTarget] = useState("");
  const [department, setDepartment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSubmitting(true);

    try {
      await complaintAPI.create({
        category,
        subject,
        description,
        target,
        department: target === "HOD" ? department : null,
      });

      toast({ title: "Complaint submitted!", description: "Your complaint has been recorded successfully." });
      navigate("/dashboard/my-complaints");
    } catch (err: any) {
      toast({ title: "Failed to submit", description: err.response?.data?.message || err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold tracking-tight mb-1">New Complaint</h1>
      <p className="text-muted-foreground mb-6">Submit a new grievance for resolution</p>

      <Card className="glass-card">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Target</Label>
                <Select value={target} onValueChange={setTarget} required>
                  <SelectTrigger><SelectValue placeholder="Direct to" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HOD">HOD (Head of Dept)</SelectItem>
                    <SelectItem value="TPO">TPO (Placement)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {target === "HOD" && (
              <div className="space-y-2">
                <Label>Department</Label>
                <Select value={department} onValueChange={setDepartment} required>
                  <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Subject</Label>
              <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Brief subject of your complaint" required maxLength={200} />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe your complaint in detail..."
                rows={5}
                required
                maxLength={2000}
              />
              <p className="text-xs text-muted-foreground text-right">{description.length}/2000</p>
            </div>

            <Button type="submit" className="w-full" disabled={submitting || !category || !target || !subject || !description || (target === "HOD" && !department)}>
              {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
              Submit Complaint
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}

