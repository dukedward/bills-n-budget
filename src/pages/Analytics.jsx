import { useQuery } from "@tanstack/react-query";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useAuth } from "@/lib/AuthContext";
import { listBills } from "@/api/bills";
import { listIncome } from "@/api/income";
import {
  formatCurrency,
  toMonthlyAmount,
  categoryLabels,
  categoryColors,
  frequencyLabels,
} from "@/lib/budgetUtils";
import { Skeleton } from "@/components/ui/skeleton";

export default function Analytics() {
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
    0
  );
  const monthlyExpenses = bills.reduce(
    (sum, b) => sum + toMonthlyAmount(b.amount, b.frequency),
    0
  );

  const categoryData = {};
  bills.forEach((bill) => {
    const cat = bill.category || "other";
    categoryData[cat] =
      (categoryData[cat] || 0) + toMonthlyAmount(bill.amount, bill.frequency);
  });

  const pieData = Object.entries(categoryData)
    .map(([key, value]) => ({
      name: categoryLabels[key] || key,
      value: Math.round(value),
      color: categoryColors[key] || "#888",
    }))
    .sort((a, b) => b.value - a.value);

  const freqData = {};
  bills.forEach((bill) => {
    freqData[bill.frequency] = (freqData[bill.frequency] || 0) + 1;
  });

  const barData = Object.entries(freqData).map(([key, value]) => ({
    name: frequencyLabels[key] || key,
    count: value,
  }));

  const comparisonData = [
    { name: "Income", amount: Math.round(monthlyIncome) },
    { name: "Expenses", amount: Math.round(monthlyExpenses) },
    {
      name: "Savings",
      amount: Math.max(0, Math.round(monthlyIncome - monthlyExpenses)),
    },
  ];

  if (isLoading) {
    return (
      <div className="p-6 md:p-10 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 rounded-2xl" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  const hasData = bills.length > 0 || incomes.length > 0;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Analytics
        </h1>
        <p className="text-muted-foreground mt-1">
          Visualize your spending habits
        </p>
      </div>

      {!hasData ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground">
            Add some bills and income to see your analytics.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm">
            <h3 className="font-semibold text-foreground mb-6">
              Monthly Overview
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                  <Cell fill="hsl(168, 60%, 40%)" />
                  <Cell fill="hsl(330, 60%, 55%)" />
                  <Cell fill="hsl(200, 65%, 50%)" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {pieData.length > 0 && (
            <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm">
              <h3 className="font-semibold text-foreground mb-6">
                Spending by Category
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-3 mt-4 justify-center">
                {pieData.map((entry) => (
                  <div
                    key={entry.name}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground"
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
                    {entry.name}
                  </div>
                ))}
              </div>
            </div>
          )}

          {barData.length > 0 && (
            <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm">
              <h3 className="font-semibold text-foreground mb-6">
                Bills by Frequency
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar
                    dataKey="count"
                    fill="hsl(168, 60%, 40%)"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm">
            <h3 className="font-semibold text-foreground mb-4">
              Top Monthly Expenses
            </h3>
            <div className="space-y-3">
              {[...bills]
                .sort(
                  (a, b) =>
                    toMonthlyAmount(b.amount, b.frequency) -
                    toMonthlyAmount(a.amount, a.frequency)
                )
                .slice(0, 6)
                .map((bill) => {
                  const monthly = toMonthlyAmount(bill.amount, bill.frequency);
                  const pct =
                    monthlyExpenses > 0 ? (monthly / monthlyExpenses) * 100 : 0;

                  return (
                    <div key={bill.id}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-foreground">
                          {bill.name}
                        </span>
                        <span className="text-muted-foreground">
                          {formatCurrency(monthly)}/mo
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}