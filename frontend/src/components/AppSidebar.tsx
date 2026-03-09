import { useAuth } from "@/hooks/useAuth";
import logo from "../../public/Grievance_Logo.png";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { LayoutDashboard, FileText, PlusCircle, Users, BarChart3, Inbox, Shield } from "lucide-react";

const studentLinks = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "My Complaints", url: "/dashboard/my-complaints", icon: FileText },
  { title: "New Complaint", url: "/dashboard/new-complaint", icon: PlusCircle },
];

const adminLinks = [
  { title: "Overview", url: "/dashboard", icon: LayoutDashboard },
  { title: "All Complaints", url: "/dashboard/complaints", icon: FileText },
  { title: "Staff Management", url: "/dashboard/staff", icon: Users },
  { title: "Analytics", url: "/dashboard/analytics", icon: BarChart3 },
];

const staffLinks = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Assigned", url: "/dashboard/assigned", icon: Inbox },
];

export function AppSidebar() {
  const { profile } = useAuth();
  const role = profile?.role || "STUDENT";

  const links = role === "ADMIN" ? adminLinks : role === "STUDENT" ? studentLinks : staffLinks;

  return (
    <Sidebar className="border-r-0">
      <SidebarHeader className="p-5">
        <div className="flex items-center gap-3">
          <div className="w-20 h-20  flex items-center justify-center">
            {/* <Shield className="w-5 h-5 text-sidebar-primary-foreground" /> */}
            <img src={logo} alt="logo" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-sidebar-foreground">Grievance Portal</h2>
            <p className="text-xs text-sidebar-foreground/60">{role}</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {links.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
                      activeClassName="bg-sidebar-accent text-sidebar-foreground font-medium"
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
