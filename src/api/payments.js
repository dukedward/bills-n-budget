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
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function listPayments(userUid) {
  const q = query(
    collection(db, "payments"),
    where("user_uid", "==", userUid),
    orderBy("created_at", "desc"),
  );

  const snap = await getDocs(q);

  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
}

export async function filterPayments(filters = {}) {
  const constraints = [];

  if (filters.user_uid) {
    constraints.push(where("user_uid", "==", filters.user_uid));
  }

  if (filters.bill_id) {
    constraints.push(where("bill_id", "==", filters.bill_id));
  }

  constraints.push(orderBy("paid_date", "desc"));

  const q = query(collection(db, "payments"), ...constraints);

  const snap = await getDocs(q);

  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
}

export async function createPayment(data) {
  const ref = await addDoc(collection(db, "payments"), {
    bill_id: data.bill_id ?? "",
    bill_name: data.bill_name ?? "",
    amount: Number(data.amount ?? 0),
    paid_date: data.paid_date ?? "",
    period_year: Number(data.period_year ?? new Date().getFullYear()),
    period_month: Number(data.period_month ?? new Date().getMonth() + 1),
    user_uid: data.user_uid ?? "",
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  });

  return ref.id;
}

export async function updatePayment(id, data) {
  await updateDoc(doc(db, "payments", id), {
    ...data,
    updated_at: serverTimestamp(),
  });
}

export async function deletePayment(id) {
  await deleteDoc(doc(db, "payments", id));
}
