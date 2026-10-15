import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { handleFirestoreError, OperationType } from './firestoreErrors';
import { Transaction } from '../types/finance';
import { User } from 'firebase/auth';

/**
 * Creates or updates the user profile record in /users/{userId}
 */
export async function syncUserProfile(user: User): Promise<void> {
  const path = `users/${user.uid}`;
  let existingSnap;

  try {
    const userRef = doc(db, 'users', user.uid);
    existingSnap = await getDoc(userRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }

  if (existingSnap && !existingSnap.exists()) {
    try {
      const userRef = doc(db, 'users', user.uid);
      const safeEmail = (user.email || '').slice(0, 150);
      const safeDisplayName = (user.displayName || 'Anonymous User').slice(0, 100);
      const safePhotoURL = (user.photoURL || '').slice(0, 1000);

      await setDoc(userRef, {
        uid: user.uid,
        email: safeEmail,
        displayName: safeDisplayName,
        photoURL: safePhotoURL,
        createdAt: Date.now(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  }
}

/**
 * Subscribes to real-time changes in /users/{userId}/transactions
 */
export function subscribeUserTransactions(
  userId: string,
  onUpdate: (transactions: Transaction[]) => void,
  onError?: (error: Error) => void
): () => void {
  const collectionPath = `users/${userId}/transactions`;
  const txRef = collection(db, 'users', userId, 'transactions');

  return onSnapshot(
    txRef,
    (snapshot) => {
      const list: Transaction[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          id: data.id || docSnap.id,
          type: data.type,
          title: data.title,
          amount: data.amount,
          categoryId: data.categoryId,
          date: data.date,
          paymentMethod: data.paymentMethod,
          notes: data.notes || '',
          createdAt: data.createdAt || Date.now(),
        });
      });
      // Sort newest first
      list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || b.createdAt - a.createdAt);
      onUpdate(list);
    },
    (error) => {
      console.error('Snapshot listener error on transactions:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, collectionPath);
    }
  );
}

/**
 * Saves or updates a transaction in /users/{userId}/transactions/{transactionId}
 */
export async function saveTransactionToFirestore(
  userId: string,
  transaction: Transaction
): Promise<void> {
  const docPath = `users/${userId}/transactions/${transaction.id}`;
  try {
    const txDocRef = doc(db, 'users', userId, 'transactions', transaction.id);
    await setDoc(txDocRef, {
      id: transaction.id,
      userId,
      type: transaction.type,
      title: transaction.title,
      amount: transaction.amount,
      categoryId: transaction.categoryId,
      date: transaction.date,
      paymentMethod: transaction.paymentMethod,
      notes: transaction.notes || '',
      createdAt: transaction.createdAt || Date.now(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}

/**
 * Deletes a transaction from /users/{userId}/transactions/{transactionId}
 */
export async function deleteTransactionFromFirestore(
  userId: string,
  transactionId: string
): Promise<void> {
  const docPath = `users/${userId}/transactions/${transactionId}`;
  try {
    const txDocRef = doc(db, 'users', userId, 'transactions', transactionId);
    await deleteDoc(txDocRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

/**
 * Fetches user custom budgets & settings from /users/{userId}/settings/preferences
 */
export async function loadUserSettingsFromFirestore(
  userId: string
): Promise<{ categoryBudgets?: Record<string, number>; currencyCode?: string } | null> {
  const docPath = `users/${userId}/settings/preferences`;
  try {
    const settingsDoc = await getDoc(doc(db, 'users', userId, 'settings', 'preferences'));
    if (settingsDoc.exists()) {
      const data = settingsDoc.data();
      return {
        categoryBudgets: data.categoryBudgets,
        currencyCode: data.currencyCode,
      };
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, docPath);
  }
}

/**
 * Saves user custom budgets & settings to /users/{userId}/settings/preferences
 */
export async function saveUserSettingsToFirestore(
  userId: string,
  categoryBudgets: Record<string, number>,
  currencyCode: string
): Promise<void> {
  const docPath = `users/${userId}/settings/preferences`;
  try {
    const settingsRef = doc(db, 'users', userId, 'settings', 'preferences');
    await setDoc(settingsRef, {
      userId,
      categoryBudgets,
      currencyCode,
      updatedAt: Date.now(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}
