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

    /**
     * This method is called when a player joins a new game. It creates a new room and adds the player to it.
     * It also sets the player's game data and starts the timer.
     *
     * @param socket the socket of the player
     * @param data the data of the player, including the gameId and the playerName
     */
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
            socket.emit(GameEvents.SendTime, time + 1);
        }, DELAY_BEFORE_EMITTING_TIME);
        this.timeIntervalMap.set(socket.id, interval);
    }

    /**
     * This method is called when a player joins a multiplayer game.
     * If the player is the second player to join the game, it adds the player to the room of the other player.
     * Or else it creates a new room and adds the player to it.
     * It also sets the player's game data and starts the timer when both players are in the room.
     *
     * @param socket the socket of the player
     * @param data the data of the player, including the gameId and the playerName
     */
    @SubscribeMessage(GameEvents.OnJoinMultiplayerGame)
    onJoinMultiplayerGame(socket: Socket, data: { game: string; playerName: string }) {
        for (const [playerId, gameId] of this.playerGameMap.entries()) {
            if (playerId !== socket.id && gameId.gameId === data.game) {
                const room = this.playerRoomMap.get(playerId).toString();
                const names = [this.playerGameMap.get(playerId).playerName, data.playerName];
                if (this.server.sockets.adapter.rooms.get(room).size === 1) {
                    this.playerRoomMap.set(socket.id, this.playerRoomMap.get(playerId));
                    this.playerGameMap.set(socket.id, {
                        gameId: data.game,
                        foundDifferences: [],
                        playerName: data.playerName,
                        secondPlayerId: playerId,
                    });
                    this.playerGameMap.get(playerId).secondPlayerId = socket.id;
                    socket.join(room);
                    this.timeMap.set(room, 0);
                    const interval = setInterval(() => {
                        const time = this.timeMap.get(room);
                        this.timeMap.set(room, time + 1);
                        this.server.to(room).emit(GameEvents.SendTime, time + 1);
                    }, DELAY_BEFORE_EMITTING_TIME);
                    this.timeIntervalMap.set(room, interval);
                    this.server.to(room).emit(GameEvents.OnSecondPlayerJoined, names);
                    return;
                }
            }
        }
        const roomId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
        this.playerRoomMap.set(socket.id, roomId);
        this.playerGameMap.set(socket.id, { gameId: data.game, foundDifferences: [], playerName: data.playerName, secondPlayerId: '' });
        socket.join(roomId.toString());
    }
    /**
     * This method is called when a player clicks on the play area.
     * It checks whether the player has clicked on a difference or not.
     * It also sends the data to the other player if the player is in a multiplayer game.
     * It also deletes the player from the room and the game data when the player has won.
     *
     * @param socket the socket of the player
     * @param data the data of the player, including the position of the click
     */
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

    /**
     * This method is called when a player disconnects.
     * It deletes the player from all the maps
     *
     * @param socket the socket of the player
     */
    handleDisconnect(socket: Socket) {
        this.playerRoomMap.delete(socket.id);
        this.playerGameMap.delete(socket.id);
        if (this.timeIntervalMap.has(socket.id)) {
            this.timeIntervalMap.get(socket.id).unref();
            this.timeIntervalMap.delete(socket.id);
        }
        this.timeIntervalMap.delete(socket.id);
        this.timeMap.delete(socket.id);
    }
}
