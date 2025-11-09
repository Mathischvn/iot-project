import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ namespace: '/realtime', cors: true })
export class EventsGateway {
  @WebSocketServer() server!: Server;

  emitState(type: 'thermostat' | 'lamp' | 'motion', state: any) {
    this.server.emit(`${type}:state`, state);
  }
}
