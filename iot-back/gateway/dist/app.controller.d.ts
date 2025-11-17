import { GatewayService } from './app.service';
export declare class GatewayController {
    private readonly gatewayService;
    constructor(gatewayService: GatewayService);
    register(thing: any): Promise<{
        id: number;
        name: string;
        url: string;
        type: string;
        state: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
    }>;
    updateFromService(body: {
        type: 'thermostat' | 'lamp' | 'motion';
        state: any;
    }): Promise<{
        ok: boolean;
    }>;
    listThings(): Promise<{
        id: number;
        name: string;
        url: string;
        type: string;
        state: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
    }[]>;
    listByType(type: string): Promise<{
        id: number;
        name: string;
        url: string;
        type: string;
        state: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
    }[]>;
    getAllProperties(type: string): Promise<any>;
    getProperty(type: string, prop: string): Promise<any>;
    setState(id: string, body: any): Promise<{
        id: number;
        name: string;
        url: string;
        type: string;
        state: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
    }>;
    callAction(type: string, action: string, body: any): Promise<any>;
    health(): {
        status: string;
        service: string;
        timestamp: string;
    };
}
