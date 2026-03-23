import { isPast, isToday, format } from "date-fns";
import { AlertTriangle } from "lucide-react";
import { formatCurrencyExact } from "@/lib/budgetUtils";
import { motion } from "framer-motion";
import { parseLocalDate } from "@/lib/utils";

export default function OverdueBillsAlert({ bills }) {
  const overdueBills = bills.filter((b) => {
    if (!b.due_date || b.is_paid) return false;
    const dueDate = parseLocalDate(b.due_date);
    return isPast(dueDate) && !isToday(dueDate);
  });

  if (overdueBills.length === 0) return null;

  const totalOverdue = overdueBills.reduce((sum, b) => sum + b.amount, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-destructive/10 border-2 border-destructive/30 rounded-2xl p-5 mb-6"
    >
      <div className="flex gap-3">
        <div className="p-2 bg-destructive/20 rounded-lg h-fit">
          <AlertTriangle className="w-5 h-5 text-destructive" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-destructive mb-1">
            {overdueBills.length} Overdue Bill
            {overdueBills.length > 1 ? "s" : ""}
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            You have {formatCurrencyExact(totalOverdue)} in unpaid overdue
            bills.
          </p>
          <div className="space-y-2">
            {overdueBills.map((bill) => (
              <div
                key={bill.id}
                className="flex items-center justify-between bg-card/50 rounded-lg px-3 py-2 text-sm"
              >
                <div>
                  <span className="font-medium text-foreground">
                    {bill.name}
                  </span>
                  <span className="text-muted-foreground ml-2">
                    · Due {format(parseLocalDate(bill.due_date), "MMM d")}
                  </span>
                </div>
                <span className="font-semibold text-destructive">
                  {formatCurrencyExact(bill.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
