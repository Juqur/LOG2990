import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameEvents } from './game.gateway.events';
import { GameState } from '@app/services/game/game.service';
import { Injectable } from '@nestjs/common';
import { ImageService } from '@app/services/image/image.service';
import { DELAY_BEFORE_EMITTING_TIME } from './game.gateway.constants';

interface GameData {
    differences: number[];
    amountOfDifferences: number;
    amountOfDifferencesSecondPlayer?: number;
}

@WebSocketGateway({ cors: true })
@Injectable()
export class GameGateway {
    @WebSocketServer() private server: Server;
    private playerRoomMap = new Map<string, number>();
    private playerGameMap = new Map<string, GameState>();
    private timeMap = new Map<string, number>();
    private timeIntervalMap = new Map<string, NodeJS.Timeout>();

    constructor(private imageService: ImageService) {}

    @SubscribeMessage(GameEvents.OnJoinNewGame)
    onJoinNewGame(socket: Socket, data: { game: string; playerName: string }) {
        const roomId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
        this.playerRoomMap.set(socket.id, roomId);
        this.playerGameMap.set(socket.id, { gameId: data.game, foundDifferences: [], playerName: data.playerName, secondPlayerId: '' });
        socket.join(roomId.toString());
        this.timeMap.set(socket.id, 0);
        const interval = setInterval(() => {
            const time = this.timeMap.get(socket.id);
            this.timeMap.set(socket.id, time + 1);
            socket.emit('timer', time + 1);
        }, DELAY_BEFORE_EMITTING_TIME);
        this.timeIntervalMap.set(socket.id, interval);
    }

    @SubscribeMessage(GameEvents.OnJoinMultiplayerGame)
    onJoinMultiplayerGame(socket: Socket, data: { game: string; playerName: string }) {
        for (const [playerId, gameId] of this.playerGameMap.entries()) {
            if (playerId !== socket.id && gameId.gameId === data.game) {
                if (this.server.sockets.adapter.rooms.get(this.playerRoomMap.get(playerId).toString()).size === 1) {
                    this.playerRoomMap.set(socket.id, this.playerRoomMap.get(playerId));
                    this.playerGameMap.set(socket.id, {
                        gameId: data.game,
                        foundDifferences: [],
                        playerName: data.playerName,
                        secondPlayerId: playerId,
                    });
                    this.playerGameMap.get(playerId).secondPlayerId = socket.id;
                    socket.join(this.playerRoomMap.get(playerId).toString());
                    const names = [this.playerGameMap.get(playerId).playerName, data.playerName];
                    this.server.to(this.playerRoomMap.get(playerId).toString()).emit(GameEvents.OnSecondPlayerJoined, names);
                    return;
                }
            }
        }
        const roomId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
        this.playerRoomMap.set(socket.id, roomId);
        this.playerGameMap.set(socket.id, { gameId: data.game, foundDifferences: [], playerName: data.playerName, secondPlayerId: '' });
        socket.join(roomId.toString());
    }

    @SubscribeMessage(GameEvents.OnClick)
    async onClick(socket: Socket, data: { position: number }) {
        const gameState = this.playerGameMap.get(socket.id);
        const rep = await this.imageService.findDifference(gameState.gameId, gameState.foundDifferences, data.position);
        const dataToSend: GameData = {
            differences: rep.foundDifference,
            amountOfDifferences: gameState.foundDifferences.length,
        };
        socket.emit(GameEvents.OnProcessedClick, dataToSend);
        if (rep.foundDifference.length > 0 && gameState.secondPlayerId !== '') {
            const room = this.playerRoomMap.get(socket.id);
            dataToSend.amountOfDifferencesSecondPlayer = gameState.foundDifferences.length;
            dataToSend.amountOfDifferences = this.playerGameMap.get(gameState.secondPlayerId).foundDifferences.length;
            socket.broadcast.to(room.toString()).emit(GameEvents.OnProcessedClick, dataToSend);
        }
        if (rep.won) {
            this.playerRoomMap.delete(socket.id);
            this.playerGameMap.delete(socket.id);
        }
    }

    handleDisconnect(socket: Socket) {
        this.playerRoomMap.delete(socket.id);
        this.playerGameMap.delete(socket.id);
    }
}
