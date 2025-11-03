// src/context/AuthContext.tsx
import { createContext, useContext, useEffect, useMemo, useState } from "react"
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

    // ✅ Accepte n'importe quel email/mot de passe et crée une session
    async function login(email: string, _password: string) {
        const data: AuthPayload = {
            token: "dev-session-token",
            user: { id: "u_any", email, name: email.split("@")[0] || "User" },
        }
        saveSession(data)
        setUser(data.user)
        setToken(data.token)
    }

    function logout() {
        clearSession()
        setUser(null)
        setToken(null)
    }

    const value = useMemo(() => ({ user, token, login, logout }), [user, token])
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuthCustom() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error("useAuth must be used within AuthProvider")
    return ctx
}
