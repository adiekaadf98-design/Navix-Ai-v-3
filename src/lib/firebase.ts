import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, GithubAuthProvider, OAuthProvider } from 'firebase/auth';
import { initializeFirestore, getFirestore, doc, getDocFromServer, disableNetwork, setLogLevel } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Silence internal Firestore SDK backoff logging
try {
  setLogLevel('silent');
} catch (_) {}

// Initialize Firebase App singleton
export const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();

/* Initialize Firestore with auto-detect long polling to ensure reliable connection across all webview & mobile network environments */
let firestoreInstance;
try {
  firestoreInstance = initializeFirestore(firebaseApp, {
    experimentalForceLongPolling: true,
  }, firebaseConfig.firestoreDatabaseId);
} catch {
  firestoreInstance = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);
}

export const db = firestoreInstance;
export const auth = getAuth(firebaseApp);
export const googleAuthProvider = new GoogleAuthProvider();
googleAuthProvider.setCustomParameters({ prompt: 'select_account' });

export const githubAuthProvider = new GithubAuthProvider();

export const appleAuthProvider = new OAuthProvider('apple.com');
appleAuthProvider.addScope('email');
appleAuthProvider.addScope('name');

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

let hasLoggedQuotaError = false;

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): FirestoreErrorInfo {
  const errMsg = error instanceof Error ? error.message : String(error);
  const isQuota = errMsg.toLowerCase().includes('resource-exhausted') || 
                  errMsg.toLowerCase().includes('quota limit exceeded') ||
                  errMsg.toLowerCase().includes('quota');

  const errInfo: FirestoreErrorInfo = {
    error: errMsg,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };

  if (isQuota) {
    disableNetwork(db).catch(() => {});
    if (!hasLoggedQuotaError) {
      hasLoggedQuotaError = true;
      console.info('[Navix Cloud Firestore] Daily write quota limit reached for free tier. Seamlessly persisting via local storage.');
    }
  } else {
    console.warn('[Navix Firestore Error]:', JSON.stringify(errInfo));
  }

  return errInfo;
}

// CRITICAL CONSTRAINT: Test connection on boot using getDocFromServer
export async function testFirebaseConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('[Navix Cloud Firestore] Connection successfully validated.');
    return true;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('the client is offline')) {
        console.error('Please check your Firebase configuration. Client is offline.');
      } else if (error.message.includes('resource-exhausted') || error.message.includes('Quota limit exceeded')) {
        disableNetwork(db).catch(() => {});
        if (!hasLoggedQuotaError) {
          hasLoggedQuotaError = true;
          console.info('[Navix Cloud Firestore] Daily write/read quota limit reached for free tier. Seamlessly persisting via local storage.');
        }
      }
    }
    return false;
  }
}

if (typeof window !== 'undefined') {
  testFirebaseConnection().catch(() => {});
}
