import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { calculateCO2 } from "../utils/carbonCalc";

const LOGS_COLLECTION = "logs";

/**
 * Add a new carbon log entry for a user.
 * @param {string} uid
 * @param {{type: string, subtype: string, value: number, date: string}} entry
 */
export async function addLog(uid, entry) {
  const co2Kg = calculateCO2(entry.type, entry.subtype, entry.value);
  return addDoc(collection(db, LOGS_COLLECTION), {
    uid,
    type: entry.type,
    subtype: entry.subtype,
    value: Number(entry.value),
    co2Kg,
    date: entry.date, // "YYYY-MM-DD"
    createdAt: Timestamp.now(),
  });
}

/**
 * Subscribe to a user's logs in real time, most recent first.
 * Returns the unsubscribe function — call it on component unmount.
 * @param {string} uid
 * @param {(logs: Array) => void} callback
 */
export function subscribeToLogs(uid, callback) {
  const q = query(
    collection(db, LOGS_COLLECTION),
    where("uid", "==", uid),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snapshot) => {
    const logs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    callback(logs);
  });
}

/**
 * Filter logs to the last N days (inclusive of today).
 */
export function lastNDays(logs, n = 7) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - n);
  const cutoffStr = cutoff.toISOString().split("T")[0];
  return logs.filter((log) => log.date >= cutoffStr);
}
