/**
 * CRYSIS OS Firebase Service
 * Handles all Firebase operations: Authentication and Firestore
 */

import { initializeApp } from "firebase/app";
import {
  getAuth,
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import {
  getFirestore,
  connectFirestoreEmulator,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
  doc,
  serverTimestamp
} from "firebase/firestore";

// ⚠️ IMPORTANT: Replace with your actual Firebase config
// Get this from https://console.firebase.google.com
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "crysis-os.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "crysis-os-demo",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "crysis-os.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "000000000000",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:000000000000:web:0000000000000000000000"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Enable emulators in development (optional)
// Uncomment these lines to use Firebase emulators locally
/*
if (window.location.hostname === 'localhost') {
  connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, 'localhost', 8080);
}
*/

/**
 * Authentication Service
 */
export const authService = {
  // Register a new user
  register: async (email, password) => {
    return await createUserWithEmailAndPassword(auth, email, password);
  },

  // Login existing user
  login: async (email, password) => {
    return await signInWithEmailAndPassword(auth, email, password);
  },

  // Logout current user
  logout: async () => {
    return await signOut(auth);
  },

  // Get current user
  getCurrentUser: () => {
    return auth.currentUser;
  },

  // Listen to auth changes
  onAuthChange: (callback) => {
    return onAuthStateChanged(auth, callback);
  }
};

/**
 * Incident Service - Firestore Operations
 */
export const incidentService = {
  // Create new incident
  createIncident: async (incidentData) => {
    try {
      // Remove any local ID to avoid conflicts with Firestore ID
      const { id: localId, ...dataWithoutId } = incidentData || {};
      
      const docRef = await addDoc(collection(db, "incidents"), {
        ...dataWithoutId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: "open"
      });
      
      // Return with the FIRESTORE-generated ID (not the local one)
      const result = { ...dataWithoutId, id: docRef.id };
      console.log("✅ Incident created in Firebase with ID:", docRef.id);
      return result;
    } catch (error) {
      console.error("❌ Error creating incident:", error);
      throw error;
    }
  },

  // Get all incidents
  getIncidents: async () => {
    try {
      const q = query(
        collection(db, "incidents"),
        orderBy("createdAt", "desc"),
        limit(100)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error fetching incidents:", error);
      return [];
    }
  },

  // Get incidents by status
  getIncidentsByStatus: async (status) => {
    try {
      const q = query(
        collection(db, "incidents"),
        where("status", "==", status),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error fetching incidents by status:", error);
      return [];
    }
  },

  // Get incidents by type
  getIncidentsByType: async (type) => {
    try {
      const q = query(
        collection(db, "incidents"),
        where("type", "==", type),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error fetching incidents by type:", error);
      return [];
    }
  },

  // Update incident
  updateIncident: async (incidentId, updates) => {
    try {
      if (!incidentId) {
        throw new Error("No incident ID provided for update");
      }
      
      console.log(`🔄 Updating incident ${incidentId} with:`, updates);
      
      const docRef = doc(db, "incidents", incidentId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      
      console.log(`✅ Incident ${incidentId} updated successfully`);
      return { id: incidentId, ...updates };
    } catch (error) {
      console.error(`❌ Error updating incident ${incidentId}:`, error.message);
      throw new Error(`Failed to update incident: ${error.message}`);
    }
  }
};

/**
 * User Service - Firestore User Profiles
 */
export const userService = {
  // Create or update user profile
  setUserProfile: async (userId, userData) => {
    try {
      const docRef = doc(db, "users", userId);
      await updateDoc(docRef, {
        ...userData,
        updatedAt: serverTimestamp()
      });
      return { id: userId, ...userData };
    } catch (error) {
      console.error("Error setting user profile:", error);
      throw error;
    }
  },

  // Get user profile
  getUserProfile: async (userId) => {
    try {
      const docRef = doc(db, "users", userId);
      const snapshot = await getDocs(query(collection(db, "users"), where("uid", "==", userId)));
      if (snapshot.empty) return null;
      return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    } catch (error) {
      console.error("Error getting user profile:", error);
      return null;
    }
  }
};

export default { authService, incidentService, userService };
