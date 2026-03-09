import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  delay?: number;
  featured?: boolean;
}

export function KPICard({ title, value, subtitle, icon: Icon, delay = 0, featured = false }: KPICardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, type: "spring", stiffness: 100 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="h-full"
    >
      <Card className={`relative overflow-hidden h-full border-0 transition-all duration-300 ${featured
          ? "bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border-primary/20 shadow-lg shadow-primary/5"
          : "bg-card/50 backdrop-blur-sm border-white/5 shadow-md hover:shadow-xl hover:bg-card/80"
        }`}>
        {/* Background Decorative Bloom */}
        <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl opacity-20 ${featured ? "bg-primary" : "bg-accent"
          }`} />

        <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
          <CardTitle className="text-sm font-medium text-muted-foreground tracking-wide uppercase text-[10px]">{title}</CardTitle>
          <div className={`p-2 rounded-xl ${featured
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
              : "bg-secondary text-secondary-foreground"
            }`}>
            <Icon className="w-4 h-4" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              {value}
            </span>
          </div>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-2 font-medium flex items-center gap-1">
              {subtitle}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
