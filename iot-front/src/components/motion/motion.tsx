// src/pages/Motion.tsx
import { useEffect, useMemo, useState } from "react";
import io from "socket.io-client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { GatewayApi } from "@/components/api/gatewayApi";

const REALTIME_URL =
    (typeof process !== "undefined" && process.env.NEXT_PUBLIC_REALTIME_URL) ||
    "http://localhost:3000/realtime";

export default function Motion() {
    const [detected, setDetected] = useState(false);
    const [updatedAt, setUpdatedAt] = useState<string | undefined>();
    const [logs, setLogs] = useState<string[]>(["Motion sensor initialized."]);
    const [loading, setLoading] = useState(true);

    function pushLog(msg: string) {
        setLogs((l) => [`• ${new Date().toLocaleTimeString()} — ${msg}`, ...l].slice(0, 10));
    }

    // Charger l’état initial depuis le Gateway
    useEffect(() => {
        (async () => {
            try {
                const data = await GatewayApi.getThingPropertiesByType("motion");
                setDetected(!!data?.detected);
                setUpdatedAt(data?.updatedAt);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    // WebSocket temps réel
    useEffect(() => {
        const socket = io(REALTIME_URL, { transports: ["websocket"] });
        socket.on("motion:state", (state: any) => {
            setDetected(!!state?.detected);
            setUpdatedAt(state?.updatedAt);
            pushLog(`Motion ${state?.detected ? "detected 🟢" : "cleared ⚪"}`);
        });
        return () => socket.disconnect();
    }, []);

    // Simuler une détection
    async function triggerMotion() {
        pushLog("Manual trigger sent to Gateway.");
        await GatewayApi.callThingAction("motion", "toggle");
    }

    const badgeColor = useMemo(
        () => (detected ? "default" : "secondary"),
        [detected]
    );

    return (
        <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Motion Sensor</CardTitle>
                    <Badge variant={badgeColor}>
                        {detected ? "Motion detected" : "No motion"}
                    </Badge>
                </CardHeader>
                <CardContent className="space-y-6">
                    {loading ? (
                        <p>Chargement du capteur…</p>
                    ) : (
                        <>
                            <p className="text-sm text-muted-foreground">
                                Statut :{" "}
                                <span className={`font-semibold ${detected ? "text-green-600" : "text-gray-500"}`}>
                  {detected ? "Détection en cours" : "Aucune détection"}
                </span>
                            </p>
                            {updatedAt && (
                                <p className="text-sm text-muted-foreground">
                                    Dernière mise à jour : {new Date(updatedAt).toLocaleTimeString()}
                                </p>
                            )}

                            <Separator />

                            <Button onClick={triggerMotion} className="w-full">
                                Simuler une détection
                            </Button>
                        </>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Logs en temps réel</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="bg-muted/50 rounded-md p-3 text-sm max-h-[300px] overflow-auto">
                        {logs.map((l, i) => (
                            <div key={i} className="leading-relaxed">
                                {l}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
