import {
  formatCurrencyExact,
  frequencyLabels,
  toMonthlyAmount,
} from "@/lib/budgetUtils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { parseLocalDate } from "@/lib/utils";

export default function IncomeCard({ income, onEdit, onDelete }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="bg-card rounded-xl p-5 border border-border/50 shadow-sm hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">
            {income.source}
          </h3>
          <Badge variant="outline" className="text-xs mt-2">
            {frequencyLabels[income.frequency]}
          </Badge>
          {income.next_date && (
            <p className="text-xs text-muted-foreground mt-2">
              Next: {format(parseLocalDate(income.next_date), "MMM d, yyyy")}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            ≈{" "}
            {formatCurrencyExact(
              toMonthlyAmount(income.amount, income.frequency),
            )}
            /mo
          </p>
        </div>
        <div className="text-right ml-4">
          <p className="text-xl font-bold text-primary">
            {formatCurrencyExact(income.amount)}
          </p>
          <p className="text-xs text-muted-foreground">
            per{" "}
            {income.frequency === "biweekly"
              ? "2 weeks"
              : income.frequency.replace("ly", "")}
          </p>
        </div>
      </div>
      {income.notes && (
        <p className="text-xs text-muted-foreground mt-3 border-t pt-3">
          {income.notes}
        </p>
      )}
      <div className="flex gap-2 mt-4 pt-3 border-t border-border/50">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onEdit(income)}
          className="text-xs"
        >
          <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onDelete(income)}
          className="text-xs text-destructive hover:text-destructive"
        >
          <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
        </Button>
      </div>
    </motion.div>
  );
}
