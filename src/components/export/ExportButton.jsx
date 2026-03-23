import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileText, Table } from "lucide-react";
import {
  formatCurrencyExact,
  frequencyLabels,
  categoryLabels,
  toMonthlyAmount,
} from "@/lib/budgetUtils";
import { format } from "date-fns";

export default function ExportButton({ bills, incomes }) {
  const [isExporting, setIsExporting] = useState(false);

  const exportToCSV = () => {
    setIsExporting(true);
    try {
      // Bills CSV
      const billsHeaders = [
        "Name",
        "Amount",
        "Category",
        "Frequency",
        "Due Date",
        "Status",
        "Monthly Amount",
        "Notes",
      ];
      const billsRows = bills.map((b) => [
        b.name,
        b.amount,
        categoryLabels[b.category] || b.category,
        frequencyLabels[b.frequency],
        b.due_date ? format(new Date(b.due_date), "yyyy-MM-dd") : "",
        b.is_paid ? "Paid" : "Unpaid",
        toMonthlyAmount(b.amount, b.frequency).toFixed(2),
        b.notes || "",
      ]);

      const billsCSV = [billsHeaders, ...billsRows]
        .map((row) => row.map((cell) => `"${cell}"`).join(","))
        .join("\n");

      // Income CSV
      const incomeHeaders = [
        "Source",
        "Amount",
        "Frequency",
        "Next Date",
        "Monthly Amount",
        "Notes",
      ];
      const incomeRows = incomes.map((i) => [
        i.source,
        i.amount,
        frequencyLabels[i.frequency],
        i.next_date ? format(new Date(i.next_date), "yyyy-MM-dd") : "",
        toMonthlyAmount(i.amount, i.frequency).toFixed(2),
        i.notes || "",
      ]);

      const incomeCSV = [incomeHeaders, ...incomeRows]
        .map((row) => row.map((cell) => `"${cell}"`).join(","))
        .join("\n");

      // Combined export
      const fullCSV = `BILLS\n${billsCSV}\n\nINCOME\n${incomeCSV}`;

      const blob = new Blob([fullCSV], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `budget-export-${format(new Date(), "yyyy-MM-dd")}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  };

  const exportToJSON = () => {
    setIsExporting(true);
    try {
      const data = {
        exported_at: new Date().toISOString(),
        bills: bills.map((b) => ({
          ...b,
          monthly_amount: toMonthlyAmount(b.amount, b.frequency),
        })),
        incomes: incomes.map((i) => ({
          ...i,
          monthly_amount: toMonthlyAmount(i.amount, i.frequency),
        })),
        summary: {
          total_bills: bills.length,
          total_income_sources: incomes.length,
          monthly_income: incomes.reduce(
            (sum, i) => sum + toMonthlyAmount(i.amount, i.frequency),
            0,
          ),
          monthly_expenses: bills.reduce(
            (sum, b) => sum + toMonthlyAmount(b.amount, b.frequency),
            0,
          ),
        },
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `budget-export-${format(new Date(), "yyyy-MM-dd")}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isExporting}>
          <Download className="w-4 h-4 mr-2" />
          {isExporting ? "Exporting..." : "Export Data"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToCSV}>
          <Table className="w-4 h-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToJSON}>
          <FileText className="w-4 h-4 mr-2" />
          Export as JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
