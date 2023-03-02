import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameEvents } from './game.gateway.events';
import { GameState } from '@app/services/game/game.service';
import { Injectable } from '@nestjs/common';
import { ImageService } from '@app/services/image/image.service';
import { Constants } from '@common/constants';

@WebSocketGateway({ cors: true })
@Injectable()
export class GameGateway {
    @WebSocketServer() private server: Server;
    private playerRoomMap = new Map<string, number>();
    private playerGameMap = new Map<string, GameState>();

    constructor(private imageService: ImageService) {}

    @SubscribeMessage(GameEvents.OnJoinNewGame)
    onJoinNewGame(socket: Socket, game: string) {
        const roomId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
        this.playerRoomMap.set(socket.id, roomId);
        this.playerGameMap.set(socket.id, { gameId: game, foundDifferences: [] });
        socket.join(roomId.toString());
    }

    @SubscribeMessage(GameEvents.OnClick)
    async onClick(socket: Socket, data: { position: number }) {
        const gameState = this.playerGameMap.get(socket.id);
        const rep = await this.imageService.findDifference(gameState.gameId, gameState.foundDifferences, data.position);
        if (rep.won) {
            console.log('Player won', socket.id);
            this.playerRoomMap.delete(socket.id);
            this.playerGameMap.delete(socket.id);
        }
        socket.emit(GameEvents.OnProcessedClick, rep.foundDifference);
    }

    @SubscribeMessage(GameEvents.OnJoinMultiplayerGame)
    onJoinMultiplayerGame(socket: Socket, game: string) {
        for (const [playerId, gameId] of this.playerGameMap.entries()) {
            if (playerId !== socket.id && gameId.gameId === game) {
                this.playerRoomMap.set(socket.id, this.playerRoomMap.get(playerId));
                socket.join(this.playerRoomMap.get(playerId).toString());
                return;
            }
        }
        const roomId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
        this.playerRoomMap.set(socket.id, roomId);
        this.playerGameMap.set(socket.id, { gameId: game, foundDifferences: [] });
        socket.join(roomId.toString());
    }

    @SubscribeMessage(GameEvents.OnLeave)
    onLeave(socket: Socket) {
        this.playerRoomMap.delete(socket.id);
        this.playerGameMap.delete(socket.id);
    }

    handleDisconnect(socket: Socket) {
        this.playerRoomMap.delete(socket.id);
        this.playerGameMap.delete(socket.id);
    }

    handleConnection(socket: Socket) {
      console.log('Player connected', socket.id);
    }
}
