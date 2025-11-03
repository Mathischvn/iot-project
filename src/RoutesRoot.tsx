// src/RoutesRoot.tsx
import { Routes, Route } from "react-router-dom"
import App from "./App"
import Dashboard from "@/components/dashboard/Dashboard.tsx";
import Lamp from "@/components/lamp/Lamp"
import Thermostat from "@/components/thermostat/Thermostat.tsx";
import Motion from "@/components/motion/motion.tsx";

//import Logs from "@/pages/Logs"

export default function RoutesRoot() {
    return (
        <Routes>
            <Route path="/" element={<App />}>
                <Route index element={<Dashboard />} />
                <Route path="lamp" element={<Lamp />} />
                <Route path="thermostat" element={<Thermostat />} />
                <Route path="motion" element={<Motion />} />
                {/*<Route path="reports" element={<Logs />} /> */}
                <Route path="*" element={<div className="p-6">Page non trouvée</div>} />
            </Route>
        </Routes>
    )
}
