
import React from 'react';
import { AppState, Team, Submission, UserRole, SubmissionStatus, SystemSettings } from './types';
import { db, auth } from './firebase';
import { 
  doc, 
  onSnapshot, 
  setDoc, 
  collection, 
  deleteDoc,
  query,
  where,
  getDocs
} from "firebase/firestore";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from "firebase/auth";

const STORAGE_KEY_USER = 'Vibexathon_26_session';

const DEFAULT_SETTINGS: SystemSettings = {
  isSubmissionPortalEnabled: true,
  isJudgePortalEnabled: true,
  submissionDeadline: Date.now() + 1000 * 60 * 60 * 24 * 7,
};

const DEFAULT_STATE: AppState = {
  currentUser: null,
  teams: [],
  submissions: [],
  settings: DEFAULT_SETTINGS,
};

/**
 * Recursively converts an object to a plain JavaScript object.
 * Specifically handles Firestore Timestamps by converting them to milliseconds.
 * This prevents "Converting circular structure to JSON" errors during serialization.
 */
const toPlain = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') return obj;

  // Handle Firestore Timestamp (checking for common properties used in minified SDKs)
  if (
    (obj.seconds !== undefined && obj.nanoseconds !== undefined) || 
    (typeof obj.toMillis === 'function')
  ) {
    return typeof obj.toMillis === 'function' ? obj.toMillis() : obj.seconds * 1000;
  }

  // Handle Date objects
  if (obj instanceof Date) return obj.getTime();

  // Handle Arrays
  if (Array.isArray(obj)) return obj.map(toPlain);

  // Handle plain Objects
  const plain: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      plain[key] = toPlain(obj[key]);
    }
  }
  return plain;
};

export const useStore = () => {
  const [state, setState] = React.useState<AppState>(DEFAULT_STATE);
  const [isLoading, setIsLoading] = React.useState(true); // Enable loading for Firebase initialization
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [lastSync, setLastSync] = React.useState<Date | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  // Handle Firebase Authentication state changes
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        try {
          // Fetch user data from Firestore
          const userDoc = await getDocs(query(collection(db, "users"), where("email", "==", user.email)));
          if (!userDoc.empty) {
            const userData = userDoc.docs[0].data();
            setState(prev => ({
              ...prev,
              currentUser: {
                id: user.uid,
                role: userData.role || UserRole.PARTICIPANT,
                teamId: userData.teamId
              }
            }));
          } else {
            // User exists in auth but not in Firestore users collection
            setState(prev => ({ ...prev, currentUser: null }));
          }
        } catch (err: any) {
          console.error("Error fetching user data:", err);
          setError(`Authentication error: ${err.message}`);
        }
      } else {
        setState(prev => ({ ...prev, currentUser: null }));
      }
      // Always set loading to false after auth check completes
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
    // Sync System Settings
    const unsubSettings = onSnapshot(doc(db, "config", "settings"), (docSnap) => {
      if (docSnap.exists()) {
        const settings = toPlain(docSnap.data()) as SystemSettings;
        setState(prev => ({ ...prev, settings }));
      } else {
        setDoc(doc(db, "config", "settings"), DEFAULT_SETTINGS);
      }
    }, (err) => {
      console.error("Settings sync error:", err);
      setError("Database connection failed. Please check your Firebase config.");
    });

    // Sync Teams
    const unsubTeams = onSnapshot(collection(db, "teams"), (querySnapshot) => {
      const teams: Team[] = [];
      querySnapshot.forEach((doc) => {
        teams.push(toPlain({ id: doc.id, ...doc.data() }) as Team);
      });
      setState(prev => ({ ...prev, teams }));
      setLastSync(new Date());
    }, (err) => {
      console.error("Teams sync error:", err);
    });

    // Sync Submissions
    const unsubSubmissions = onSnapshot(collection(db, "submissions"), (querySnapshot) => {
      const submissions: Submission[] = [];
      querySnapshot.forEach((doc) => {
        submissions.push(toPlain({ id: doc.id, ...doc.data() }) as Submission);
      });
      setState(prev => ({ ...prev, submissions }));
    }, (err) => {
      console.error("Submissions sync error:", err);
    });

    return () => {
      unsubSettings();
      unsubTeams();
      unsubSubmissions();
    };
  }, []);

  const updateState = async (updater: (prev: AppState) => AppState) => {
    setIsSyncing(true);
    setError(null);

    const prevState = state;
    // Get the new state from the updater
    const rawNewState = updater(state);
    // Sanitize the new state to ensure no circular references or complex objects enter
    const newState = toPlain(rawNewState) as AppState;
    
    try {
      // Helper function to remove undefined values from objects (Firestore doesn't accept undefined)
      const cleanForFirestore = (obj: any): any => {
        if (obj === null || obj === undefined) return null;
        if (Array.isArray(obj)) return obj.map(cleanForFirestore);
        if (typeof obj === 'object') {
          const cleaned: any = {};
          for (const key in obj) {
            if (obj[key] !== undefined) {
              cleaned[key] = cleanForFirestore(obj[key]);
            }
          }
          return cleaned;
        }
        return obj;
      };

      // 1. Persist Settings
      if (JSON.stringify(newState.settings) !== JSON.stringify(prevState.settings)) {
        await setDoc(doc(db, "config", "settings"), cleanForFirestore(newState.settings));
      }

      // 2. Persist Team Changes
      for (const team of newState.teams) {
        const prevTeam = prevState.teams.find(t => t.id === team.id);
        // Only push to Firestore if data actually changed
        if (!prevTeam || JSON.stringify(team) !== JSON.stringify(prevTeam)) {
          await setDoc(doc(db, "teams", team.id), cleanForFirestore(team));
        }
      }

      // 3. Persist Submission Changes
      for (const sub of newState.submissions) {
        const prevSub = prevState.submissions.find(s => s.id === sub.id);
        if (!prevSub || JSON.stringify(sub) !== JSON.stringify(prevSub)) {
          await setDoc(doc(db, "submissions", sub.id), cleanForFirestore(sub));
        }
      }

      // 4. Handle Deletions
      if (newState.teams.length < prevState.teams.length) {
        const deletedTeams = prevState.teams.filter(t => !newState.teams.some(nt => nt.id === t.id));
        for (const t of deletedTeams) {
          await deleteDoc(doc(db, "teams", t.id));
          // Clean up related submissions
          const sub = prevState.submissions.find(s => s.teamId === t.id);
          if (sub) await deleteDoc(doc(db, "submissions", sub.id));
        }
      }

      setState(newState);
      setLastSync(new Date());
    } catch (e: any) {
      console.error("Firestore sync error:", e);
      setError(`Sync Error: ${e.message || "Unknown error occurred during sync"}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // Firebase Authentication Methods
  const login = async (email: string, password: string) => {
    try {
      setIsSyncing(true);
      setError(null);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Fetch user data from Firestore
      const userDoc = await getDocs(query(collection(db, "users"), where("email", "==", email)));
      if (!userDoc.empty) {
        const userData = userDoc.docs[0].data();
        setState(prev => ({
          ...prev,
          currentUser: {
            id: user.uid,
            role: userData.role || UserRole.PARTICIPANT,
            teamId: userData.teamId
          }
        }));
      }
      
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.code === 'auth/user-not-found' 
        ? 'No account found with this email.' 
        : error.code === 'auth/wrong-password' 
        ? 'Incorrect password.' 
        : error.message;
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsSyncing(false);
    }
  };

  const register = async (email: string, password: string, userData: any) => {
    try {
      setIsSyncing(true);
      setError(null);
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Store user data in Firestore
      await setDoc(doc(db, "users", user.uid), {
        email: email,
        ...userData,
        createdAt: new Date().toISOString()
      });
      
      setState(prev => ({
        ...prev,
        currentUser: {
          id: user.uid,
          role: userData.role || UserRole.PARTICIPANT,
          teamId: userData.teamId
        }
      }));
      
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.code === 'auth/email-already-in-use' 
        ? 'An account with this email already exists.' 
        : error.message;
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsSyncing(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setState(prev => ({ ...prev, currentUser: null }));
      return { success: true };
    } catch (error: any) {
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  return { 
    state, 
    updateState, 
    login, 
    register, 
    logout,
    isLoading, 
    isSyncing, 
    lastSync, 
    error, 
    refresh: () => {} 
  };
};
