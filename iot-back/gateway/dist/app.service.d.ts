import { EventsGateway } from './events/events.gateway';
type ThingType = 'thermostat' | 'lamp' | 'motion';
export declare class GatewayService {
    private readonly events;
    private readonly logger;
    private prisma;
    constructor(events: EventsGateway);
    private automation;
    private emitState;
    register(thing: any): Promise<any>;
    getAll(): Promise<any>;
    getAllByType(type: string): Promise<any>;
    getOne(type: string): Promise<any>;
    updateState(id: number, newState: any): Promise<any>;
    callAction(type: string, action: string, body?: any): Promise<any>;
    callActionFromUser(type: string, action: string, body?: any): Promise<any>;
    private isManualOverrideActive;
    getProperty(type: string, prop: string): Promise<any>;
    getAllPropertys(type: string): Promise<any>;
    notifyClients(type: ThingType, state: any): Promise<{
        ok: boolean;
    }>;
    private runRules;
    private startNoMotionTimer;
    private peekState;
    private readTemp;
    private safeCall;
}
export {};
