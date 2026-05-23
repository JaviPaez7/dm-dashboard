import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  sendPasswordResetEmail, 
  updatePassword as updateFirebasePassword,
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously as firebaseSignInAnonymously
} from 'firebase/auth';
import { auth } from '../lib/firebase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recoveryMode, setRecoveryMode] = useState(false);

  useEffect(() => {
    // Escuchar cambios de estado de autenticación en Firebase
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    // En Firebase, el flujo de recuperación de contraseña suele ocurrir
    // en una página externa gestionada por Firebase, por lo que recoveryMode
    // no se activará automáticamente a menos que implementemos un manejador de enlaces
    // personalizado. Dejamos el estado por compatibilidad de tipos.
    return () => unsubscribe();
  }, []);

  const value = {
    signUp: async ({ email, password }) => {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        return { data: userCredential, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },
    signIn: async ({ email, password }) => {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { data: userCredential, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },
    resetPassword: async (email) => {
      try {
        await sendPasswordResetEmail(auth, email);
        return { error: null };
      } catch (error) {
        return { error };
      }
    },
    updatePassword: async (newPassword) => {
      try {
        if (!auth.currentUser) throw new Error("No hay ningún usuario autenticado.");
        await updateFirebasePassword(auth.currentUser, newPassword);
        return { error: null };
      } catch (error) {
        return { error };
      }
    },
    signOut: async () => {
      setRecoveryMode(false);
      try {
        await firebaseSignOut(auth);
        return { error: null };
      } catch (error) {
        return { error };
      }
    },
    signInWithGoogle: async () => {
      const provider = new GoogleAuthProvider();
      try {
        const userCredential = await signInWithPopup(auth, provider);
        return { data: userCredential, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },
    signInAnonymously: async () => {
      try {
        const userCredential = await firebaseSignInAnonymously(auth);
        return { data: userCredential, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },
    user: user ? {
      uid: user.uid,
      id: user.uid,
      email: user.email,
      isAnonymous: user.isAnonymous
    } : null,
    loading,
    recoveryMode,
    setRecoveryMode
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
