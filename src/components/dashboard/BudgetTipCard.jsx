import { AlertTriangle, Info, CheckCircle } from "lucide-react";

const iconMap = {
  warning: AlertTriangle,
  info: Info,
  success: CheckCircle,
};

const colorMap = {
  warning: "text-amber-500 bg-amber-50 border-amber-200",
  info: "text-blue-500 bg-blue-50 border-blue-200",
  success: "text-emerald-500 bg-emerald-50 border-emerald-200",
};

export default function BudgetTipCard({ tip }) {
  const Icon = iconMap[tip.type] || Info;
  const colors = colorMap[tip.type] || colorMap.info;

  return (
    <div className={`rounded-xl p-4 border ${colors}`}>
      <div className="flex gap-3">
        <Icon className="w-5 h-5 mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold text-sm text-foreground">{tip.title}</p>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
            {tip.message}
          </p>
        </div>
      </div>
    </div>
  );
}
