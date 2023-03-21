import { GameEvents } from '@app/gateways/game/game.gateway.events';
import { GameState } from '@app/services/game/game.service';
import { ChatMessage, SenderType } from '@common/chat-messages';
import { GameData } from '@common/game-data';
import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

/**
 * This service is used to send messages to the players.
 * It is used to send system messages and messages from the players.
 *
 * @author Louis Félix St-Amour
 * @class ChatService
 */
@Injectable()
export class ChatService {
    /**
     * This method sends a message to the other player.
     * It is used to send a message to the other player when a difference is found
     * or when a player clicked on a wrong difference.
     *
     * @param socket The socket of the player.
     * @param dataToSend The data to send to the players.
     * @param gameService The game service.
     */
    sendSystemMessage(socket: Socket, dataToSend: GameData, gameState: GameState): void {
        const otherSocketId = gameState.otherSocketId;
        const message: string = dataToSend.differencePixels.length === 0 ? 'Erreur' : 'Différence trouvée';
        const playerName: string = gameState.otherSocketId ? ' par ' + gameState.playerName : '';
        socket.emit(GameEvents.MessageSent, this.getSystemChatMessage(message + playerName));
        if (gameState.otherSocketId) {
            socket.to(otherSocketId).emit(GameEvents.MessageSent, this.getSystemChatMessage(message + playerName));
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
    sendToBothPlayers(socket: Socket, message: ChatMessage, gameState: GameState): void {
        socket.emit(GameEvents.MessageSent, message);

        message.senderId = SenderType.Opponent;
        const otherSocketId = gameState.otherSocketId;
        socket.to(otherSocketId).emit(GameEvents.MessageSent, message);
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
    abandonMessage(socket: Socket, gameState: GameState): void {
        const otherSocketId = gameState.otherSocketId;
        const playerName: string = gameState.playerName;
        socket.to(otherSocketId).emit(GameEvents.MessageSent, this.getSystemChatMessage(playerName + ' a abandonné la partie'));
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
