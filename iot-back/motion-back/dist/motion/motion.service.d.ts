import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { MotionState } from './motion.dto';
export declare class MotionService implements OnModuleInit, OnModuleDestroy {
    private readonly logger;
    private state;
    private readonly gatewayUrl;
    private readonly selfUrl;
    private readonly instanceName;
    private simulationTimer;
    private readonly simulationPeriod;
    onModuleInit(): Promise<void>;
    onModuleDestroy(): void;
    private registerToGateway;
    private notifyGateway;
    getState(): MotionState;
    detect(): MotionState;
    clear(): MotionState;
    toggle(): MotionState;
    reset(): MotionState;
    private startSimulationIfEnabled;
}
