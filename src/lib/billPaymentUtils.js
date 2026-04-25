import { addDays, addMonths, addYears, format } from "date-fns";

function parseLocalDate(dateString) {
  if (!dateString) return null;
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function getNextDueDate(currentDueDate, frequency) {
  if (!currentDueDate || frequency === "one_time") return currentDueDate;

  const date = parseLocalDate(currentDueDate);
  if (!date) return currentDueDate;

  switch (frequency) {
    case "weekly":
      return format(addDays(date, 7), "yyyy-MM-dd");
    case "biweekly":
      return format(addDays(date, 14), "yyyy-MM-dd");
    case "monthly":
      return format(addMonths(date, 1), "yyyy-MM-dd");
    case "quarterly":
      return format(addMonths(date, 3), "yyyy-MM-dd");
    case "annually":
      return format(addYears(date, 1), "yyyy-MM-dd");
    default:
      return currentDueDate;
  }
}

export function getCurrentPeriodKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function getCurrentQuarterKey() {
  const now = new Date();
  const quarter = Math.floor(now.getMonth() / 3) + 1;
  return `${now.getFullYear()}-Q${quarter}`;
}

export function getFrequenciesToReset(lastMonthKey, lastQuarterKey) {
  const currentMonth = getCurrentPeriodKey();
  const currentQuarter = getCurrentQuarterKey();
  const toReset = [];

  if (lastMonthKey !== currentMonth) {
    toReset.push("weekly", "biweekly", "monthly");
  }
  if (lastQuarterKey !== currentQuarter) {
    toReset.push("quarterly");
  }

  return { toReset, currentMonth, currentQuarter };
}
