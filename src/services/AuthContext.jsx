import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";

import { auth } from "./firebase";

const AuthContext = createContext(null);

function normalizeClaims(claims) {
  const nivelAcesso = claims.nivelAcesso === "Usuário"
    ? "Vendedor"
    : claims.nivelAcesso === "Gerente"
      ? "Desenvolvedor"
      : claims.nivelAcesso || "Vendedor";

  return { ...claims, nivelAcesso };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [claims, setClaims] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        const token = await currentUser.getIdTokenResult(true);
        setClaims(normalizeClaims(token.claims));
      } else {
        setClaims({});
      }

      setLoading(false);
    });
  }, []);

  const value = {
    user,
    claims,
    loading,
    logout: () => signOut(auth),
    reloadUser: async () => {
      if (!auth.currentUser) return;
      await auth.currentUser.reload();
      setUser(auth.currentUser);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}