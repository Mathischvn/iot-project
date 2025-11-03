// src/components/RequireAuth.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom"
import {useAuthCustom} from "@/components/auth/contexte/AuthContext.tsx";

export default function RequireAuth() {
    const { token } = useAuthCustom()
    const location = useLocation()
    if (!token) {
        return <Navigate to="/login" replace state={{ from: location }} />
    }
    return <Outlet />
}
