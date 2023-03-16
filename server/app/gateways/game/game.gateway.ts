import { GameService } from '@app/services/game/game.service';
import { ImageService } from '@app/services/image/image.service';
import { TimerService } from '@app/services/timer/timer.service';
import { Injectable } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameEvents } from './game.gateway.events';

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

    constructor(private imageService: ImageService, private gameService: GameService, private timerService: TimerService) {}

    /**
     * This method is called when a player joins a new game. It creates a new room and adds the player to it.
     * It also sets the player's game data and starts the timer.
     *
     * @param socket the socket of the player
     * @param data the data of the player, including the gameId and the playerName
     */
    @SubscribeMessage(GameEvents.OnJoinNewGame)
    onJoinSoloClassicGame(socket: Socket, data: { levelId: number; playerName: string }): void {
        console.log('onJoinNewGame');
        this.gameService.createNewSoloGame(socket.id, { levelId: data.levelId, playerName: data.playerName });
        this.timerService.startTimer(socket.id, this.server, true);
    }

    @SubscribeMessage(GameEvents.OnClick)
    async onClick(socket: Socket, data: { position: number }): Promise<void> {
        const dataToSend = await this.gameService.getImageInfoOnClick(socket.id, data.position);
        socket.emit(GameEvents.OnProcessedClick, dataToSend);
        const secondPlayerId = this.gameService.getGameState(socket.id).secondPlayerId;
        if (secondPlayerId) {
            dataToSend.amountOfDifferencesFoundSecondPlayer = this.gameService.getGameState(secondPlayerId).foundDifferences.length;
            socket.to(socket.id).emit(GameEvents.OnProcessedClick, dataToSend);
        }
        if (this.gameService.verifyWinCondition(socket.id, dataToSend.totalDifferences)) {
            socket.emit(GameEvents.OnVictory);
            this.timerService.stopTimer(socket.id);
            this.gameService.deleteUserFromGame(socket.id);
            if (secondPlayerId) {
                socket.to(secondPlayerId).emit(GameEvents.OnDefeat);
                this.timerService.stopTimer(secondPlayerId);
            }
        }
    }

    @SubscribeMessage(GameEvents.OnGameSelection)
    onGameSelection(socket: Socket, data: { levelId: number; playerName: string }): void {
        if (data.playerName.length <= 2) {
            socket.emit(GameEvents.InvalidName);
        }
        const secondPlayerId = this.gameService.findAvailableGame(socket.id, this.server, data.levelId);
        if (secondPlayerId) {
            this.gameService.changeMultiplayerGameState(socket.id, secondPlayerId, data.playerName);
            socket.emit(GameEvents.ToBeAccepted);
            this.server.sockets.sockets.get(secondPlayerId).emit(GameEvents.PlayerSelection, data.playerName);
        } else {
            this.gameService.createNewSoloGame(socket.id, { levelId: data.levelId, playerName: data.playerName, waitingSecondPlayer: true });
            this.server.emit(GameEvents.UpdateSelection, { levelId: data.levelId, canJoin: true });
        }
    }

    @SubscribeMessage(GameEvents.OnGameAccepted)
    onGameAccepted(socket: Socket): void {
        const gameState = this.gameService.getGameState(socket.id);
        const secondPlayerSocket = this.server.sockets.sockets.get(gameState.secondPlayerId);
        this.gameService.connectRooms(socket, secondPlayerSocket);
        const secondPlayerName = this.gameService.getGameState(gameState.secondPlayerId).playerName;
        socket.emit(GameEvents.StartClassicMultiplayerGame, {
            levelId: gameState.gameId,
            playerName: gameState.playerName,
            secondPlayerName,
        });
        secondPlayerSocket.emit(GameEvents.StartClassicMultiplayerGame, {
            levelId: gameState.gameId,
            playerName: secondPlayerName,
            secondPlayerName: gameState.playerName,
        });
        this.timerService.startTimer(socket.id, this.server, true);
        this.server.emit(GameEvents.UpdateSelection, { levelId: gameState.gameId, canJoin: false });
    }

    @SubscribeMessage(GameEvents.OnGameCancelledWhileWaitingForSecondPlayer)
    onGameCancelledWhileWaitingForSecondPlayer(socket: Socket): void {
        this.server.emit(GameEvents.UpdateSelection, { levelId: this.gameService.getGameState(socket.id).gameId, canJoin: false });
        this.gameService.deleteUserFromGame(socket.id);
        this.timerService.stopTimer(socket.id);
    }

    @SubscribeMessage(GameEvents.OnGameRejected)
    onGameRejected(socket: Socket): void {
        this.server.emit(GameEvents.UpdateSelection, { levelId: this.gameService.getGameState(socket.id).gameId, canJoin: false });
        const secondPlayerId = this.gameService.getGameState(socket.id).secondPlayerId;
        this.gameService.deleteUserFromGame(socket.id);
        this.gameService.deleteUserFromGame(secondPlayerId);
        const secondPlayerSocket = this.server.sockets.sockets.get(secondPlayerId);
        secondPlayerSocket.emit(GameEvents.RejectedGame);
    }

    /**
     * This method is called when a player disconnects.
     * It deletes the player from all the maps and rooms
     *
     * @param socket the socket of the player
     */
    handleDisconnect(socket: Socket): void {
        console.log('handleDisconnect');
        this.gameService.deleteUserFromGame(socket.id);
        this.timerService.stopTimer(socket.id);
        // Make sure to remove the player from the opponents room if he is in a multiplayer game
    }
}
