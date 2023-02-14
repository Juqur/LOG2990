import { Logger } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { DifferenceEvents } from './difference.gateway.events';

@WebSocketGateway({ cors: true, namespace: '/difference' })
export class DifferenceGateway {
    constructor(private readonly logger: Logger) {}

    @SubscribeMessage(DifferenceEvents.ReceiveClick)
    handleMessage(socket: Socket, message: string) {
        this.logger.log(message);
        socket.emit('sendCoord', 'Hello world!');
    }
}
