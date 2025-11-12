import { ThermostatService } from './thermostat.service';
import { UpdateTargetDto, UpdateModeDto, ThermostatState } from './thermostat.dto';
export declare class ThermostatController {
    private readonly thermostatService;
    constructor(thermostatService: ThermostatService);
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
            temperature: {
                type: string;
                readOnly: boolean;
                unit: string;
            };
            targetTemperature: {
                type: string;
                unit: string;
            };
            mode: {
                type: string;
                enum: string[];
            };
            isHeating: {
                type: string;
                readOnly: boolean;
            };
        };
        actions: {
            setTargetTemperature: {
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
            reset: {};
        };
    };
    getProperties(): ThermostatState;
    getTemperature(): {
        value: number;
        unit: string;
    };
    getTargetTemperature(): {
        value: number;
        unit: string;
    };
    getMode(): {
        value: "off" | "heating" | "eco";
    };
    getIsHeating(): {
        value: boolean;
    };
    setTargetTemperature(dto: UpdateTargetDto): ThermostatState;
    setMode(dto: UpdateModeDto): ThermostatState;
    actionSetTargetTemperature(dto: UpdateTargetDto): ThermostatState;
    actionSetMode(dto: UpdateModeDto): ThermostatState;
    actionReset(): ThermostatState;
}
