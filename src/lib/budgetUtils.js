export function toMonthlyAmount(amount, frequency) {
  switch (frequency) {
    case "weekly":
      return (amount * 52) / 12;
    case "biweekly":
      return (amount * 26) / 12;
    case "monthly":
      return amount;
    case "annually":
      return amount / 12;
    case "one_time":
      return 0;
    default:
      return amount;
  }
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCurrencyExact(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export const categoryLabels = {
  housing: "Housing",
  utilities: "Utilities",
  insurance: "Insurance",
  transportation: "Transportation",
  food: "Food & Groceries",
  entertainment: "Entertainment",
  health: "Health",
  education: "Education",
  subscriptions: "Subscriptions",
  debt: "Debt Payments",
  other: "Other",
};

export const categoryColors = {
  housing: "hsl(168, 60%, 40%)",
  utilities: "hsl(200, 65%, 50%)",
  insurance: "hsl(260, 50%, 55%)",
  transportation: "hsl(40, 80%, 55%)",
  food: "hsl(330, 60%, 55%)",
  entertainment: "hsl(290, 50%, 55%)",
  health: "hsl(0, 65%, 55%)",
  education: "hsl(180, 55%, 45%)",
  subscriptions: "hsl(220, 60%, 55%)",
  debt: "hsl(15, 70%, 55%)",
  other: "hsl(210, 10%, 55%)",
};

export const frequencyLabels = {
  one_time: "One-Time Payment",
  weekly: "Weekly",
  biweekly: "Bi-weekly",
  monthly: "Monthly",
  annually: "Annually",
};

export function getBudgetTips(monthlyIncome, monthlyExpenses, bills) {
  const tips = [];
  const ratio = monthlyIncome > 0 ? monthlyExpenses / monthlyIncome : 1;
  const savings = monthlyIncome - monthlyExpenses;

  if (monthlyIncome === 0 && monthlyExpenses === 0) {
    tips.push({
      type: "info",
      title: "Get Started",
      message: "Add your income and bills to get personalized budgeting tips.",
    });
    return tips;
  }

  if (ratio > 1) {
    tips.push({
      type: "warning",
      title: "Spending Exceeds Income",
      message: `You're spending ${formatCurrency(monthlyExpenses - monthlyIncome)} more than you earn monthly. Review your expenses for areas to cut back.`,
    });
  } else if (ratio > 0.9) {
    tips.push({
      type: "warning",
      title: "Tight Budget",
      message:
        "You're spending over 90% of your income. Try the 50/30/20 rule: 50% needs, 30% wants, 20% savings.",
    });
  } else if (ratio > 0.7) {
    tips.push({
      type: "info",
      title: "Good Progress",
      message: `You're saving ${formatCurrency(savings)}/month. Consider automating transfers to a savings account.`,
    });
  } else {
    tips.push({
      type: "success",
      title: "Excellent Savings",
      message: `You're saving ${formatCurrency(savings)}/month — that's ${((1 - ratio) * 100).toFixed(0)}% of your income!`,
    });
  }

  // Category-specific tips
  const categoryTotals = {};
  bills.forEach((bill) => {
    const monthly = toMonthlyAmount(bill.amount, bill.frequency);
    categoryTotals[bill.category] =
      (categoryTotals[bill.category] || 0) + monthly;
  });

  if (categoryTotals.subscriptions > monthlyIncome * 0.1 && monthlyIncome > 0) {
    tips.push({
      type: "info",
      title: "Subscription Check",
      message: `Subscriptions cost you ${formatCurrency(categoryTotals.subscriptions)}/month. Review if you're using all of them.`,
    });
  }

  if (
    categoryTotals.entertainment > monthlyIncome * 0.15 &&
    monthlyIncome > 0
  ) {
    tips.push({
      type: "info",
      title: "Entertainment Spending",
      message: `Entertainment costs ${formatCurrency(categoryTotals.entertainment)}/month. Look for free or low-cost alternatives.`,
    });
  }

  if (categoryTotals.housing > monthlyIncome * 0.35 && monthlyIncome > 0) {
    tips.push({
      type: "warning",
      title: "High Housing Cost",
      message: `Housing takes ${((categoryTotals.housing / monthlyIncome) * 100).toFixed(0)}% of income. Experts recommend keeping it under 30%.`,
    });
  }

  if (savings > 0 && !categoryTotals.debt) {
    tips.push({
      type: "success",
      title: "Emergency Fund",
      message:
        "Great that you have surplus income! Aim for 3-6 months of expenses in an emergency fund.",
    });
  }

  return tips;
}
