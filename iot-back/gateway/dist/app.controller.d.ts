import { GatewayService } from './app.service';
export declare class GatewayController {
    private readonly gatewayService;
    constructor(gatewayService: GatewayService);
    register(thing: any): Promise<any>;
    updateFromService(body: {
        type: 'thermostat' | 'lamp' | 'motion';
        state: any;
    }): Promise<{
        ok: boolean;
    }>;
    listThings(): Promise<any>;
    listByType(type: string): Promise<any>;
    getAllProperties(type: string): Promise<any>;
    getProperty(type: string, prop: string): Promise<any>;
    setState(id: string, body: any): Promise<any>;
    callAction(type: string, action: string, body: any): Promise<any>;
    health(): {
        status: string;
        service: string;
        timestamp: string;
    };
}
