import { useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { LoginForm } from "@/components/login-form"
import {useAuthCustom} from "@/components/auth/contexte/AuthContext.tsx";

// @ts-ignore
export default function Login() {
    const { login, token } = useAuthCustom()
    const navigate = useNavigate()
    const location = useLocation();
    const from = location.state?.from?.pathname || "/"

    useEffect(() => {
        if (token) navigate(from, { replace: true })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    async function handleLogin({ email, password }: { email: string; password: string }) {
        await login(email, password)
        navigate(from, { replace: true })
    }

    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
                <LoginForm onSubmit={handleLogin} />
            </div>
        </div>
    )
}
