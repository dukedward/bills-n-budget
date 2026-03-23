import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { queryClientInstance } from "@/lib/query-client";
import { useAuth } from "@/lib/AuthContext";
import {
  listIncome,
  createIncome,
  updateIncome,
  deleteIncome,
} from "@/api/income";
import IncomeCard from "@/components/income/IncomeCard";
import IncomeFormDialog from "@/components/income/IncomeFormDialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function Income() {
  const { user } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);

  const {
    data: incomes = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["income", user?.uid],
    queryFn: () => listIncome(user.uid),
    enabled: !!user?.uid,
  });

  const createMutation = useMutation({
    mutationFn: (data) => createIncome({ ...data, user_uid: user.uid }),
    onSuccess: () => {
      queryClientInstance.invalidateQueries({ queryKey: ["income", user.uid] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateIncome(id, data),
    onSuccess: () => {
      queryClientInstance.invalidateQueries({ queryKey: ["income", user.uid] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteIncome,
    onSuccess: () => {
      queryClientInstance.invalidateQueries({ queryKey: ["income", user.uid] });
    },
  });

  const handleSave = async (data) => {
    if (editingIncome) {
      await updateMutation.mutateAsync({ id: editingIncome.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
    setEditingIncome(null);
  };

  const handleEdit = (income) => {
    setEditingIncome(income);
    setDialogOpen(true);
  };

  const handleDelete = async (incomeId) => {
    await deleteMutation.mutateAsync(incomeId);
  };

  if (isLoading) {
    return (
      <div className="p-6 md:p-10 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
      </div>
    );
  }

  // console.log("Income user:", user);
  // console.log("Income isLoadingAuth:", isLoadingAuth);
  // console.log("Income isLoading:", isLoading);
  // console.log("Income income:", incomes);
  // console.log("Income error:", error);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Income
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your income sources
          </p>
        </div>

        <Button
          onClick={() => {
            setEditingIncome(null);
            setDialogOpen(true);
          }}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Income
        </Button>
      </div>

      {incomes.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground mb-4">
            No income sources yet. Add your first income source.
          </p>
          <Button
            onClick={() => {
              setEditingIncome(null);
              setDialogOpen(true);
            }}
          >
            Add Income
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {incomes.map((income) => (
            <IncomeCard
              key={income.id}
              income={income}
              onEdit={() => handleEdit(income)}
              onDelete={() => handleDelete(income.id)}
            />
          ))}
        </div>
      )}

      <IncomeFormDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingIncome(null);
        }}
        onSave={handleSave}
        editingIncome={editingIncome}
      />
    </div>
  );
}
