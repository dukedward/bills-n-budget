import { format, isPast, isToday } from "date-fns";
import { formatCurrencyExact, frequencyLabels } from "@/lib/budgetUtils";
import { Badge } from "@/components/ui/badge";
import { CalendarClock } from "lucide-react";

export default function UpcomingBills({ bills }) {
  const sorted = [...bills]
    .filter((b) => b.due_date)
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
    .slice(0, 5);

  if (sorted.length === 0) {
    return (
      <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm">
        <h3 className="font-semibold text-foreground mb-4">Upcoming Bills</h3>
        <p className="text-sm text-muted-foreground">
          No upcoming bills with due dates.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <CalendarClock className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">Upcoming Bills</h3>
      </div>
      <div className="space-y-3">
        {sorted.map((bill) => {
          const dueDate = new Date(bill.due_date);
          const overdue = isPast(dueDate) && !isToday(dueDate) && !bill.is_paid;
          return (
            <div
              key={bill.id}
              className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
            >
              <div>
                <p className="text-sm font-medium text-foreground">
                  {bill.name}
                </p>
                <p
                  className={`text-xs ${overdue ? "text-destructive" : "text-muted-foreground"}`}
                >
                  {overdue ? "Overdue — " : ""}
                  {format(dueDate, "MMM d, yyyy")}
                </p>
              </div>
              <div className="text-right flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">
                  {formatCurrencyExact(bill.amount)}
                </span>
                {bill.is_paid && (
                  <Badge
                    variant="secondary"
                    className="text-xs bg-emerald-100 text-emerald-700"
                  >
                    Paid
                  </Badge>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
