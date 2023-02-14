import { Logger } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { DifferenceEvents } from './difference.gateway.events';

@WebSocketGateway({ cors: true, namespace: '/difference' })
export class DifferenceGateway {
    constructor(private readonly logger: Logger) {}

    @SubscribeMessage(DifferenceEvents.ReceiveClick)
    handleMessage(socket: Socket, value: number) {
        this.logger.log(value);
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        socket.emit('sendCoord', [-1]);
    }
}
