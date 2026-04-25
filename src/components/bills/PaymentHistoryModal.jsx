import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrencyExact } from "@/lib/budgetUtils";
import { format } from "date-fns";
import { CheckCircle2 } from "lucide-react";
import { filterPayments } from "../../api/payments";
import { parseLocalDate } from "@/lib/utils";

export default function PaymentHistoryModal({
  bill,
  open,
  onOpenChange,
  userUid,
}) {
  const {
    data: payments = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["billPayments", bill?.id, userUid],
    queryFn: () =>
      filterPayments({
        bill_id: bill.id,
        user_uid: userUid,
      }),
    enabled: !!bill && !!userUid && open,
  });

  // console.log("Payment bills:", bill);
  // console.log("Payment error:", error);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Payment History — {bill?.name}</DialogTitle>
          <DialogDescription>
            Previous recorded payments for this bill.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <p className="text-sm text-muted-foreground py-4">Loading...</p>
        ) : payments.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">
            No payment history yet.
          </p>
        ) : (
          <ul className="space-y-2 max-h-96 overflow-y-auto py-2">
            {payments.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <div>
                    <p className="text-sm font-medium">
                      {format(parseLocalDate(p.paid_date), "MMM d, yyyy")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {p.period_year}/{String(p.period_month).padStart(2, "0")}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-semibold">
                  {formatCurrencyExact(p.amount)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}
