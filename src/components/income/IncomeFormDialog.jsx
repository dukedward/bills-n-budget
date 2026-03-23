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
import { frequencyLabels } from "@/lib/budgetUtils";

const defaultForm = {
  source: "",
  amount: "",
  frequency: "monthly",
  next_date: "",
  notes: "",
};

export default function IncomeFormDialog({
  open,
  onOpenChange,
  onSave,
  editingIncome,
}) {
  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    if (editingIncome) {
      setForm({
        source: editingIncome.source || "",
        amount: editingIncome.amount?.toString() || "",
        frequency: editingIncome.frequency || "monthly",
        next_date: editingIncome.next_date || "",
        notes: editingIncome.notes || "",
      });
    } else {
      setForm(defaultForm);
    }
  }, [editingIncome, open]);

  const handleSave = () => {
    if (!form.source || !form.amount) return;
    onSave({ ...form, amount: parseFloat(form.amount) });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingIncome ? "Edit Income" : "Add Income Source"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Source</Label>
            <Input
              placeholder="e.g. Full-time Job"
              value={form.source}
              onChange={(e) => setForm({ ...form, source: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Amount ($)</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Frequency</Label>
              <Select
                value={form.frequency}
                onValueChange={(v) => setForm({ ...form, frequency: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(frequencyLabels).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Next Payment Date</Label>
            <Input
              type="date"
              value={form.next_date}
              onChange={(e) => setForm({ ...form, next_date: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea
              placeholder="Any extra details..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!form.source || !form.amount}>
            {editingIncome ? "Update" : "Add Income"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
