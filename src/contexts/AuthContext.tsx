import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../lib/firebase";

export type UserRole = "farmer" | "buyer" | "transporter" | "admin";

interface User {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  location?: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  login: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string, role: UserRole, phone: string, location: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  updateUserRole: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch user profile from Firestore
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        if (userDoc.exists()) {
          setUser(userDoc.data() as User);
        } else {
          // If profile doesn't exist, we might need the user to choose a role first
          // For now, we'll set a partial user and handle role selection in UI
          setUser({
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || "User",
            email: firebaseUser.email || "",
            role: "buyer" // Default to buyer if not specifically set
          });
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      
      const userRef = doc(db, "users", firebaseUser.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        const newUser: User = {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || "User",
          email: firebaseUser.email || "",
          role: "buyer" // Default role
        };
        await setDoc(userRef, {
          ...newUser,
          joinedAt: serverTimestamp()
        });
        setUser(newUser);
      } else {
        setUser(userDoc.data() as User);
      }
    } catch (error: any) {
      console.error("Login Error:", error);
      throw error;
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, pass);
      const firebaseUser = result.user;
      const userRef = doc(db, "users", firebaseUser.uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        setUser(userDoc.data() as User);
      }
    } catch (error: any) {
      console.error("Email Login Error:", error);
      throw error;
    }
  };

  const registerWithEmail = async (email: string, pass: string, name: string, role: UserRole, phone: string, location: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, pass);
      const firebaseUser = result.user;
      const newUser: User = {
        uid: firebaseUser.uid,
        name,
        email,
        role,
        phone,
        location
      };
      await setDoc(doc(db, "users", firebaseUser.uid), {
        ...newUser,
        joinedAt: serverTimestamp()
      });
      setUser(newUser);
    } catch (error: any) {
      console.error("Registration Error:", error);
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const updateUserRole = async (role: UserRole) => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    await setDoc(userRef, { role }, { merge: true });
    setUser({ ...user, role });
  };

  return (
    <AuthContext.Provider value={{ user, login, loginWithEmail, registerWithEmail, logout, isLoading, updateUserRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
