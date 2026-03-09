import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { userAPI } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import { UserPlus, Users, MoreHorizontal, Mail, Phone, Calendar, Building2, Briefcase } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const DEPARTMENTS = ["CSE", "ECE", "EEE", "MECH", "CIVIL", "IT"];

export default function StaffManagement() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"HOD" | "TPO">("HOD");
  const [department, setDepartment] = useState("");
  const [creating, setCreating] = useState(false);
  const [open, setOpen] = useState(false);

  const { data: staff = [], refetch } = useQuery({
    queryKey: ["all-staff"],
    queryFn: async () => {
      const response = await userAPI.getStaff();
      return response.data || [];
    },
  });

  const handleCreate = async () => {
    setCreating(true);
    try {
      let response;
      if (role === "HOD") {
        response = await userAPI.createHOD({ name, email, password, department });
      } else {
        response = await userAPI.createTPO({ name, email, password });
      }

      toast({ title: `${role} created successfully!` });
      refetch();
      setName(""); setEmail(""); setPassword(""); setDepartment("");
      setOpen(false);
    } catch (err: any) {
      toast({ title: "Failed to create staff", description: err.response?.data?.message || err.message, variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      ?.split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div className="space-y-8 p-1 sm:p-4 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-blue-600 pb-2">
            Staff Management
          </h1>
          <p className="text-muted-foreground text-lg">
            Manage Department Heads and Placement Officers
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
              <UserPlus className="w-4 h-4 mr-2" /> Add Staff Member
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Staff</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={role} onValueChange={(v: "HOD" | "TPO") => setRole(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HOD">HOD (Head of Department)</SelectItem>
                    <SelectItem value="TPO">TPO (Training & Placement)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Dr. Sarah Smith" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@college.edu" />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
              </div>
              {role === "HOD" && (
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Select value={department} onValueChange={setDepartment}>
                    <SelectTrigger><SelectValue placeholder="Select Department" /></SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <Button className="w-full mt-4" onClick={handleCreate} disabled={creating || !name || !email || !password || (role === "HOD" && !department)}>
                {creating ? "Creating..." : "Create Account"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {staff.map((s: any, i: number) => (
          <motion.div
            key={s._id || s.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-card/50 backdrop-blur-sm group overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 to-purple-500/50 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              <CardContent className="p-6">

                {/* Card Header Section */}
                <div className="flex justify-between items-start mb-6 ">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Avatar className="w-14 h-14 border-2 border-white shadow-sm">
                        <AvatarImage src={`https://ui-avatars.com/api/?name=${s.name}&background=random`} />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                          {getInitials(s.name)}
                        </AvatarFallback>
                      </Avatar>
                      {/* <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span> */}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg leading-tight text-foreground">{s.name}</h3>
                      <p className="text-sm text-muted-foreground font-medium flex items-center gap-1.5 mt-0.5">
                        {s.role === "HOD" ? "Head of Dept." : "Placement Officer"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Body Grid */}
                <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm mb-6 ">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Department</span>
                    <div className="font-semibold flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-primary/70" />
                      {s.department || "General"}
                    </div>
                  </div>
                </div>

                <Separator className="mb-4 opacity-50" />

                {/* Contact Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm group/item">
                    <div className="p-2 rounded-full bg-secondary/50 group-hover/item:bg-primary/10 transition-colors">
                      <Mail className="w-4 h-4 text-muted-foreground group-hover/item:text-primary transition-colors" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Email Address</p>
                      <p className="font-medium text-foreground">{s.email}</p>
                    </div>
                  </div>
                </div>

              </CardContent>
            </Card>
          </motion.div>
        ))}

        {staff.length === 0 && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-muted/30 rounded-full flex items-center justify-center mb-6">
              <Users className="w-10 h-10 text-muted-foreground/40" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Staff Members Found</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Get started by adding Head of Departments (HODs) and Training Placement Officers (TPOs) to the system.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
