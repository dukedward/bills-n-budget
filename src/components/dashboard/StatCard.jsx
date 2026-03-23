import { motion } from "framer-motion";

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "default",
}) {
  const variants = {
    default: "bg-card",
    primary: "bg-primary text-primary-foreground",
    accent: "bg-accent",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${variants[variant]} rounded-2xl p-6 shadow-sm border border-border/50`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p
            className={`text-sm font-medium ${variant === "primary" ? "text-primary-foreground/70" : "text-muted-foreground"}`}
          >
            {title}
          </p>
          <p
            className={`text-2xl md:text-3xl font-bold mt-2 tracking-tight ${variant === "primary" ? "" : "text-foreground"}`}
          >
            {value}
          </p>
          {subtitle && (
            <p
              className={`text-xs mt-1 ${variant === "primary" ? "text-primary-foreground/60" : "text-muted-foreground"}`}
            >
              {subtitle}
            </p>
          )}
        </div>
        {Icon && (
          <div
            className={`p-3 rounded-xl ${variant === "primary" ? "bg-primary-foreground/10" : "bg-accent"}`}
          >
            <Icon
              className={`w-5 h-5 ${variant === "primary" ? "text-primary-foreground" : "text-primary"}`}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}
