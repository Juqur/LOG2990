import { Injectable, Logger } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { EndEvent } from './end.gateway.events';

@WebSocketGateway({ cors: true, namespace: '/timer' })
@Injectable()
export class EndGateway {
    @WebSocketServer() server: Server;
    // timeMap = new Map<string, number>();
    // intervalMap = new Map<string, NodeJS.Timeout>();

    constructor(private readonly logger: Logger) {}

    @SubscribeMessage(EndEvent.WonGame)
    message(socket: Socket, message: string) {
        this.logger.log(`Message reçu : ${message}`);
        // TODO
        // if we find all the differences send back message?
    }
}
