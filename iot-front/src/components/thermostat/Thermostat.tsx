// src/pages/Thermostat.tsx
import { useEffect, useState, useCallback } from "react";
import io, { Socket } from "socket.io-client";
import { Lightbulb, Leaf } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { GatewayApi } from "@/components/api/gatewayApi";

// ============================================
// CONSTANTS
// ============================================

const CONFIG = {
    realtimeUrl: "http://localhost:3000/realtime",
    minTemp: 15,
    maxTemp: 30,
    ecoTemp: 19,
    defaultTargetTemp: 21,
    maxLogEntries: 12,
} as const;

type ThermostatMode = "off" | "heating" | "eco";

interface ThermostatProperties {
    temperature: number;
    targetTemperature: number;
    mode: ThermostatMode;
    isHeating?: boolean;
}

interface ThermostatThing {
    name: string;
    type: string;
    url?: string;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function clampTemperature(value: number): number {
    return Math.min(CONFIG.maxTemp, Math.max(CONFIG.minTemp, value));
}

function formatLogMessage(msg: string): string {
    const timestamp = new Date().toLocaleTimeString();
    return `• ${timestamp} — ${msg}`;
}

function findThermostatInThings(things: any[]): ThermostatThing | null {
    return things.find(
        (t) =>
            t.type?.toLowerCase() === "thermostat" ||
            t.name?.toLowerCase().includes("thermostat")
    ) || null;
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function Thermostat() {
    // State
    const [thermostat, setThermostat] = useState<ThermostatThing | null>(null);
    const [properties, setProperties] = useState<ThermostatProperties | null>(null);
    const [targetTemperature, setTargetTemperature] = useState(CONFIG.defaultTargetTemp);
    const [loading, setLoading] = useState(true);
    const [logs, setLogs] = useState<string[]>(["Thermostat initialized."]);

    // Computed
    const currentMode = properties?.mode ?? "off";
    const isOn = currentMode !== "off";
    const currentTemp = properties?.temperature ?? targetTemperature;

    // ============================================
    // LOGGING
    // ============================================

    const addLog = useCallback((message: string) => {
        setLogs((prev) => [formatLogMessage(message), ...prev].slice(0, CONFIG.maxLogEntries));
    }, []);

    // ============================================
    // API CALLS
    // ============================================

    const fetchThermostatProperties = useCallback(async () => {
        try {
            const data = await GatewayApi.getThingPropertiesByType("thermostat");
            setProperties(data);

            if (typeof data?.targetTemperature === "number") {
                setTargetTemperature(clampTemperature(data.targetTemperature));
            }
        } catch (error) {
            addLog("Erreur lors de la récupération des propriétés");
        }
    }, [addLog]);

    const setMode = useCallback(async (mode: ThermostatMode) => {
        await GatewayApi.callThingAction("thermostat", "setMode", { mode });
        addLog(`Mode changé: ${mode}`);
    }, [addLog]);

    const setTargetTemp = useCallback(async (temp: number) => {
        const safeTempTarget = clampTemperature(temp);
        await GatewayApi.callThingAction("thermostat", "setTargetTemperature", {
            targetTemperature: safeTempTarget,
        });
        addLog(`Température cible: ${safeTempTarget}°C`);
    }, [addLog]);

    // ============================================
    // ACTIONS
    // ============================================

    const turnOff = useCallback(async () => {
        setTargetTemperature(0);
        setProperties((prev) => prev ? {
            ...prev,
            mode: "off",
            temperature: 0,
            targetTemperature: 0,
        } : null);

        addLog("Extinction...");

        try {
            await Promise.all([
                setTargetTemp(0),
                setMode("off"),
            ]);
            await fetchThermostatProperties();
        } catch (error) {
            addLog("Erreur lors de l'extinction");
        }
    }, [setTargetTemp, setMode, fetchThermostatProperties, addLog]);

    const turnOn = useCallback(async () => {
        const nextTarget = targetTemperature > 0
            ? targetTemperature
            : CONFIG.defaultTargetTemp;

        setTargetTemperature(nextTarget);
        addLog("Allumage...");

        try {
            await setMode("heating");
            await setTargetTemp(nextTarget);
            await fetchThermostatProperties();
        } catch (error) {
            addLog("Erreur lors de l'allumage");
        }
    }, [targetTemperature, setMode, setTargetTemp, fetchThermostatProperties, addLog]);

    const togglePower = useCallback(() => {
        if (isOn) {
            turnOff();
        } else {
            turnOn();
        }
    }, [isOn, turnOff, turnOn]);

    const activateEcoMode = useCallback(async () => {
        const ecoTemp = clampTemperature(CONFIG.ecoTemp);

        setTargetTemperature(ecoTemp);
        setProperties((prev) => prev ? {
            ...prev,
            mode: "eco",
            targetTemperature: ecoTemp,
        } : null);

        addLog(`Mode Eco activé (${ecoTemp}°C)`);

        try {
            await setMode("eco");
            await setTargetTemp(ecoTemp);
            await fetchThermostatProperties();
        } catch (error) {
            addLog("Erreur lors de l'activation du mode Eco");
        }
    }, [setMode, setTargetTemp, fetchThermostatProperties, addLog]);

    const handleSliderChange = useCallback(async (values: number[]) => {
        const newTarget = clampTemperature(values[0]);
        setTargetTemperature(newTarget);
        addLog(`Nouvelle cible: ${newTarget}°C`);

        try {
            await setTargetTemp(newTarget);
            await fetchThermostatProperties();
        } catch (error) {
            addLog("Erreur lors du changement de température");
        }
    }, [setTargetTemp, fetchThermostatProperties, addLog]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = clampTemperature(Number(e.target.value) || 0);
        // @ts-ignore
        setTargetTemperature(value);
    }, []);

    // ============================================
    // EFFECTS
    // ============================================

    // Initial load
    useEffect(() => {
        const loadThermostat = async () => {
            try {
                const saved = localStorage.getItem("things");
                if (!saved) return;

                const things = JSON.parse(saved);
                const found = findThermostatInThings(things);

                if (found) {
                    setThermostat(found);
                    await fetchThermostatProperties();
                }
            } catch (error) {
                addLog("Erreur lors du chargement", error);
            } finally {
                setLoading(false);
            }
        };

        loadThermostat();
    }, [fetchThermostatProperties, addLog]);

    // Real-time updates via WebSocket
    useEffect(() => {
        if (!isOn) return;

        const socket: Socket = io(CONFIG.realtimeUrl, {
            transports: ["websocket"]
        });

        let hasReachedTarget = false;
        let lastLogMessage = "";

        socket.on("thermostat:state", (state: any) => {
            const mode = state?.mode ?? "off";
            const temp = clampTemperature(state?.temperature ?? targetTemperature);
            const target = clampTemperature(state?.targetTemperature ?? CONFIG.defaultTargetTemp);

            setProperties({
                temperature: temp,
                targetTemperature: target,
                mode,
                isHeating: state?.isHeating,
            });

            setTargetTemperature(target);

            const logMessage = `Mise à jour: ${temp}°C → ${target}°C (${mode})`;
            if (logMessage !== lastLogMessage) {
                addLog(logMessage);
                lastLogMessage = logMessage;
            }

            if (!hasReachedTarget && temp >= target) {
                hasReachedTarget = true;
                addLog(`✅ Température cible atteinte (${target}°C)`);
            } else if (hasReachedTarget && temp < target - 0.3) {
                hasReachedTarget = false;
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [isOn, targetTemperature, addLog]);



    // ============================================
    // UI HELPERS
    // ============================================

    const getIconClasses = (): string => {
        const baseClasses = "transition-all";

        switch (currentMode) {
            case "off":
                return `${baseClasses} text-muted-foreground`;
            case "eco":
                return `${baseClasses} text-emerald-500 drop-shadow-[0_0_10px_rgba(16,185,129,0.6)]`;
            default:
                return `${baseClasses} text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.6)]`;
        }
    };

    const getBadgeText = (): string => {
        switch (currentMode) {
            case "off": return "Off";
            case "eco": return "Eco";
            default: return "On";
        }
    };

    // ============================================
    // RENDER
    // ============================================

    return (
        <div className="grid gap-6 md:grid-cols-3">
            {/* Main Control Card */}
            <Card className="md:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Lightbulb className={getIconClasses()} size={22} />
                        Thermostat Control
                    </CardTitle>
                    <Badge variant={currentMode === "off" ? "secondary" : "default"}>
                        {getBadgeText()}
                    </Badge>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Loading / Info Section */}
                    {loading ? (
                        <p>Chargement des données du thermostat...</p>
                    ) : thermostat ? (
                        <>
                            <div className="text-sm text-muted-foreground">
                                <p><strong>Nom :</strong> {thermostat.name}</p>
                                <p><strong>Type :</strong> {thermostat.type}</p>
                            </div>

                            {properties && (
                                <pre className="text-xs bg-muted/50 rounded-md p-2 overflow-auto">
                  {JSON.stringify(properties, null, 2)}
                </pre>
                            )}
                        </>
                    ) : (
                        <p>Aucun thermostat trouvé dans le localStorage.</p>
                    )}

                    <Separator />

                    {/* Power Controls */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Switch checked={isOn} onCheckedChange={togglePower} />
                            <span className="text-sm text-muted-foreground">Power</span>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                className="flex items-center gap-2"
                                onClick={activateEcoMode}
                                disabled={!isOn}
                            >
                                <Leaf size={16} /> Eco
                            </Button>
                            <Button
                                variant={isOn ? "destructive" : "default"}
                                onClick={togglePower}
                            >
                                {isOn ? "Turn Off" : "Turn On"}
                            </Button>
                        </div>
                    </div>

                    <Separator />

                    {/* Temperature Controls */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="target" className="text-sm text-muted-foreground">
                                Target Temperature
                            </Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    id="target"
                                    type="number"
                                    min={CONFIG.minTemp}
                                    max={CONFIG.maxTemp}
                                    value={targetTemperature}
                                    onChange={handleInputChange}
                                    disabled={!isOn}
                                    className="w-20"
                                />
                                <span className="text-sm text-muted-foreground">°C</span>
                            </div>
                        </div>

                        <Slider
                            value={[targetTemperature]}
                            min={CONFIG.minTemp}
                            max={CONFIG.maxTemp}
                            step={1}
                            onValueChange={handleSliderChange}
                            disabled={!isOn}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Events Log Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Live Events</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="bg-muted/50 rounded-md p-3 text-sm max-h-[300px] overflow-auto space-y-1">
                        {logs.map((log, index) => (
                            <div key={index} className="leading-relaxed">
                                {log}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}