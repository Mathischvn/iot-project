import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { LampState, UpdateBrightnessDto, UpdateModeDto, UpdatePowerDto } from './lamp.dto';
export declare class LampService implements OnModuleInit, OnModuleDestroy {
    private readonly logger;
    private state;
    private simulationInterval;
    private brightnessTransitionInterval;
    private readonly gatewayUrl;
    private readonly selfUrl;
    private readonly instanceName;
    onModuleInit(): Promise<void>;
    onModuleDestroy(): void;
    private registerToGateway;
    private notifyGateway;
    private startSimulation;
    private simulate;
    getState(): LampState;
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
    private transitionBrightness;
    setPower(dto: UpdatePowerDto): LampState;
    setBrightness(dto: UpdateBrightnessDto): LampState;
    setMode(dto: UpdateModeDto): LampState;
    reset(): LampState;
}
