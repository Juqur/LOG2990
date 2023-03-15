import { ImageService } from '@app/services/image/image.service';
import { ChatMessage, SenderType } from '@common/chat-messages';
import { Injectable } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { randomUUID } from 'crypto';
import { Server, Socket } from 'socket.io';
import { DELAY_BEFORE_EMITTING_TIME } from './game.gateway.constants';
import { GameEvents } from './game.gateway.events';

export interface GameData {
    differences: number[];
    amountOfDifferences: number;
    amountOfDifferencesSecondPlayer?: number;
}

export interface GameState {
    gameId: number;
    foundDifferences: number[];
    playerName: string;
    secondPlayerId: string;
    waitingForSecondPlayer: boolean;
}

@WebSocketGateway({ cors: true })
@Injectable()

/**
 * This gateway is used to handle the game logic.
 *
 * @author Junaid Qureshi
 * @class GameGateway
 */
export class GameGateway {
    @WebSocketServer() private server: Server;
    private playerRoomMap = new Map<string, string>();
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
    onJoinSoloClassicGame(socket: Socket, data: { levelId: number; playerName: string }): void {
        const roomId = randomUUID();
        this.playerRoomMap.set(socket.id, roomId);
        this.playerGameMap.set(socket.id, {
            gameId: data.levelId,
            foundDifferences: [],
            playerName: data.playerName,
            secondPlayerId: '',
            waitingForSecondPlayer: false,
        });
        socket.join(roomId);
        this.timeMap.set(socket.id, 0);
        const interval = setInterval(() => {
            const time = this.timeMap.get(socket.id);
            this.timeMap.set(socket.id, time + 1);
            socket.emit(GameEvents.SendTime, time + 1);
        }, DELAY_BEFORE_EMITTING_TIME);
        this.timeIntervalMap.set(socket.id, interval);
    }

    @SubscribeMessage(GameEvents.OnClick)
    async onClick(socket: Socket, data: { position: number }): Promise<void> {
        const gameState = this.playerGameMap.get(socket.id);
        const id: string = gameState.gameId as unknown as string;
        const rep = await this.imageService.findDifference(id, gameState.foundDifferences, data.position);
        const dataToSend: GameData = {
            differences: rep.foundDifference,
            amountOfDifferences: gameState.foundDifferences.length,
        };
        socket.emit(GameEvents.OnProcessedClick, dataToSend);
        if (gameState.foundDifferences.length === rep.totalDifferences) {
            socket.emit(GameEvents.OnVictory);
            this.playerGameMap.delete(socket.id);
            this.playerRoomMap.delete(socket.id);
            this.timeMap.delete(socket.id);
            clearInterval(this.timeIntervalMap.get(socket.id));
        }
        if (rep.foundDifference.length > 0 && gameState.secondPlayerId !== '') {
            const room = this.playerRoomMap.get(socket.id);
            dataToSend.amountOfDifferencesSecondPlayer = gameState.foundDifferences.length;
            dataToSend.amountOfDifferences = this.playerGameMap.get(gameState.secondPlayerId).foundDifferences.length;
            socket.broadcast.to(room).emit(GameEvents.OnProcessedClick, dataToSend);

            const message: ChatMessage = {
                sender: 'Système',
                senderId: SenderType.System,
                text: 'Différence trouvée par ' + gameState.playerName,
            };
            this.server.to(room).emit(GameEvents.MessageSent, message);

            if (gameState.foundDifferences.length >= Math.ceil(rep.totalDifferences / 2)) {
                socket.emit(GameEvents.OnVictory);
                socket.broadcast.to(room).emit(GameEvents.OnDefeat);
                this.playerGameMap.delete(socket.id);
                this.playerGameMap.delete(gameState.secondPlayerId);
                this.playerRoomMap.delete(socket.id);
                this.playerRoomMap.delete(gameState.secondPlayerId);
                this.timeMap.delete(socket.id);
                this.timeMap.delete(gameState.secondPlayerId);
                clearInterval(this.timeIntervalMap.get(socket.id));
                clearInterval(this.timeIntervalMap.get(gameState.secondPlayerId));
            }
        } else if (rep.foundDifference.length === 0 && gameState.secondPlayerId !== '') {
            const room = this.playerRoomMap.get(socket.id);
            const message: ChatMessage = {
                sender: 'Système',
                senderId: SenderType.System,
                text: 'ERREUR par ' + gameState.playerName,
            };
            this.server.to(room).emit(GameEvents.MessageSent, message);
        }
    }

    @SubscribeMessage(GameEvents.OnGameSelection)
    onGameSelection(socket: Socket, data: { levelId: number; playerName: string }): void {
        if (data.playerName.length <= 2) {
            socket.emit(GameEvents.InvalidName);
        }
        for (const [secondPlayer, secondPlayerGameState] of this.playerGameMap.entries()) {
            if (secondPlayer !== socket.id && secondPlayerGameState.gameId === data.levelId) {
                const room = this.playerRoomMap.get(secondPlayer);
                if (this.server.sockets.adapter.rooms.get(room).size === 1 && secondPlayerGameState.waitingForSecondPlayer) {
                    // If the code reaches here, the player is trying to join a game
                    console.log('second player joined a game');
                    secondPlayerGameState.waitingForSecondPlayer = false;
                    secondPlayerGameState.secondPlayerId = socket.id;
                    this.playerGameMap.set(secondPlayer, secondPlayerGameState);
                    this.playerGameMap.set(socket.id, {
                        gameId: -1,
                        foundDifferences: [],
                        playerName: data.playerName,
                        secondPlayerId: secondPlayer,
                        waitingForSecondPlayer: false,
                    });
                    socket.emit(GameEvents.ToBeAccepted);
                    this.server.to(room).emit(GameEvents.PlayerSelection, data.playerName);
                    return;
                }
            }
        }
        // If the code reaches here, the player is the first player to join the game
        const roomId = randomUUID();
        this.playerRoomMap.set(socket.id, roomId);
        this.playerGameMap.set(socket.id, {
            gameId: data.levelId,
            foundDifferences: [],
            playerName: data.playerName,
            secondPlayerId: '',
            waitingForSecondPlayer: true,
        });
        socket.join(roomId);
        console.log(socket.id);
        console.log(this.playerGameMap.get(socket.id));
        this.server.emit(GameEvents.UpdateSelection, { levelId: data.levelId, canJoin: true });
    }

    @SubscribeMessage(GameEvents.OnGameCancelledWhileWaitingForSecondPlayer)
    onGameCancelledWhileWaitingForSecondPlayer(socket: Socket): void {
        console.log('game cancelled while waiting for second player ' + socket.id);
        this.server.emit(GameEvents.UpdateSelection, { levelId: this.playerGameMap.get(socket.id).gameId, canJoin: false });
        socket.leave(this.playerRoomMap.get(socket.id));
        this.playerRoomMap.delete(socket.id);
        this.playerGameMap.delete(socket.id);
    }

    @SubscribeMessage(GameEvents.OnGameAccepted)
    onGameAccepted(socket: Socket): void {
        const room = this.playerRoomMap.get(socket.id);
        console.log(socket.id);
        console.log(this.playerGameMap.get(socket.id));
        const secondPlayerId = this.playerGameMap.get(socket.id).secondPlayerId;
        const secondPlayerSocket = this.server.sockets.sockets.get(secondPlayerId);
        secondPlayerSocket.join(room);
        this.playerRoomMap.set(secondPlayerId, room);
        const secondPlayerGameState = this.playerGameMap.get(secondPlayerId);
        secondPlayerGameState.waitingForSecondPlayer = false;
        secondPlayerGameState.secondPlayerId = socket.id;
        secondPlayerGameState.gameId = this.playerGameMap.get(socket.id).gameId;
        this.playerGameMap.set(secondPlayerId, secondPlayerGameState);
        socket.emit(GameEvents.StartClassicMultiplayerGame, {
            levelId: secondPlayerGameState.gameId,
            playerName: this.playerGameMap.get(socket.id).playerName,
            secondPlayerName: secondPlayerGameState.playerName,
        });
        secondPlayerSocket.emit(GameEvents.StartClassicMultiplayerGame, {
            levelId: secondPlayerGameState.gameId,
            playerName: secondPlayerGameState.playerName,
            secondPlayerName: this.playerGameMap.get(socket.id).playerName,
        });
        this.timeMap.set(room, 0);
        const interval = setInterval(() => {
            const time = this.timeMap.get(room);
            this.timeMap.set(room, time + 1);
            this.server.to(room).emit(GameEvents.SendTime, time + 1);
        }, DELAY_BEFORE_EMITTING_TIME);
        this.timeIntervalMap.set(room, interval);
        this.server.emit(GameEvents.UpdateSelection, { levelId: secondPlayerGameState.gameId, canJoin: false });
    }

    @SubscribeMessage(GameEvents.OnGameRejected)
    onGameRejected(socket: Socket): void {
        console.log('game rejected');
        if (this.playerGameMap.has(socket.id)) {
            this.server.emit(GameEvents.UpdateSelection, { levelId: this.playerGameMap.get(socket.id).gameId, canJoin: false });
            const secondPlayerId = this.playerGameMap.get(socket.id).secondPlayerId;
            const secondPlayerSocket = this.server.sockets.sockets.get(secondPlayerId);
            this.playerGameMap.delete(socket.id);
            this.playerRoomMap.delete(socket.id);
            this.playerGameMap.delete(secondPlayerId);
            secondPlayerSocket.emit(GameEvents.RejectedGame);
        }
    }

    @SubscribeMessage(GameEvents.OnGameCancelledWhileWaitingForAcceptation)
    onGameCancelledWhileWaitingForAcceptation(socket: Socket): void {
        console.log('game cancelled');
        if (this.playerGameMap.has(socket.id)) {
            const secondPlayerId = this.playerGameMap.get(socket.id).secondPlayerId;
            const secondPlayerSocket = this.server.sockets.sockets.get(secondPlayerId);
            this.server.emit(GameEvents.UpdateSelection, { levelId: this.playerGameMap.get(secondPlayerId).gameId, canJoin: false });
            this.playerGameMap.delete(secondPlayerId);
            this.playerRoomMap.delete(secondPlayerId);
            this.playerGameMap.delete(socket.id);
            secondPlayerSocket.emit(GameEvents.RejectedGame);
        }
    }

    @SubscribeMessage(GameEvents.OnAbandon)
    onAbandon(socket: Socket): void {
        const room = this.playerRoomMap.get(socket.id);
        const gameState = this.playerGameMap.get(socket.id);
        socket.broadcast.to(room).emit(GameEvents.OpponentAbandoned);

        this.timeIntervalMap.get(room).unref();
        this.timeIntervalMap.delete(room);
        this.timeMap.delete(room);
        clearInterval(this.timeIntervalMap.get(socket.id));
        clearInterval(this.timeIntervalMap.get(gameState.secondPlayerId));
        this.playerRoomMap.delete(socket.id);
        this.playerGameMap.delete(socket.id);
    }

    @SubscribeMessage(GameEvents.OnMessageReception)
    onMessageReception(socket: Socket, message: ChatMessage): void {
        const room = this.playerRoomMap.get(socket.id);

        message.sender = this.playerGameMap.get(socket.id).playerName;
        socket.emit(GameEvents.MessageSent, message);
        message.senderId = SenderType.Opponent;
        socket.broadcast.to(room).emit(GameEvents.MessageSent, message);
    }

    /**
     * This method is called when a player disconnects.
     * It deletes the player from all the maps
     *
     * @param socket the socket of the player
     */
    handleDisconnect(socket: Socket): void {
        console.log('disconnected');
        socket.leave(this.playerRoomMap.get(socket.id));
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
