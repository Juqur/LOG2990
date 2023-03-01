import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameEvents } from './game.gateway.events';
import { GameState } from '@app/services/game/game.service';
import { Injectable } from '@nestjs/common';

@WebSocketGateway({ cors: true })
@Injectable()
export class GameGateway {
    @WebSocketServer() private server: Server;
    private playerRoomMap = new Map<string, number>();
    private playerGameMap = new Map<string, GameState>();

    @SubscribeMessage(GameEvents.OnJoinNewGame)
    onJoinNewGame(socket: Socket, game: string) {
        const roomId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
        this.playerRoomMap.set(socket.id, roomId);
        this.playerGameMap.set(socket.id, { gameId: game, foundDifferences: [] });
        socket.join(roomId.toString());
        console.log('Player joined room', roomId + ' with game ' + game);
    }

    @SubscribeMessage(GameEvents.OnClick)
    onClick(socket: Socket, data: { gameId: string; position: number }) {
        const roomId = this.playerRoomMap.get(socket.id);
        console.log('Player clicked', data.position, 'in room', roomId);
    }

    @SubscribeMessage(GameEvents.OnJoinMultiplayerGame)
    onJoinMultiplayerGame(socket: Socket, game: string) {
        for (const [playerId, gameId] of this.playerGameMap.entries()) {
            if (playerId !== socket.id && gameId.gameId === game) {
                this.playerRoomMap.set(socket.id, this.playerRoomMap.get(playerId));
                socket.join(this.playerRoomMap.get(playerId).toString());
                console.log('Player joined exsiting room', this.playerRoomMap.get(playerId).toString() + ' with game ' + game);
                return;
            }
        }
        const roomId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
        this.playerRoomMap.set(socket.id, roomId);
        this.playerGameMap.set(socket.id, { gameId: game, foundDifferences: [] });
        socket.join(roomId.toString());
        console.log('Player joined room', roomId + ' with game ' + game);
    }

    handleDisconnect(socket: Socket) {
        this.playerRoomMap.delete(socket.id);
        this.playerGameMap.delete(socket.id);
    }

    handleConnection(socket: Socket) {
      console.log('Player connected', socket.id);
    }
}
