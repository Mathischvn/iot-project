import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { UpdateArmedDto, UpdateSensitivityDto, TriggerDto, MotionState } from './motion.dto';
export declare class MotionService implements OnModuleInit, OnModuleDestroy {
    private readonly logger;
    private simulationInterval;
    private readonly gatewayUrl;
    private readonly selfUrl;
    private readonly instanceName;
    private state;
    onModuleInit(): Promise<void>;
    onModuleDestroy(): void;
    private registerToGateway;
    private notifyGateway;
    private startSimulation;
    private simulate;
    getState(): MotionState;
    getDescription(): {
        '@context': string;
        id: string;
        title: string;
        description: string;
        properties: {
            detected: {
                type: string;
                readOnly: boolean;
            };
            armed: {
                type: string;
            };
            sensitivity: {
                type: string;
                minimum: number;
                maximum: number;
                unit: string;
            };
        };
        actions: {
            setArmed: {
                input: {
                    type: string;
                };
            };
            setSensitivity: {
                input: {
                    type: string;
                    minimum: number;
                    maximum: number;
                };
            };
            trigger: {
                input: {
                    type: string;
                };
            };
            reset: {
                description: string;
            };
        };
    };
    setArmed(dto: UpdateArmedDto): MotionState;
    setSensitivity(dto: UpdateSensitivityDto): MotionState;
    trigger(dto: TriggerDto): MotionState;
    reset(): MotionState;
}
