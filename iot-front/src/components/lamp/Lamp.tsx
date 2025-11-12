// src/pages/Lamp.tsx
import { useEffect, useMemo, useState } from "react";
import io from "socket.io-client";
import { Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { GatewayApi } from "@/components/api/gatewayApi";

const REALTIME_URL =
    (typeof process !== "undefined" && process.env.NEXT_PUBLIC_REALTIME_URL) ||
    "http://localhost:3000/realtime";

export default function Lamp() {
    const [isOn, setIsOn] = useState(false);
    const [brightness, setBrightness] = useState(0);
    const [mode, setMode] = useState<"normal" | "eco" | "comfort">("normal");
    const [updatedAt, setUpdatedAt] = useState<string | undefined>(undefined);
    const [logs, setLogs] = useState<string[]>(["Lamp initialized."]);
    const [loading, setLoading] = useState(true);

    const iconClasses = useMemo(
        () =>
            `transition-all ${
                isOn
                    ? "text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.6)]"
                    : "text-muted-foreground"
            }`,
        [isOn]
    );

    function pushLog(msg: string) {
        setLogs((l) => [`• ${new Date().toLocaleTimeString()} — ${msg}`, ...l].slice(0, 12));
    }

    // Fetch initial depuis le Gateway
    useEffect(() => {
        (async () => {
            try {
                const data = await GatewayApi.getThingPropertiesByType("lamp");
                setIsOn(!!data?.power);
                setBrightness(Number(data?.brightness ?? 0));
                setMode((data?.mode as any) ?? "normal");
                setUpdatedAt(data?.updatedAt);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    // WebSocket temps réel
    useEffect(() => {
        const socket = io(REALTIME_URL, { transports: ["websocket"] });
        socket.on("lamp:state", (state: any) => {
            setIsOn(!!state?.power);
            setBrightness(Number(state?.brightness ?? 0));
            setMode((state?.mode as any) ?? "normal");
            setUpdatedAt(state?.updatedAt);
            pushLog(
                `Update: power=${state?.power ? "ON" : "OFF"}, brightness=${state?.brightness ?? "–"}%, mode=${state?.mode ?? "–"}`
            );
        });
        return () => socket.disconnect();
    }, []);

    // Actions REST
    async function toggleLamp() {
        const next = !isOn;
        setIsOn(next);
        pushLog(`Lamp turned ${next ? "ON" : "OFF"} (request)`);
        try {
            await GatewayApi.callThingAction("lamp", "setPower", { power: next });
        } catch {
            setIsOn(!next);
        }
    }

    async function handleSlider(val: number[]) {
        const v = val[0];
        setBrightness(v);
        pushLog(`Brightness set to ${v}% (request)`);
        try {
            await GatewayApi.callThingAction("lamp", "setBrightness", { brightness: v });
        } catch {
            // on laisse le WS remettre l'état correct
        }
    }

    function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
        const v = Math.max(0, Math.min(100, Number(e.target.value) || 0));
        setBrightness(v);
    }

    async function commitInputBrightness() {
        pushLog(`Brightness set to ${brightness}% (request)`);
        try {
            await GatewayApi.callThingAction("lamp", "setBrightness", { brightness });
        } catch {
            // rollback via WS
        }
    }

    async function setModeAction(next: "normal" | "eco" | "comfort") {
        setMode(next);
        pushLog(`Mode set to ${next} (request)`);
        try {
            await GatewayApi.callThingAction("lamp", "setMode", { mode: next });
        } catch {
            // rollback via WS
        }
    }

    useEffect(() => {
        if (!isOn) setBrightness(0);
    }, [isOn]);

    return (
        <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Lightbulb className={iconClasses} size={22} />
                        Lamp Control
                    </CardTitle>
                    <Badge variant={isOn ? "default" : "secondary"}>{isOn ? "On" : "Off"}</Badge>
                </CardHeader>
                <CardContent className="space-y-6">
                    {loading ? (
                        <p>Chargement de la lampe…</p>
                    ) : (
                        <>
                            <div className="text-sm text-muted-foreground">
                                <div>
                                    <b>Power:</b> {isOn ? "ON" : "OFF"}
                                </div>
                                <div>
                                    <b>Brightness:</b> {brightness}%
                                </div>
                                <div>
                                    <b>Mode:</b> {mode}
                                </div>
                                {updatedAt && (
                                    <div>
                                        <b>Updated:</b> {new Date(updatedAt).toLocaleString()}
                                    </div>
                                )}
                            </div>

                            <Separator />

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Switch checked={isOn} onCheckedChange={toggleLamp} />
                                    <span className="text-sm text-muted-foreground">Power</span>
                                </div>
                                <Button variant={isOn ? "destructive" : "default"} onClick={toggleLamp}>
                                    {isOn ? "Turn Off" : "Turn On"}
                                </Button>
                            </div>

                            <Separator />

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="brightness" className="text-sm text-muted-foreground">
                                        Brightness
                                    </Label>
                                    <div className="flex items-center gap-2 w-24">
                                        <Input
                                            id="brightness"
                                            type="number"
                                            min={0}
                                            max={100}
                                            value={brightness}
                                            onChange={handleInput}
                                            onBlur={commitInputBrightness}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") void commitInputBrightness();
                                            }}
                                            disabled={!isOn}
                                        />
                                        <span className="text-sm text-muted-foreground">%</span>
                                    </div>
                                </div>
                                <Slider
                                    value={[brightness]}
                                    min={0}
                                    max={100}
                                    step={1}
                                    onValueChange={handleSlider}
                                    disabled={!isOn}
                                />
                            </div>

                            <Separator />

                            <div className="flex gap-2">
                                <Button variant={mode === "normal" ? "default" : "outline"} onClick={() => setModeAction("normal")}>
                                    Normal
                                </Button>
                                <Button variant={mode === "eco" ? "default" : "outline"} onClick={() => setModeAction("eco")}>
                                    Eco
                                </Button>
                                <Button
                                    variant={mode === "comfort" ? "default" : "outline"}
                                    onClick={() => setModeAction("comfort")}
                                >
                                    Comfort
                                </Button>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Live Events</CardTitle>
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
