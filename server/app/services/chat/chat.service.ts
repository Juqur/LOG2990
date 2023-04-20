import { GameEvents } from '@app/gateways/game/game.gateway.events';
import { GameState } from '@app/services/game/game.service';
import { MongodbService } from '@app/services/mongodb/mongodb.service';
import { ChatMessage, SenderType } from '@common/interfaces/chat-messages';
import { GameData } from '@common/interfaces/game-data';
import { Level } from '@common/interfaces/level';
import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

/**
 * This service is used to send messages to the players.
 * It is used to send system messages and messages from the players.
 *
 * @author Louis Félix St-Amour
 * @class ChatService
 */
@Injectable()
export class ChatService {
    constructor(private mongodbService: MongodbService) {}

    /**
     * This method sends a message all current players.
     * It is used to send a message to all players currently in a game.
     *
     * @param socket The socket of the player.
     * @param message The message to send.
     * */
    async sendSystemGlobalHighscoreMessage(server: Server, gameState: GameState, playerPosition: number): Promise<void> {
        const level: Level = await this.mongodbService.getLevelById(gameState.levelId);
        const playerPositionSyntax: string = playerPosition === 1 ? 'ère' : 'e';
        const gameMode: string = gameState.otherSocketId ? '1V1' : 'SOLO';

        const timeBeatenMessage: string =
            gameState.playerName +
            ' obtient la ' +
            playerPosition +
            playerPositionSyntax +
            ' place dans les meilleurs temps du jeu "' +
            level.name +
            '" en ' +
            gameMode;
        server.emit(GameEvents.MessageSent, this.getSystemChatMessage(timeBeatenMessage));
    }

    /**
     * This method sends a message to the other player.
     * It is used to send a message to the other player when a difference is found
     * or when a player clicked on a wrong difference.
     *
     * @param socket The socket of the player.
     * @param dataToSend The data to send to the players.
     * @param gameService The game service.
     */
    sendSystemMessage(sockets: { socket: Socket; server: Server }, dataToSend: GameData, gameState: GameState): void {
        const otherSocketId = gameState.otherSocketId;
        const message: string = dataToSend.differencePixels.length === 0 ? 'Erreur' : 'Différence trouvée';
        const playerName: string = gameState.otherSocketId ? ' par ' + gameState.playerName : '';
        sockets.socket.emit(GameEvents.MessageSent, this.getSystemChatMessage(message + playerName));
        if (otherSocketId) {
            sockets.server.sockets.sockets.get(otherSocketId).emit(GameEvents.MessageSent, this.getSystemChatMessage(message + playerName));
        }
    }

    /**
     * This method sends a message to both players.
     * It changes the senderID accordingly for the color of display.
     * It also changes the sender name to the name of the player who sent the message.
     *
     * @param socket The socket of the player.
     * @param message The message to send.
     * @param gameService The game service of game.gateway.ts.
     */
    sendToBothPlayers(sockets: { socket: Socket; server: Server }, message: ChatMessage, gameState: GameState): void {
        sockets.socket.emit(GameEvents.MessageSent, message);
        message.senderId = SenderType.Opponent;
        const otherSocketId = gameState.otherSocketId;
        sockets.server.sockets.sockets.get(otherSocketId).emit(GameEvents.MessageSent, message);
    }

    /**
     * This method sends a message to the other player.
     * It is used to send a message to the other player when a player leaves the game.
     * It also changes the senderID accordingly for the color of display.
     * It also changes the sender name to the name of the player who sent the message.
     *
     * @param socket The socket of the player.
     * @param gameService The game service of game.gateway.ts.
     */
    abandonMessage(server: Server, gameState: GameState): void {
        const otherSocketId = gameState.otherSocketId;
        const playerName: string = gameState.playerName;
        server.sockets.sockets.get(otherSocketId).emit(GameEvents.MessageSent, this.getSystemChatMessage(playerName + ' a abandonné la partie'));
    }

    /**
     * This method sends a simple message to the player.
     *
     * @param socket The socket of the player.
     * @param message The message to send.
     */
    sendMessageToPlayer(socket: Socket, message: string): void {
        socket.emit(GameEvents.MessageSent, this.getSystemChatMessage(message));
    }

    /**
     * This method creates a ChatMessage object with
     * the sender set to 'Système' and the senderId set to SenderType.System.
     *
     * @param message The message to send.
     */
    private getSystemChatMessage(message: string): ChatMessage {
        return {
            sender: 'Système',
            senderId: SenderType.System,
            text: message,
        };
    }
}
