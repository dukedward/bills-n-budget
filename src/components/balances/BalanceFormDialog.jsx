import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const typeLabels = {
  mortgage: "Mortgage",
  auto: "Auto Loan",
  student: "Student Loan",
  personal: "Personal Loan",
  credit_card: "Credit Card",
  medical: "Medical Debt",
  other: "Other",
};

const defaultForm = {
  name: "",
  balance: "",
  original_amount: "",
  apr: "",
  minimum_payment: "",
  loan_term_months: "",
  type: "other",
  start_date: "",
  notes: "",
};

export default function BalanceFormDialog({
  open,
  onOpenChange,
  onSave,
  editingBalance,
}) {
  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    if (editingBalance) {
      setForm({
        name: editingBalance.name || "",
        balance: editingBalance.balance?.toString() || "",
        original_amount: editingBalance.original_amount?.toString() || "",
        apr: editingBalance.apr?.toString() || "",
        minimum_payment: editingBalance.minimum_payment?.toString() || "",
        loan_term_months: editingBalance.loan_term_months?.toString() || "",
        type: editingBalance.type || "other",
        start_date: editingBalance.start_date || "",
        notes: editingBalance.notes || "",
      });
    } else {
      setForm(defaultForm);
    }
  }, [editingBalance, open]);

  const handleSave = () => {
    if (!form.name || !form.balance || !form.apr || !form.minimum_payment)
      return;
    onSave({
      ...form,
      balance: parseFloat(form.balance),
      original_amount: form.original_amount
        ? parseFloat(form.original_amount)
        : parseFloat(form.balance),
      apr: parseFloat(form.apr),
      minimum_payment: parseFloat(form.minimum_payment),
      loan_term_months: form.loan_term_months
        ? parseInt(form.loan_term_months)
        : null,
    });
    onOpenChange(false);
  };

  const f = (field, val) => setForm((prev) => ({ ...prev, [field]: val }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editingBalance ? "Edit Balance" : "Add Balance / Loan"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label>Loan / Bill Name</Label>
              <Input
                placeholder="e.g. Car Loan"
                value={form.name}
                onChange={(e) => f("name", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => f("type", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(typeLabels).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Current Balance ($)</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={form.balance}
                onChange={(e) => f("balance", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Original Loan Amount ($)</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={form.original_amount}
                onChange={(e) => f("original_amount", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>APR (%)</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="e.g. 6.5"
                value={form.apr}
                onChange={(e) => f("apr", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Minimum Monthly Payment ($)</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={form.minimum_payment}
                onChange={(e) => f("minimum_payment", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Loan Term (months)</Label>
              <Input
                type="number"
                placeholder="e.g. 60"
                value={form.loan_term_months}
                onChange={(e) => f("loan_term_months", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={form.start_date}
                onChange={(e) => f("start_date", e.target.value)}
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea
                rows={2}
                value={form.notes}
                onChange={(e) => f("notes", e.target.value)}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={
              !form.name || !form.balance || !form.apr || !form.minimum_payment
            }
          >
            {editingBalance ? "Update" : "Add Balance"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
