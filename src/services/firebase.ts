import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  getDocFromServer,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { AppUser } from '../types';

// 1. Initialize Firebase App
const app = initializeApp(firebaseConfig);

// 2. Initialize Firestore with specific database ID (CRITICAL)
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// 3. Initialize Auth
export const auth = getAuth(app);

// 4. Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// 5. Test Firestore Connection (Diagnostic check)
export interface FirestoreConnectionStatus {
  connected: boolean;
  message: string;
  databaseId: string;
  projectId: string;
  publicationsCount?: number;
}

export async function testFirestoreConnection(): Promise<FirestoreConnectionStatus> {
  const databaseId = firebaseConfig.firestoreDatabaseId;
  const projectId = firebaseConfig.projectId;

  try {
    // 0. Auto-recover from stale/broken auth token if present
    if (auth.currentUser) {
      try {
        await auth.currentUser.getIdToken();
      } catch (tokenErr: unknown) {
        const tokenMsg = tokenErr instanceof Error ? tokenErr.message : String(tokenErr);
        if (
          tokenMsg.includes('token-service-api') ||
          tokenMsg.includes('securetoken.googleapis.com') ||
          tokenMsg.includes('Fetching auth token failed')
        ) {
          console.warn('[Firebase Auth] Stale auth token detected. Resetting session to unblock Firestore.');
          await firebaseSignOut(auth).catch(() => {});
        }
      }
    }

    // 1. Mandatory connection probe from skill
    try {
      await getDocFromServer(doc(db, 'test', 'connection'));
    } catch (e: unknown) {
      if (e instanceof Error && e.message.includes('the client is offline')) {
        // If offline due to an auth token problem, clear session and re-attempt
        if (auth.currentUser) {
          await firebaseSignOut(auth).catch(() => {});
        }
        return {
          connected: false,
          message: "Le client est hors-ligne. Impossible de joindre Cloud Firestore.",
          databaseId,
          projectId,
        };
      }
    }

    return {
      connected: true,
      message: "Connexion Cloud Firestore établie et active.",
      databaseId,
      projectId,
    };
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return {
      connected: false,
      message: `Erreur de connexion : ${errorMsg}`,
      databaseId,
      projectId,
    };
  }
}

// 6. Mandatory Error Handler Specification
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

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// 7. Auth Utilities
export async function loginWithGoogle(): Promise<AppUser | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    try {
      await user.getIdToken();
    } catch (tokenErr: unknown) {
      const tokenMsg = tokenErr instanceof Error ? tokenErr.message : String(tokenErr);
      if (
        tokenMsg.includes('token-service-api') ||
        tokenMsg.includes('securetoken.googleapis.com')
      ) {
        await firebaseSignOut(auth).catch(() => {});
        throw new Error(
          "L'API Token Service (securetoken.googleapis.com) n'est pas encore activée sur le projet Google Cloud 972687729437. Activez-la gratuitement dans la console Google Cloud pour autoriser la connexion Google."
        );
      }
    }
    return await syncUserProfile(user);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (
      msg.includes('token-service-api') ||
      msg.includes('securetoken.googleapis.com')
    ) {
      await firebaseSignOut(auth).catch(() => {});
      throw new Error(
        "L'API Token Service (securetoken.googleapis.com) n'est pas encore activée sur le projet Google Cloud 972687729437. Activez-la gratuitement dans la console Google Cloud pour autoriser la connexion Google."
      );
    }
    console.error('Erreur lors de la connexion Google :', err);
    throw err;
  }
}

export async function logoutUser(): Promise<void> {
  await firebaseSignOut(auth);
}

export async function syncUserProfile(user: FirebaseUser): Promise<AppUser> {
  const userRef = doc(db, 'users', user.uid);
  try {
    const snap = await getDoc(userRef);
    const isAdminUser = user.email === 'zwabloua@gmail.com';

    if (!snap.exists()) {
      const newUser: AppUser = {
        uid: user.uid,
        displayName: user.displayName || 'Résident de Port-Bouët',
        email: user.email,
        photoURL: user.photoURL,
        commune: 'Port-Bouët (Zone pilote)',
        quartier: 'Gonzagueville (Terre Rouge)',
        role: isAdminUser ? 'admin' : 'resident',
      };
      await setDoc(userRef, {
        ...newUser,
        createdAt: new Date().toISOString(),
      });
      return newUser;
    } else {
      const data = snap.data();
      return {
        uid: user.uid,
        displayName: data.displayName || user.displayName,
        email: data.email || user.email,
        photoURL: data.photoURL || user.photoURL,
        commune: data.commune || 'Port-Bouët (Zone pilote)',
        quartier: data.quartier || 'Gonzagueville (Terre Rouge)',
        role: isAdminUser ? 'admin' : (data.role || 'resident'),
      };
    }
  } catch (err) {
    console.warn("Impossible de synchroniser le profil dans Firestore :", err);
    return {
      uid: user.uid,
      displayName: user.displayName || 'Résident',
      email: user.email,
      photoURL: user.photoURL,
      commune: 'Port-Bouët (Zone pilote)',
      quartier: 'Gonzagueville (Terre Rouge)',
      role: user.email === 'zwabloua@gmail.com' ? 'admin' : 'resident',
    };
  }
}

// 8. Auth State Listener Hook helper
export function subscribeToAuthChanges(callback: (user: AppUser | null, loading: boolean) => void) {
  return onAuthStateChanged(
    auth,
    async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Probe token validity to avoid blocking Firestore with invalid token
          await firebaseUser.getIdToken();
          const appUser = await syncUserProfile(firebaseUser);
          callback(appUser, false);
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          console.warn('[Auth] Error probing user token:', msg);
          if (
            msg.includes('token-service-api') ||
            msg.includes('securetoken.googleapis.com') ||
            msg.includes('Fetching auth token failed')
          ) {
            console.warn('[Auth] Token Service API disabled on GCP project. Signing out to unblock Firestore.');
            await firebaseSignOut(auth).catch(() => {});
            callback(null, false);
          } else {
            callback(
              {
                uid: firebaseUser.uid,
                displayName: firebaseUser.displayName || 'Résident',
                email: firebaseUser.email,
                photoURL: firebaseUser.photoURL,
                commune: 'Port-Bouët (Zone pilote)',
                quartier: 'Gonzagueville (Terre Rouge)',
                role: firebaseUser.email === 'zwabloua@gmail.com' ? 'admin' : 'resident',
              },
              false
            );
          }
        }
      } else {
        callback(null, false);
      }
    },
    (authErr) => {
      console.warn('[Auth] onAuthStateChanged error:', authErr);
      callback(null, false);
    }
  );
}
