import { Routes, Route } from "react-router-dom"
import App from "./App"
import Login from "@/components/auth/elements/Login.tsx";
import RequireAuth from "@/components/auth/elements/RequireAuth.tsx";
import Dashboard from "@/components/dashboard/Dashboard.tsx";
import Thermostat from "@/components/thermostat/Thermostat.tsx";
import Motion from "@/components/motion/motion.tsx";
import Lamp from "@/components/lamp/Lamp.tsx";

export default function RoutesRoot() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<RequireAuth />}>
                <Route path="/" element={<App />}>
                    <Route index element={<Dashboard />} />
                    <Route path="lamp" element={<Lamp />} />
                    <Route path="thermostat" element={<Thermostat />} />
                    <Route path="motion" element={<Motion />} />
                    <Route path="*" element={<div className="p-6">Page non trouvée</div>} />
                </Route>
            </Route>
        </Routes>
    )
}
