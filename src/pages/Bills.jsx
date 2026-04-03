import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { queryClientInstance } from "@/lib/query-client";
import { useAuth } from "@/lib/AuthContext";
import { listBills, createBill, updateBill, deleteBill } from "@/api/bills";
import { createPayment } from "@/api/payments";
import BillCard from "@/components/bills/BillCard";
import BillFormDialog from "@/components/bills/BillFormDialog";
import PaymentHistoryModal from "@/components/bills/PaymentHistoryModal";
import OverdueBillAlert from "@/components/dashboard/OverdueBillAlert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatePresence } from "framer-motion";
import { getNextDueDate, getFrequenciesToReset } from "@/lib/billPaymentUtils";

export default function Bills() {
  const { user } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [historyBill, setHistoryBill] = useState(null);

  const {
    data: bills = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["bills", user?.uid],
    queryFn: () => listBills(user.uid),
    enabled: !!user?.uid,
  });

  useEffect(() => {
    const runReset = async () => {
      if (!user?.uid || !bills.length) return;

      const lastMonth = localStorage.getItem("budgetflow_last_month_reset");
      const lastQuarter = localStorage.getItem("budgetflow_last_quarter_reset");

      const { toReset, currentMonth, currentQuarter } = getFrequenciesToReset(
        lastMonth,
        lastQuarter,
      );

      if (!toReset.length) return;

      const billsToReset = bills.filter(
        (b) => b.is_paid && toReset.includes(b.frequency),
      );

      if (!billsToReset.length) {
        if (toReset.includes("monthly")) {
          localStorage.setItem("budgetflow_last_month_reset", currentMonth);
        }
        if (toReset.includes("quarterly")) {
          localStorage.setItem("budgetflow_last_quarter_reset", currentQuarter);
        }
        return;
      }

      await Promise.all(
        billsToReset.map((b) => updateBill(b.id, { is_paid: false })),
      );

      if (toReset.includes("monthly")) {
        localStorage.setItem("budgetflow_last_month_reset", currentMonth);
      }
      if (toReset.includes("quarterly")) {
        localStorage.setItem("budgetflow_last_quarter_reset", currentQuarter);
      }

      queryClientInstance.invalidateQueries({ queryKey: ["bills", user.uid] });
    };

    runReset();
  }, [bills, user?.uid]);

  const createMutation = useMutation({
    mutationFn: (data) => createBill({ ...data, user_uid: user.uid }),
    onSuccess: () => {
      queryClientInstance.invalidateQueries({ queryKey: ["bills", user.uid] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateBill(id, data),
    onSuccess: () => {
      queryClientInstance.invalidateQueries({ queryKey: ["bills", user.uid] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteBill(id),
    onSuccess: () => {
      queryClientInstance.invalidateQueries({ queryKey: ["bills", user.uid] });
    },
  });

  const handleSave = async (data) => {
    if (editingBill) {
      await updateMutation.mutateAsync({ id: editingBill.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
    setEditingBill(null);
    setDialogOpen(false);
  };

  const handleEdit = (bill) => {
    setEditingBill(bill);
    setDialogOpen(true);
  };

  const handleDelete = async (bill) => {
    await deleteMutation.mutateAsync(bill.id);
  };

  const handleTogglePaid = async (bill) => {
    const nowPaid = !bill.is_paid;
    const today = new Date().toISOString().split("T")[0];
    const now = new Date();

    const updates = { is_paid: nowPaid };

    if (nowPaid && bill.due_date && bill.frequency !== "one_time") {
      updates.due_date = getNextDueDate(bill.due_date, bill.frequency);
    }

    await updateMutation.mutateAsync({ id: bill.id, data: updates });

    if (nowPaid) {
      await createPayment({
        bill_id: bill.id,
        bill_name: bill.name,
        amount: bill.amount,
        paid_date: today,
        period_year: now.getFullYear(),
        period_month: now.getMonth() + 1,
        user_uid: user.uid,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 md:p-10 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
      </div>
    );
  }

  // console.log("Bills error:", error);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Bills
          </h1>
          <p className="text-muted-foreground mt-1">
            Track and manage your recurring bills
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingBill(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" /> Add Bill
        </Button>
      </div>

      <OverdueBillAlert bills={bills} />

      {bills.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground">
            No bills yet. Add your first bill to get started!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {bills.map((bill) => (
              <BillCard
                key={bill.id}
                bill={bill}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onTogglePaid={handleTogglePaid}
                onViewHistory={(b) => setHistoryBill(b)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      <BillFormDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingBill(null);
        }}
        onSave={handleSave}
        editingBill={editingBill}
      />

      {historyBill && (
        <PaymentHistoryModal
          bill={historyBill}
          open={!!historyBill}
          userUid={user?.uid}
          onOpenChange={(v) => {
            if (!v) setHistoryBill(null);
          }}
        />
      )}
    </div>
  );
}
