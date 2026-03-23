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

export async function listBills(userUid) {
  const q = query(
    collection(db, "bills"),
    where("user_uid", "==", userUid),
    orderBy("created_at", "desc"),
  );

  const snap = await getDocs(q);

  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
}

export async function createBill(data) {
  const now = Date.now();

  const ref = await addDoc(collection(db, "bills"), {
    name: data.name ?? "",
    amount: Number(data.amount ?? 0),
    category: data.category ?? "other",
    frequency: data.frequency ?? "monthly",
    due_date: data.due_date ?? "",
    notes: data.notes ?? "",
    is_paid: data.is_paid ?? false,
    user_uid: data.user_uid,
    created_at: now,
    updated_at: now,
  });

  return ref.id;
}

export async function updateBill(id, data) {
  await updateDoc(doc(db, "bills", id), {
    ...data,
    updated_at: Date.now(),
  });
}

export async function deleteBill(id) {
  await deleteDoc(doc(db, "bills", id));
}
