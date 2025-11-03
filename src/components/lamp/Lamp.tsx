// src/pages/Lamp.tsx
import { useMemo, useState } from "react"
import { Lightbulb } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

export default function Lamp() {
    const [isOn, setIsOn] = useState(false)
    const [brightness, setBrightness] = useState(50)
    const [logs, setLogs] = useState<string[]>(["Lamp initialized."])

    const iconClasses = useMemo(
        () =>
            `transition-all ${isOn ? "text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.6)]" : "text-muted-foreground"}`,
        [isOn]
    )

    function pushLog(msg: string) {
        setLogs((l) => [`• ${new Date().toLocaleTimeString()} — ${msg}`, ...l].slice(0, 12))
    }

    function toggleLamp() {
        const next = !isOn
        setIsOn(next)
        pushLog(`Lamp turned ${next ? "ON" : "OFF"}.`)
    }

    function handleSlider(val: number[]) {
        const v = val[0]
        setBrightness(v)
        pushLog(`Brightness set to ${v}%.`)
    }

    function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
        const v = Math.max(0, Math.min(100, Number(e.target.value) || 0))
        setBrightness(v)
    }

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
                                />
                                <span className="text-sm text-muted-foreground">%</span>
                            </div>
                        </div>
                        <Slider value={[brightness]} min={0} max={100} step={1} onValueChange={handleSlider} />
                    </div>
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
                    <div className="text-xs text-muted-foreground">
                        Simulated UI using shadcn/ui. Wire these actions to your API (e.g., <code>POST /lamp/actions/toggle</code>).
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
