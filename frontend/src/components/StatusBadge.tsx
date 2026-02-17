import { Badge } from "@/components/ui/badge";

const statusConfig: Record<string, { label: string; className: string }> = {
  PENDING: { label: "Pending", className: "status-pending" },
  IN_PROGRESS: { label: "In Progress", className: "status-in-progress" },
  RESOLVED: { label: "Resolved", className: "status-resolved" },
  ESCALATED: { label: "Escalated", className: "status-escalated" },
  CLOSED: { label: "Closed", className: "status-closed" },
};

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || statusConfig.PENDING;
  return (
    <Badge variant="outline" className={`${config.className} font-medium text-xs px-2.5 py-0.5`}>
      {config.label}
    </Badge>
  );
}
