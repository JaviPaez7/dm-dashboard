import React, { createContext, useContext, useEffect, useState } from "react";
import pb from "../lib/pb";

const AuthContext = createContext({});

const mapUser = (record) => {
  if (!record) return null;
  return {
    uid: record.id,
    id: record.id,
    email: record.email,
    isAnonymous: false,
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recoveryMode, setRecoveryMode] = useState(false);

  useEffect(() => {
    if (pb.authStore.isValid && pb.authStore.record) {
      setUser(mapUser(pb.authStore.record));
    }
    setLoading(false);

    const unsubscribe = pb.authStore.onChange((_token, record) => {
      setUser(mapUser(record));
    });

    return () => unsubscribe();
  }, []);

  const value = {
    signUp: async ({ email, password }) => {
      try {
        const created = await pb.collection("users").create({
          email,
          password,
          passwordConfirm: password,
        });
        await pb.collection("users").authWithPassword(email, password);
        return { data: created, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },
    signIn: async ({ email, password }) => {
      try {
        const data = await pb.collection("users").authWithPassword(email, password);
        return { data, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },
    resetPassword: async (email) => {
      try {
        await pb.collection("users").requestPasswordReset(email);
        return { error: null };
      } catch (error) {
        return { error };
      }
    },
    updatePassword: async () => {
      try {
        throw pb.authStore.record
          ? new Error("Usa la opción de 'Olvidé mi contraseña' para cambiarla.")
          : new Error("No hay ningún usuario autenticado.");
      } catch (error) {
        return { error };
      }
    },
    signOut: async () => {
      setRecoveryMode(false);
      try {
        pb.authStore.clear();
        setUser(null);
        return { error: null };
      } catch (error) {
        return { error };
      }
    },
    signInWithGoogle: async () => {
      try {
        const data = await pb.collection("users").authWithOAuth2({ provider: "google" });
        return { data, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },
    signInAnonymously: async () => {
      try {
        const anon = {
          uid: `anon_${Date.now()}`,
          id: `anon_${Date.now()}`,
          email: null,
          isAnonymous: true,
        };
        setUser(anon);
        return { data: anon, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },
    user,
    loading,
    recoveryMode,
    setRecoveryMode,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
