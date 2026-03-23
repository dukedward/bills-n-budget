import { useState, useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrencyExact } from "@/lib/budgetUtils";
import {
  format,
  addDays,
  addWeeks,
  addMonths,
  addYears,
  isSameDay,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

export default function RecurringCalendar({ bills, incomes }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMonth, setViewMonth] = useState(new Date());

  // Generate recurring dates for the current month view
  const recurringDates = useMemo(() => {
    const dates = new Map();
    const monthStart = startOfMonth(viewMonth);
    const monthEnd = endOfMonth(viewMonth);

    const addRecurringDates = (item, type) => {
      if (!item.due_date && !item.next_date) return;

      const startDate = new Date(item.due_date || item.next_date);
      let currentDate = new Date(startDate);

      // Go back to find the first occurrence before the month
      while (currentDate > monthStart) {
        switch (item.frequency) {
          case "weekly":
            currentDate = addDays(currentDate, -7);
            break;
          case "biweekly":
            currentDate = addDays(currentDate, -14);
            break;
          case "monthly":
            currentDate = addMonths(currentDate, -1);
            break;
          case "annually":
            currentDate = addYears(currentDate, -1);
            break;
        }
      }

      // Generate dates within the month view
      while (currentDate <= monthEnd) {
        if (currentDate >= monthStart) {
          const dateKey = format(currentDate, "yyyy-MM-dd");
          if (!dates.has(dateKey)) {
            dates.set(dateKey, []);
          }
          dates
            .get(dateKey)
            .push({ ...item, type, date: new Date(currentDate) });
        }

        switch (item.frequency) {
          case "weekly":
            currentDate = addWeeks(currentDate, 1);
            break;
          case "biweekly":
            currentDate = addWeeks(currentDate, 2);
            break;
          case "monthly":
            currentDate = addMonths(currentDate, 1);
            break;
          case "annually":
            currentDate = addYears(currentDate, 1);
            break;
        }
      }
    };

    bills.forEach((bill) => addRecurringDates(bill, "bill"));
    incomes.forEach((income) => addRecurringDates(income, "income"));

    return dates;
  }, [bills, incomes, viewMonth]);

  const selectedItems = useMemo(() => {
    const dateKey = format(selectedDate, "yyyy-MM-dd");
    return recurringDates.get(dateKey) || [];
  }, [selectedDate, recurringDates]);

  const modifiers = {
    hasBills: (date) => {
      const dateKey = format(date, "yyyy-MM-dd");
      const items = recurringDates.get(dateKey) || [];
      return items.some((item) => item.type === "bill");
    },
    hasIncome: (date) => {
      const dateKey = format(date, "yyyy-MM-dd");
      const items = recurringDates.get(dateKey) || [];
      return items.some((item) => item.type === "income");
    },
  };

  const modifiersClassNames = {
    hasBills:
      "relative after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:rounded-full after:bg-destructive",
    hasIncome:
      "relative before:content-[''] before:absolute before:top-1 before:left-1/2 before:-translate-x-1/2 before:w-1 before:h-1 before:rounded-full before:bg-primary",
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-primary" />
            <CardTitle>Recurring Calendar</CardTitle>
          </div>
          <div className="flex gap-4 text-xs text-muted-foreground mt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-destructive" />
              Bills
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-primary" />
              Income
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            onMonthChange={setViewMonth}
            modifiers={modifiers}
            modifiersClassNames={modifiersClassNames}
            className="rounded-md border w-full"
          />
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">
            {format(selectedDate, "MMMM d, yyyy")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedItems.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No bills or income scheduled for this date.
            </p>
          ) : (
            <div className="space-y-3">
              {selectedItems.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border ${
                    item.type === "bill"
                      ? "bg-destructive/5 border-destructive/20"
                      : "bg-primary/5 border-primary/20"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-sm text-foreground">
                        {item.name || item.source}
                      </p>
                      <Badge
                        variant="secondary"
                        className={`text-xs mt-1 ${
                          item.type === "bill"
                            ? "bg-destructive/10 text-destructive"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        {item.type === "bill" ? "Bill" : "Income"}
                      </Badge>
                    </div>
                    <p
                      className={`text-sm font-semibold ${
                        item.type === "bill"
                          ? "text-destructive"
                          : "text-primary"
                      }`}
                    >
                      {formatCurrencyExact(item.amount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
