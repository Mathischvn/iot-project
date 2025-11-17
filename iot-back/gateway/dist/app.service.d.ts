import { EventsGateway } from './events/events.gateway';
type ThingType = 'thermostat' | 'lamp' | 'motion';
export declare class GatewayService {
    private readonly events;
    private readonly logger;
    private prisma;
    constructor(events: EventsGateway);
    private automation;
    private emitState;
    register(thing: any): Promise<{
        id: number;
        name: string;
        url: string;
        type: string;
        state: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
    }>;
    getAll(): Promise<{
        id: number;
        name: string;
        url: string;
        type: string;
        state: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
    }[]>;
    getAllByType(type: string): Promise<{
        id: number;
        name: string;
        url: string;
        type: string;
        state: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
    }[]>;
    getOne(type: string): Promise<{
        id: number;
        name: string;
        url: string;
        type: string;
        state: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
    }>;
    updateState(id: number, newState: any): Promise<{
        id: number;
        name: string;
        url: string;
        type: string;
        state: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
    }>;
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
