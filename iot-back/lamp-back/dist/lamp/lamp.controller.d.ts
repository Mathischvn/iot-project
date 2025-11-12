import { LampService } from './lamp.service';
import { UpdatePowerDto, UpdateBrightnessDto, UpdateModeDto, LampState } from './lamp.dto';
export declare class LampController {
    private readonly lampService;
    constructor(lampService: LampService);
    getInfo(): {
        name: string;
        type: string;
        status: string;
    };
    getDescription(): {
        '@context': string;
        id: string;
        title: string;
        description: string;
        properties: {
            power: {
                type: string;
            };
            brightness: {
                type: string;
                minimum: number;
                maximum: number;
                unit: string;
            };
            mode: {
                type: string;
                enum: string[];
            };
            updatedAt: {
                type: string;
            };
        };
        actions: {
            setPower: {
                input: {
                    type: string;
                };
            };
            setBrightness: {
                input: {
                    type: string;
                    minimum: number;
                    maximum: number;
                };
            };
            setMode: {
                input: {
                    type: string;
                    enum: string[];
                };
            };
            reset: {
                description: string;
            };
        };
    };
    getProperties(): LampState;
    getPower(): {
        value: boolean;
    };
    getBrightness(): {
        value: number;
    };
    getMode(): {
        value: "normal" | "eco" | "comfort";
    };
    setPower(dto: UpdatePowerDto): LampState;
    setBrightness(dto: UpdateBrightnessDto): LampState;
    setMode(dto: UpdateModeDto): LampState;
    actionSetPower(dto: UpdatePowerDto): LampState;
    actionSetBrightness(dto: UpdateBrightnessDto): LampState;
    actionSetMode(dto: UpdateModeDto): LampState;
    actionReset(): LampState;
}
