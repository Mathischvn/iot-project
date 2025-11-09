import { useEffect, useState } from "react";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
import { GatewayApi } from "@/components/api/gatewayApi";

export default function Dashboard() {
    const [thermostatProps, setThermostatProps] = useState<any>(null);
    const [lampProps, setLampProps] = useState<any>(null);
    const [motionProps, setMotionProps] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchThermostat = async () => {
            try {
                const data = await GatewayApi.getThingPropertiesByType("thermostat");
                setThermostatProps(data);
            } catch {
                setThermostatProps(null);
            }
        };

        const fetchLamp = async () => {
            try {
                const data = await GatewayApi.getThingPropertiesByType("lamp");
                setLampProps(data);
            } catch {
                setLampProps(null);
            }
        };

        /*const fetchMotion = async () => {
            try {
                const data = await GatewayApi.getThingPropertiesByType("motion");
                setMotionProps(data);
            } catch {
                setMotionProps(null);
            }
        };*/

        Promise.all([fetchThermostat(), fetchLamp()]).finally(() =>
            setLoading(false)
        );
    }, []);

    return (
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            {/* THERMOSTAT */}
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle>Thermostat</CardTitle>
                    <CardDescription>Contrôle de la température ambiante</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p className="text-sm text-muted-foreground">Chargement...</p>
                    ) : thermostatProps ? (
                        <>
                            <p className="text-sm text-muted-foreground">
                                Température :{" "}
                                <span className="font-semibold text-foreground">
                  {thermostatProps.temperature ?? "–"} °C
                </span>
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Mode :{" "}
                                <span className="font-semibold text-foreground">
                  {thermostatProps.mode ?? "–"}
                </span>
                            </p>
                        </>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            Aucun thermostat trouvé.
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* LAMP */}
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle>Lampe</CardTitle>
                    <CardDescription>État actuel de l’éclairage</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p className="text-sm text-muted-foreground">Chargement...</p>
                    ) : lampProps ? (
                        <>
                            <p className="text-sm text-muted-foreground">
                                État :{" "}
                                <span
                                    className={`font-semibold ${
                                        lampProps.power ? "text-yellow-500" : "text-muted-foreground"
                                    }`}
                                >
                  {lampProps.power ? "allumée 💡" : "éteinte"}
                </span>
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Luminosité :{" "}
                                <span className="font-semibold text-foreground">
                  {lampProps.brightness ?? "–"} %
                </span>
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Mode :{" "}
                                <span className="font-semibold text-foreground">
                  {lampProps.mode ?? "–"}
                </span>
                            </p>
                        </>
                    ) : (
                        <p className="text-sm text-muted-foreground">Aucune lampe trouvée.</p>
                    )}
                </CardContent>
            </Card>

            {/* MOTION SENSOR */}
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle>Capteur de mouvement</CardTitle>
                    <CardDescription>Détection en temps réel</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p className="text-sm text-muted-foreground">Chargement...</p>
                    ) : motionProps ? (
                        <p className="text-sm text-muted-foreground">
                            Détecté :{" "}
                            <span
                                className={`font-semibold ${
                                    motionProps.detected
                                        ? "text-green-600"
                                        : "text-muted-foreground"
                                }`}
                            >
                {motionProps.detected ? "oui" : "non"}
              </span>
                        </p>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            Aucun capteur trouvé.
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
