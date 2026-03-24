import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Pencil, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { formatCurrencyExact } from "@/lib/budgetUtils";
import LoanPayoffSlider from "./LoanPayoffSlider";
import { motion, AnimatePresence } from "framer-motion";

const typeLabels = {
  mortgage: "Mortgage",
  auto: "Auto Loan",
  student: "Student Loan",
  personal: "Personal Loan",
  credit_card: "Credit Card",
  medical: "Medical",
  other: "Other",
};

const typeColors = {
  mortgage: "bg-blue-100 text-blue-700",
  auto: "bg-purple-100 text-purple-700",
  student: "bg-amber-100 text-amber-700",
  personal: "bg-indigo-100 text-indigo-700",
  credit_card: "bg-rose-100 text-rose-700",
  medical: "bg-orange-100 text-orange-700",
  other: "bg-gray-100 text-gray-700",
};

export default function BalanceCard({ balance, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);

  const original = balance.original_amount || balance.balance;
  const paid = Math.max(0, original - balance.balance);
  const paidPct = Math.min(100, (paid / original) * 100);

  const monthlyRate = balance.apr / 100 / 12;
  const monthlyInterest = balance.balance * monthlyRate;
  const monthlyPrincipal = Math.max(
    0,
    balance.minimum_payment - monthlyInterest,
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
    >
      <Card className="shadow-sm border-border/50 hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-foreground">
                  {balance.name}
                </h3>
                <Badge
                  className={`text-xs ${typeColors[balance.type] || typeColors.other}`}
                >
                  {typeLabels[balance.type] || "Other"}
                </Badge>
              </div>
              <p className="text-2xl font-bold text-foreground mt-1">
                {formatCurrencyExact(balance.balance)}
                <span className="text-sm font-normal text-muted-foreground ml-1">
                  remaining
                </span>
              </p>
            </div>
            <div className="flex gap-1 ml-2">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onEdit(balance)}
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onDelete(balance)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatCurrencyExact(paid)} paid</span>
              <span>{paidPct.toFixed(1)}% complete</span>
            </div>
            <Progress value={paidPct} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Original: {formatCurrencyExact(original)}</span>
              <span>APR: {balance.apr}%</span>
            </div>
          </div>

          {/* Monthly breakdown */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-muted rounded-lg p-2">
              <p className="text-xs text-muted-foreground">Min Payment</p>
              <p className="font-semibold text-sm">
                {formatCurrencyExact(balance.minimum_payment)}
              </p>
            </div>
            <div className="bg-destructive/5 rounded-lg p-2">
              <p className="text-xs text-muted-foreground">→ Interest</p>
              <p className="font-semibold text-sm text-destructive">
                {formatCurrencyExact(monthlyInterest)}
              </p>
            </div>
            <div className="bg-primary/5 rounded-lg p-2">
              <p className="text-xs text-muted-foreground">→ Principal</p>
              <p className="font-semibold text-sm text-primary">
                {formatCurrencyExact(monthlyPrincipal)}
              </p>
            </div>
          </div>

          {/* Payoff slider toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <ChevronUp className="w-3.5 h-3.5 mr-1" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 mr-1" />
            )}
            {expanded ? "Hide" : "Show"} Payoff Calculator
          </Button>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="border-t pt-4">
                  <LoanPayoffSlider balance={balance} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}
