import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { queryClientInstance } from "@/lib/query-client";
import { useAuth } from "@/lib/AuthContext";
import { listBills, createBill, updateBill, deleteBill } from "@/api/bills";
import BillCard from "@/components/bills/BillCard";
import BillFormDialog from "@/components/bills/BillFormDialog";
import OverdueBillAlert from "@/components/dashboard/OverdueBillAlert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatePresence } from "framer-motion";

export default function Bills() {
  const { user } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBill, setEditingBill] = useState(null);

  const {
    data: bills = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["bills", user?.uid],
    queryFn: () => listBills(user.uid),
    enabled: !!user?.uid,
  });

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
    mutationFn: deleteBill,
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
  };

  const handleEdit = (bill) => {
    setEditingBill(bill);
    setDialogOpen(true);
  };

  const handleDelete = async (billId) => {
    await deleteMutation.mutateAsync(billId);
  };

  const handleTogglePaid = (bill) => {
    updateMutation.mutate({ id: bill.id, data: { is_paid: !bill.is_paid } });
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

  // console.log("Bills user:", user);
  // console.log("Bills isLoadingAuth:", isLoadingAuth);
  // console.log("Bills isLoading:", isLoading);
  // console.log("Bills bills:", bills);
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

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : bills.length === 0 ? (
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
                onDelete={(b) => handleDelete(b.id)}
                onTogglePaid={handleTogglePaid}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      <BillFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSave}
        editingBill={editingBill}
      />
    </div>
  );
}
