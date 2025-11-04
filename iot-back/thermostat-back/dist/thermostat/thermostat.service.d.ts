import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ThermostatState, UpdateTargetDto, UpdateModeDto } from './thermostat.dto';
export declare class ThermostatService implements OnModuleInit, OnModuleDestroy {
    private readonly logger;
    private state;
    private simulationInterval;
    constructor();
    onModuleInit(): void;
    onModuleDestroy(): void;
    private startSimulation;
    private simulate;
    getState(): ThermostatState;
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
                minimum: number;
                maximum: number;
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
            reset: {
                description: string;
            };
        };
    };
    setTargetTemperature(dto: UpdateTargetDto): ThermostatState;
    setMode(dto: UpdateModeDto): ThermostatState;
    reset(): ThermostatState;
}
