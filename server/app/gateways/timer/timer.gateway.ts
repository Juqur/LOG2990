import { Injectable, Logger } from '@nestjs/common';
import { OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { DELAY_BEFORE_EMITTING_TIME } from './timer.gateway.constants';
import { TimerEvents } from './timer.gateway.events';

@WebSocketGateway({ cors: true, namespace: '/timer' })
@Injectable()
export class TimerGateway implements OnGatewayDisconnect {
    @WebSocketServer() server: Server;
    timeMap = new Map<string, number>();
    intervalMap = new Map<string, NodeJS.Timeout>();

    constructor(private readonly logger: Logger) {}

    @SubscribeMessage(TimerEvents.SoloClassic)
    message(socket: Socket, message: string) {
        this.logger.log(`Message reçu : ${message}`);
        this.timeMap.set(socket.id, 0);

        const interval = setInterval(() => {
            const time = this.timeMap.get(socket.id);
            this.timeMap.set(socket.id, time + 1);
            socket.emit('timer', time + 1);
        }, DELAY_BEFORE_EMITTING_TIME);

        this.intervalMap.set(socket.id, interval);
    }
    handleDisconnect(socket: Socket) {
        clearInterval(this.intervalMap.get(socket.id));
        this.timeMap.delete(socket.id);
        this.intervalMap.delete(socket.id);
    }
}
