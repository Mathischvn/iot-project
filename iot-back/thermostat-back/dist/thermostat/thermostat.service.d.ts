import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ThermostatState, UpdateModeDto, UpdateTargetDto } from './thermostat.dto';
export declare class ThermostatService implements OnModuleInit, OnModuleDestroy {
    private readonly logger;
    private state;
    private simulationInterval;
    private readonly gatewayUrl;
    private readonly selfUrl;
    constructor();
    onModuleInit(): Promise<void>;
    onModuleDestroy(): void;
    private registerToGateway;
    private notifyGateway;
    private startSimulation;
    private simulateStep;
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
    setTargetTemperature(dto: UpdateTargetDto): ThermostatState;
    setMode(dto: UpdateModeDto): ThermostatState;
    reset(): ThermostatState;
}
