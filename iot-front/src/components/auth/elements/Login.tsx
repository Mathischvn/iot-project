// src/pages/Login.tsx
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {useAuthCustom} from "@/components/auth/contexte/AuthContext.tsx";

export default function Login() {
    const { login, token } = useAuthCustom();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [mode, setMode] = useState<"login" | "register">("login");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (token) navigate(from, { replace: true });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            if (mode === "register") {
                await fetch("http://localhost:3000/auth/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password }),
                });
            }
            await login(email, password);
            navigate(from, { replace: true });
        } catch (err) {
            setError("Échec de la connexion ou de l'inscription.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm bg-white p-6 rounded-xl shadow-md space-y-4">
                <h1 className="text-xl font-semibold text-center">
                    {mode === "login" ? "Connexion" : "Inscription"}
                </h1>

                <form onSubmit={handleSubmit} className="space-y-3">
                    <Input
                        type="email"
                        placeholder="Adresse e-mail"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <Input
                        type="password"
                        placeholder="Mot de passe"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    {error && <p className="text-sm text-red-500">{error}</p>}

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading
                            ? "Chargement..."
                            : mode === "login"
                                ? "Se connecter"
                                : "Créer un compte"}
                    </Button>
                </form>

                <div className="text-center text-sm text-muted-foreground">
                    {mode === "login" ? (
                        <>
                            Pas encore de compte ?{" "}
                            <button
                                type="button"
                                onClick={() => setMode("register")}
                                className="text-blue-500 hover:underline"
                            >
                                S’inscrire
                            </button>
                        </>
                    ) : (
                        <>
                            Déjà un compte ?{" "}
                            <button
                                type="button"
                                onClick={() => setMode("login")}
                                className="text-blue-500 hover:underline"
                            >
                                Se connecter
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
