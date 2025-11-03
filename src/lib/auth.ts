// src/lib/auth.ts
export type AuthUser = { id: string; email: string; name?: string }
export type AuthPayload = { token: string; user: AuthUser }

const KEY = "session_token"
const USER_KEY = "session_user"

export function saveSession({ token, user }: AuthPayload) {
    sessionStorage.setItem(KEY, token)
    sessionStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearSession() {
    sessionStorage.removeItem(KEY)
    sessionStorage.removeItem(USER_KEY)
}

export function getToken(): string | null {
    return sessionStorage.getItem(KEY)
}

export function getUser(): AuthUser | null {
    const raw = sessionStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as AuthUser) : null
}
