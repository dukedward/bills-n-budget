import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, CreditCard } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { queryClientInstance } from "@/lib/query-client";
import { useAuth } from "@/lib/AuthContext";
import BalanceCard from "@/components/balances/BalanceCard";
import BalanceFormDialog from "@/components/balances/BalanceFormDialog";
import { formatCurrencyExact } from "@/lib/budgetUtils";
import {
  listBalances,
  createBalance,
  updateBalance,
  deleteBalance,
} from "../api/balances";

export default function Balances() {
  const { user } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBalance, setEditingBalance] = useState(null);

  const {
    data: balances = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["balances", user?.uid],
    queryFn: () => listBalances(user.uid),
    enabled: !!user?.uid,
  });

  const createMutation = useMutation({
    mutationFn: (data) => createBalance({ ...data, user_uid: user.uid }),
    onSuccess: () =>
      queryClientInstance.invalidateQueries({
        queryKey: ["balances", user.uid],
      }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateBalance(id, data),
    onSuccess: () =>
      queryClientInstance.invalidateQueries({
        queryKey: ["balances", user.uid],
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteBalance(id),
    onSuccess: () =>
      queryClientInstance.invalidateQueries({
        queryKey: ["balances", user.uid],
      }),
  });

  const handleSave = async (data) => {
    if (editingBalance) {
      await updateMutation.mutateAsync({ id: editingBalance.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
    setEditingBalance(null);
  };

  const handleEdit = (balance) => {
    setEditingBalance(balance);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingBalance(null);
    setDialogOpen(true);
  };

  const totalDebt = balances.reduce((sum, b) => sum + b.balance, 0);
  const totalMinPayments = balances.reduce(
    (sum, b) => sum + b.minimum_payment,
    0,
  );

  //   console.log("Balances user:", user);
  //   console.log("Balances isLoadingAuth:", isLoadingAuth);
  //   console.log("Balances isLoading:", isLoading);
  //   console.log("Balances balances:", balances);
  //   console.log("Balances error:", error);

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Balances
          </h1>
          <p className="text-muted-foreground mt-1">
            Track loans, debts, and payoff timelines
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" /> Add Balance
        </Button>
      </div>

      {/* Summary */}
      {balances.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-card border rounded-xl p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">Total Debt</p>
            <p className="text-2xl font-bold text-foreground">
              {formatCurrencyExact(totalDebt)}
            </p>
          </div>
          <div className="bg-card border rounded-xl p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">
              Min. Monthly Payments
            </p>
            <p className="text-2xl font-bold text-foreground">
              {formatCurrencyExact(totalMinPayments)}
            </p>
          </div>
          <div className="bg-card border rounded-xl p-4 shadow-sm col-span-2 md:col-span-1">
            <p className="text-sm text-muted-foreground">Active Loans</p>
            <p className="text-2xl font-bold text-foreground">
              {balances.length}
            </p>
          </div>
        </div>
      )}

      {/* Cards */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      ) : balances.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <CreditCard className="w-12 h-12 text-muted-foreground/40 mb-4" />
          <p className="text-lg font-medium text-foreground">No balances yet</p>
          <p className="text-muted-foreground text-sm mt-1">
            Add a loan or debt to start tracking your payoff progress
          </p>
          <Button className="mt-4" onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" /> Add Your First Balance
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <AnimatePresence>
            {balances.map((b) => (
              <BalanceCard
                key={b.id}
                balance={b}
                onEdit={handleEdit}
                onDelete={(bal) => deleteMutation.mutate(bal.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      <BalanceFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSave}
        editingBalance={editingBalance}
      />
    </div>
  );
}
