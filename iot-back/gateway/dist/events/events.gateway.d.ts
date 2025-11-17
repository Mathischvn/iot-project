import { Server } from 'socket.io';
export declare class EventsGateway {
    server: Server;
    emitState(type: 'thermostat' | 'lamp' | 'motion', state: any): void;
}
