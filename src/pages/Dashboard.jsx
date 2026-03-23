import { useQuery } from "@tanstack/react-query";
import { Wallet, Receipt, PiggyBank, TrendingDown } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { listBills } from "@/api/bills";
import { listIncome } from "@/api/income";
import {
  formatCurrency,
  toMonthlyAmount,
  getBudgetTips,
} from "@/lib/budgetUtils";
import StatCard from "@/components/dashboard/StatCard";
import BudgetTipCard from "@/components/dashboard/BudgetTipCard";
import UpcomingBills from "@/components/dashboard/UpcomingBills";
import ExportButton from "@/components/export/ExportButton";
import RecurringCalendar from "@/components/calendar/RecurringCalendar";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { user } = useAuth();

  const { data: bills = [], isLoading: loadingBills } = useQuery({
    queryKey: ["bills", user?.uid],
    queryFn: () => listBills(user.uid),
    enabled: !!user?.uid,
  });

  const { data: incomes = [], isLoading: loadingIncome } = useQuery({
    queryKey: ["income", user?.uid],
    queryFn: () => listIncome(user.uid),
    enabled: !!user?.uid,
  });

  const isLoading = loadingBills || loadingIncome;

  const monthlyIncome = incomes.reduce(
    (sum, i) => sum + toMonthlyAmount(i.amount, i.frequency),
    0,
  );
  const monthlyExpenses = bills.reduce(
    (sum, b) => sum + toMonthlyAmount(b.amount, b.frequency),
    0,
  );
  const monthlySavings = monthlyIncome - monthlyExpenses;
  const tips = getBudgetTips(monthlyIncome, monthlyExpenses, bills);

  if (isLoading) {
    return (
      <div className="p-6 md:p-10 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Your financial overview at a glance
          </p>
        </div>
        <ExportButton bills={bills} incomes={incomes} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Monthly Income"
          value={formatCurrency(monthlyIncome)}
          icon={Wallet}
          variant="primary"
        />
        <StatCard
          title="Monthly Expenses"
          value={formatCurrency(monthlyExpenses)}
          icon={Receipt}
        />
        <StatCard
          title="Monthly Savings"
          value={formatCurrency(monthlySavings)}
          subtitle={monthlySavings >= 0 ? "Looking good!" : "Over budget"}
          icon={PiggyBank}
        />
        <StatCard
          title="Bills Tracked"
          value={bills.length}
          subtitle={`${bills.filter((b) => b.is_paid).length} paid this period`}
          icon={TrendingDown}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Budget Tips</h2>
          {tips.map((tip, i) => (
            <BudgetTipCard key={i} tip={tip} />
          ))}
        </div>

        <UpcomingBills bills={bills} />
      </div>

      <RecurringCalendar bills={bills} incomes={incomes} />
    </div>
  );
}
