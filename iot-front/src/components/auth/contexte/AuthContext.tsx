// src/context/AuthContext.tsx
import { createContext, useContext, useEffect, useMemo, useState } from "react"
import axiosClient from "@/components/api/axiosClient"
import { getToken, getUser, saveSession, clearSession, type AuthUser, type AuthPayload } from "@/lib/auth"

type AuthContextType = {
    user: AuthUser | null
    token: string | null
    login: (email: string, password: string) => Promise<void>
    logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null)
    const [token, setToken] = useState<string | null>(null)

    useEffect(() => {
        setUser(getUser())
        setToken(getToken())
    }, [])

    // ✅ Authentification réelle avec le Gateway
    async function login(email: string, password: string) {
        try {
            const response = await axiosClient.post("/auth/login", { email, password });
            const token = response.data?.access_token;
            if (!token) throw new Error("Aucun token reçu depuis le serveur.");

            const user: AuthUser = {
                id: "user_1",
                email,
                name: email.split("@")[0] || "Utilisateur",
            };

            const session: AuthPayload = { token, user };
            saveSession(session);
            setUser(user);
            setToken(token);

            console.info("✅ Connexion réussie :", email);
        } catch (error: any) {
            console.error("❌ Erreur de connexion :", error?.response?.data || error.message);
            throw new Error("Impossible de se connecter. Vérifie ton email et ton mot de passe.");
        }
    }


    function logout() {
        clearSession()
        setUser(null)
        setToken(null)
    }

    const value = useMemo(() => ({ user, token, login, logout }), [user, token])

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthCustom() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error("useAuth must be used within AuthProvider")
    return ctx
}
