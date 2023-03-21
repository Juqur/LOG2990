import { ChatService } from '@app/services/chat/chat.service';
import { GameService } from '@app/services/game/game.service';
import { TimerService } from '@app/services/timer/timer.service';
import { ChatMessage } from '@common/chat-messages';
import { Injectable } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameEvents } from './game.gateway.events';

/**
 * This gateway is used to handle to all socket events.
 *
 * @author Junaid Qureshi & Pierre Tran
 * @class GameGateway
 */
@WebSocketGateway({ cors: true })
@Injectable()
export class GameGateway {
    @WebSocketServer() private server: Server;

    constructor(private gameService: GameService, private timerService: TimerService, private chatService: ChatService) {}

    /**
     * This method is called when a player joins a new game. It creates a new room and adds the player to it.
     * It also sets the player's game data and starts the timer.
     *
     * @param socket The socket of the player.
     * @param data The data of the player, including the levelId and the playerName.
     */
    @SubscribeMessage(GameEvents.OnJoinNewGame)
    onJoinSoloClassicGame(socket: Socket, data: { levelId: number; playerName: string }): void {
        this.gameService.createGameState(socket.id, { levelId: data.levelId, playerName: data.playerName }, false);
        this.timerService.startTimer(socket.id, this.server, true);
    }

    /**
     * This method is called when a player clicks on the image. It sends back the pixels of the difference,
     * the total amount of differences in the level, the amount of differences found, and the amount of differences found
     * by the second player if it is a multiplayer match.
     * It also checks if the player is in a multiplayer match and sends the information to the other player.
     * It also checks if the player has won the game and sends a victory event to the client.
     * If the match is multiplayer, it also checks if the player has won and sends a defeat event to the other player.
     *
     * @param socket The socket of the player.
     * @param position The position of the pixel that was clicked.
     */
    @SubscribeMessage(GameEvents.OnClick)
    async onClick(socket: Socket, position: number): Promise<void> {
        const dataToSend = await this.gameService.getImageInfoOnClick(socket.id, position);
        socket.emit(GameEvents.ProcessedClick, dataToSend);
        const otherSocketId = this.gameService.getGameState(socket.id).otherSocketId;

        this.chatService.sendSystemMessage(socket, dataToSend, this.gameService);

        if (otherSocketId) {
            dataToSend.amountOfDifferencesFoundSecondPlayer = this.gameService.getGameState(socket.id).foundDifferences.length;
            socket.to(otherSocketId).emit(GameEvents.ProcessedClick, dataToSend);
        }

        if (this.gameService.verifyWinCondition(socket, this.server, dataToSend.totalDifferences)) {
            socket.emit(GameEvents.Victory);
            this.timerService.stopTimer(socket.id);
            this.gameService.deleteUserFromGame(socket);
            if (otherSocketId) {
                this.server.sockets.sockets.get(otherSocketId).emit(GameEvents.Defeat);
                this.timerService.stopTimer(otherSocketId);
                const otherSocket = this.server.sockets.sockets.get(otherSocketId);
                this.gameService.deleteUserFromGame(otherSocket);
            }
        }
    }

    /**
     * This method is called when the player creates or joins an online game.
     * It checks if the name is valid.
     * It checks if there is a room available and if there is, it sends an invite to the other player.
     * If there is no room available, it creates a new room and updates the selection page.
     *
     * @param socket The socket of the player.
     * @param data The data of the player, including the levelId and the playerName.
     */
    @SubscribeMessage(GameEvents.OnGameSelection)
    onGameSelection(socket: Socket, data: { levelId: number; playerName: string }): void {
        if (data.playerName.length <= 1) {
            socket.emit(GameEvents.InvalidName);
            return;
        }

        this.gameService.createGameState(socket.id, { levelId: data.levelId, playerName: data.playerName }, true);
        const otherPlayerId = this.gameService.findAvailableGame(socket.id, data.levelId);
        if (otherPlayerId) {
            this.gameService.bindPlayers(socket.id, otherPlayerId);
            socket.emit(GameEvents.ToBeAccepted);
            this.server.sockets.sockets.get(otherPlayerId).emit(GameEvents.PlayerSelection, data.playerName);
        } else {
            this.server.emit(GameEvents.UpdateSelection, { levelId: data.levelId, canJoin: true });
        }
    }

    /**
     * This method is called when a player accepts a game invite.
     * It connects the two rooms and sends the level id, and both players names to each player.
     * It starts the timer and updates the selection page.
     *
     * @param socket The socket of the player.
     */
    @SubscribeMessage(GameEvents.OnGameAccepted)
    onGameAccepted(socket: Socket): void {
        const gameState = this.gameService.getGameState(socket.id);
        const secondPlayerSocket = this.server.sockets.sockets.get(gameState.otherSocketId);
        this.gameService.connectRooms(socket, secondPlayerSocket);
        const secondPlayerName = this.gameService.getGameState(gameState.otherSocketId).playerName;
        socket.emit(GameEvents.StartClassicMultiplayerGame, {
            levelId: gameState.levelId,
            playerName: gameState.playerName,
            secondPlayerName,
        });
        secondPlayerSocket.emit(GameEvents.StartClassicMultiplayerGame, {
            levelId: gameState.levelId,
            playerName: secondPlayerName,
            secondPlayerName: gameState.playerName,
        });
        this.timerService.startTimer(socket.id, this.server, true, secondPlayerSocket.id);
        this.server.emit(GameEvents.UpdateSelection, { levelId: gameState.levelId, canJoin: false });
    }

    /**
     * This method is called when a player cancels a game while waiting for a second player.
     * It updates the selection page join button.
     * It removes the player from the game.
     *
     * @param socket The socket of the player.
     */
    @SubscribeMessage(GameEvents.OnCancelledWhileWaiting)
    onCancelledWhileWaiting(socket: Socket): void {
        this.server.emit(GameEvents.UpdateSelection, { levelId: this.gameService.getGameState(socket.id).levelId, canJoin: false });
        this.gameService.deleteUserFromGame(socket);
    }

    /**
     * This method is called when a player rejects a game.
     * It updates the selection page join button.
     * It removes the player and the other player from the game.
     * It emits a event to the other player to tell them that the game was rejected.
     *
     * @param socket The socket of the player.
     */
    @SubscribeMessage(GameEvents.OnGameRejected)
    onGameRejected(socket: Socket): void {
        this.server.emit(GameEvents.UpdateSelection, { levelId: this.gameService.getGameState(socket.id).levelId, canJoin: false });
        const secondPlayerId = this.gameService.getGameState(socket.id).otherSocketId;
        this.gameService.deleteUserFromGame(socket);
        this.gameService.deleteUserFromGame(this.server.sockets.sockets.get(secondPlayerId));
        const secondPlayerSocket = this.server.sockets.sockets.get(secondPlayerId);
        secondPlayerSocket.emit(GameEvents.RejectedGame);
    }

    /**
     * This method is called when a player tries to delete a level.
     * It checks if the level is being played and if it is, it adds it to the deletion queue.
     * It also emits a event to all players to shut down anyone trying to play the level.
     * It also removes the level from the list of levels that players can join.
     *
     * @param socket The socket of the player.
     * @param levelId The id of the level to be deleted.
     */
    @SubscribeMessage(GameEvents.OnDeleteLevel)
    onDeleteLevel(socket: Socket, levelId: number): void {
        this.server.emit(GameEvents.DeleteLevel, levelId);
        for (const socketIds of this.gameService.getPlayersWaitingForGame(levelId)) {
            this.server.sockets.sockets.get(socketIds).emit(GameEvents.ShutDownGame);
        }
        if (this.gameService.verifyIfLevelIsBeingPlayed(levelId)) {
            this.gameService.addLevelToDeletionQueue(levelId);
        } else {
            this.gameService.deleteLevel(levelId);
        }
    }

    /**
     * This method is called when a player sends a message.
     *
     * @param socket The socket of the player who sent the message.
     * @param message The message to be sent.
     */
    @SubscribeMessage(GameEvents.OnMessageReception)
    onMessageReception(socket: Socket, message: ChatMessage): void {
        this.chatService.sendToBothPlayers(socket, message, this.gameService);
    }

    /**
     * This method is called when the player abandons the game.
     *
     * @param socket the socket of the player
     */
    @SubscribeMessage(GameEvents.OnAbandonGame)
    onAbandonGame(socket: Socket): void {
        this.handlePlayerLeavingGame(socket);
    }

    /**
     * Method called when the player toggles on the cheat mode.
     *
     * @param socket the socket of the player
     */
    @SubscribeMessage(GameEvents.OnStartCheatMode)
    async onStartCheatMode(socket: Socket): Promise<void> {
        const data = await this.gameService.startCheatMode(socket.id);
        socket.emit(GameEvents.StartCheatMode, data);
    }

    /**
     * Method called when the player toggles off the cheat mode.
     *
     * @param socket the socket of the player
     */
    @SubscribeMessage(GameEvents.OnStopCheatMode)
    onStopCheatMode(socket: Socket): void {
        this.gameService.stopCheatMode(socket.id);
    }

    /**
     * This method is called when a player disconnects.
     * Handles unexpected disconnections such as page refreshes.
     *
     * @param socket The socket of the player.
     */
    handleDisconnect(socket: Socket): void {
        this.handlePlayerLeavingGame(socket);
    }

    /**
     * This method deletes the player from all the maps and rooms.
     * It stops the timer of the player.
     * It removes the level from the deletion queue if it is there.
     * If the match is multiplayer, the other player wins.
     *
     * @param socket The socket of the player.
     */
    private handlePlayerLeavingGame(socket: Socket): void {
        const gameState = this.gameService.getGameState(socket.id);
        if (gameState) {
            this.gameService.removeLevelFromDeletionQueue(gameState.levelId);
            if (gameState.otherSocketId) {
                const otherSocket = this.server.sockets.sockets.get(gameState.otherSocketId);
                this.chatService.abandonMessage(socket, this.gameService);
                otherSocket.emit(GameEvents.OpponentAbandoned);
                this.gameService.deleteUserFromGame(otherSocket);
            }
            this.gameService.deleteUserFromGame(socket);
            this.timerService.stopTimer(socket.id);
        }
    }
}
