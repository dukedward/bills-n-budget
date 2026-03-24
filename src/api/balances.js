import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function listBalances(userUid) {
  const q = query(
    collection(db, "balances"),
    where("user_uid", "==", userUid),
    orderBy("created_at", "desc"),
  );

  const snap = await getDocs(q);

  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
}

export async function createBalance(data) {
  const now = Date.now();

  const ref = await addDoc(collection(db, "balances"), {
    name: data.name ?? "",
    balance: Number(data.balance ?? 0),
    original_amount: Number(data.original_amount ?? 0),
    apr: Number(data.apr ?? 0),
    minimum_payment: Number(data.minimum_payment ?? 0),
    loan_term_months: Number(data.loan_term_months ?? 0),
    type: data.type ?? "other",
    start_date: data.start ?? "",
    notes: data.notes ?? "",
    user_uid: data.user_uid,
    created_at: now,
    updated_at: now,
  });

  return ref.id;
}

export async function updateBalance(id, data) {
  await updateDoc(doc(db, "balances", id), {
    ...data,
    updated_at: Date.now(),
  });
}

export async function deleteBalance(id) {
  await deleteDoc(doc(db, "balances", id));
}
