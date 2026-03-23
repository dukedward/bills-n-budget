import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const DEFAULT_ALERT_SETTINGS = {
  email_alerts_enabled: false,
  alert_email: "",
  sms_alerts_enabled: false,
  alert_phone: "",
  days_before_due: 3,
  overdue_alerts: true,
};

export async function getAlertSettings(uid, fallbackEmail = "") {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    return {
      ...DEFAULT_ALERT_SETTINGS,
      alert_email: fallbackEmail,
    };
  }

  const data = snap.data();

  return {
    ...DEFAULT_ALERT_SETTINGS,
    alert_email: fallbackEmail,
    ...(data.alert_settings || {}),
  };
}

export async function saveAlertSettings(uid, settings, userProfile = {}) {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);

  const payload = {
    ...userProfile,
    alert_settings: settings,
    updated_at: Date.now(),
  };

  if (snap.exists()) {
    await updateDoc(userRef, payload);
  } else {
    await setDoc(userRef, payload, { merge: true });
  }
}
