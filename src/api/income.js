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

export async function listIncome(userUid) {
  const q = query(
    collection(db, "income"),
    where("user_uid", "==", userUid),
    orderBy("created_at", "desc")
  );

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function createIncome(data) {
  const now = Date.now();

  const ref = await addDoc(collection(db, "income"), {
    ...data,
    created_at: now,
    updated_at: now,
  });

  return ref.id;
}

export async function updateIncome(id, data) {
  await updateDoc(doc(db, "income", id), {
    ...data,
    updated_at: Date.now(),
  });
}

export async function deleteIncome(id) {
  await deleteDoc(doc(db, "income", id));
}