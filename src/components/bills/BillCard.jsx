import {
  formatCurrencyExact,
  frequencyLabels,
  categoryLabels,
  toMonthlyAmount,
} from "@/lib/budgetUtils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Check, RotateCcw, History } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { parseLocalDate } from "@/lib/utils";

export default function BillCard({
  bill,
  onEdit,
  onDelete,
  onTogglePaid,
  onViewHistory,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className={`bg-card rounded-xl p-5 border shadow-sm transition-all hover:shadow-md ${bill.is_paid ? "border-emerald-200 bg-emerald-50/30" : "border-border/50"}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-foreground truncate">
              {bill.name}
            </h3>
            {bill.is_paid && (
              <Badge className="bg-emerald-100 text-emerald-700 text-xs">
                Paid
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="secondary" className="text-xs">
              {categoryLabels[bill.category] || bill.category}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {frequencyLabels[bill.frequency]}
            </Badge>
          </div>
          {bill.due_date && (
            <p className="text-xs text-muted-foreground mt-2">
              Due: {format(parseLocalDate(bill.due_date), "MMM d, yyyy")}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            ≈{" "}
            {formatCurrencyExact(toMonthlyAmount(bill.amount, bill.frequency))}
            /mo
          </p>
        </div>
        <div className="text-right ml-4">
          <p className="text-xl font-bold text-foreground">
            {formatCurrencyExact(bill.amount)}
          </p>
          <p className="text-xs text-muted-foreground">
            per{" "}
            {bill.frequency === "biweekly"
              ? "2 weeks"
              : bill.frequency.replace("ly", "")}
          </p>
        </div>
      </div>
      {bill.notes && (
        <p className="text-xs text-muted-foreground mt-3 border-t pt-3">
          {bill.notes}
        </p>
      )}
      <div className="flex gap-1 mt-4 pt-3 border-t border-border/50">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onTogglePaid(bill)}
          className="text-xs px-2"
        >
          {bill.is_paid ? (
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
          ) : (
            <Check className="w-3.5 h-3.5 mr-1" />
          )}
          {bill.is_paid ? "Unpaid" : "Mark Paid"}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onEdit(bill)}
          className="text-xs"
        >
          <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onDelete(bill)}
          className="text-xs text-destructive hover:text-destructive"
        >
          <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onViewHistory(bill)}
          className="text-xs"
        >
          <History className="w-3.5 h-3.5 mr-1" /> History
        </Button>
      </div>
    </motion.div>
  );
}
