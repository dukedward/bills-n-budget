import { useState, useMemo } from "react";
import { Slider } from "@/components/ui/slider";
import { formatCurrencyExact } from "@/lib/budgetUtils";
import { TrendingDown, Clock, DollarSign } from "lucide-react";

function calcPayoff(balance, apr, monthlyPayment) {
  if (monthlyPayment <= 0) return null;
  const monthlyRate = apr / 100 / 12;
  if (monthlyRate === 0) {
    const months = Math.ceil(balance / monthlyPayment);
    return { months, totalPaid: monthlyPayment * months, totalInterest: 0 };
  }
  // Check if payment covers interest
  const interestThisMonth = balance * monthlyRate;
  if (monthlyPayment <= interestThisMonth) return null;

  let remaining = balance;
  let months = 0;
  let totalPaid = 0;
  let totalInterest = 0;

  while (remaining > 0.01 && months < 600) {
    const interest = remaining * monthlyRate;
    const principal = Math.min(monthlyPayment - interest, remaining);
    remaining -= principal;
    totalInterest += interest;
    totalPaid += interest + principal;
    months++;
  }

  return { months, totalPaid, totalInterest };
}

export default function LoanPayoffSlider({ balance }) {
  const minPayment = balance.minimum_payment;
  const maxPayment = Math.max(minPayment * 5, balance.balance * 0.1);

  const [payment, setPayment] = useState(minPayment);

  const result = useMemo(
    () => calcPayoff(balance.balance, balance.apr, payment),
    [balance, payment],
  );
  const minResult = useMemo(
    () => calcPayoff(balance.balance, balance.apr, minPayment),
    [balance, minPayment],
  );

  const interestSaved =
    minResult && result
      ? Math.max(0, minResult.totalInterest - result.totalInterest)
      : 0;
  const monthsSaved =
    minResult && result ? Math.max(0, minResult.months - result.months) : 0;

  return (
    <div className="space-y-5 pt-2">
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-foreground">
            Monthly Payment
          </span>
          <span className="text-lg font-bold text-primary">
            {formatCurrencyExact(payment)}
          </span>
        </div>
        <Slider
          min={minPayment}
          max={maxPayment}
          step={5}
          value={[payment]}
          onValueChange={([val]) => setPayment(val)}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Min: {formatCurrencyExact(minPayment)}</span>
          <span>Max: {formatCurrencyExact(maxPayment)}</span>
        </div>
      </div>

      {result ? (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-primary/5 rounded-lg p-3 text-center border border-primary/10">
            <Clock className="w-4 h-4 text-primary mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Payoff Time</p>
            <p className="font-bold text-foreground text-sm">
              {result.months >= 12
                ? `${Math.floor(result.months / 12)}y ${result.months % 12}m`
                : `${result.months} mo`}
            </p>
          </div>
          <div className="bg-destructive/5 rounded-lg p-3 text-center border border-destructive/10">
            <DollarSign className="w-4 h-4 text-destructive mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Total Interest</p>
            <p className="font-bold text-destructive text-sm">
              {formatCurrencyExact(result.totalInterest)}
            </p>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-lg p-3 text-center border border-emerald-200 dark:border-emerald-900">
            <TrendingDown className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Interest Saved</p>
            <p className="font-bold text-emerald-600 text-sm">
              {formatCurrencyExact(interestSaved)}
            </p>
          </div>
        </div>
      ) : (
        <p className="text-sm text-destructive">
          Payment too low to cover interest. Increase your payment.
        </p>
      )}

      {monthsSaved > 0 && (
        <p className="text-xs text-center text-muted-foreground">
          Paying <strong>{formatCurrencyExact(payment)}</strong> instead of the
          minimum saves you{" "}
          <strong>
            {monthsSaved} month{monthsSaved !== 1 ? "s" : ""}
          </strong>{" "}
          and <strong>{formatCurrencyExact(interestSaved)}</strong> in interest.
        </p>
      )}
    </div>
  );
}
