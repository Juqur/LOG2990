import { Logger } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { GameEvents } from './game.gateway.events';

@WebSocketGateway()
export class GameGateway {
    constructor(private readonly logger: Logger) {}

    @SubscribeMessage(GameEvents.CreateGame)
    handleMessage(socket: Socket, message: string) {
        this.logger.log(`Message reçu! : ${message}`);
        socket.emit('game');
        // Have this class create the GameService and send the info to the rest on creation.
    }
}
