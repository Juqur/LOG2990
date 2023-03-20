import { GameEvents } from '@app/gateways/game/game.gateway.events';
import { GameData, GameService } from '@app/services/game/game.service';
import { ChatMessage, SenderType } from '@common/chat-messages';
import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class ChatService {
    /**
     * This method sends a message to the other player.
     * It is used to send a message to the other player when a difference is found
     * or when a player clicked on a wring difference.
     *
     * @param socket The socket of the player.
     * @param dataToSend The data to send to the players.
     * @param gameService The game service.
     */
    sendSystemMessage(socket: Socket, dataToSend: GameData, gameService: GameService): void {
        const secondPlayerId = gameService.getGameState(socket.id).otherSocketId;
        const message: string = dataToSend.differencePixels.length === 0 ? 'Erreur' : 'Différence trouvée';
        const playerName: string = gameService.getGameState(socket.id).otherSocketId ? ' par ' + gameService.getGameState(socket.id).playerName : '';
        socket.emit(GameEvents.MessageSent, this.getSystemChatMessage(message + playerName));
        if (gameService.getGameState(socket.id).otherSocketId) {
            socket.to(secondPlayerId).emit(GameEvents.MessageSent, this.getSystemChatMessage(message + playerName));
        }
        if (secondPlayerId) {
            dataToSend.amountOfDifferencesFoundSecondPlayer = gameService.getGameState(socket.id).foundDifferences.length;
            socket.to(secondPlayerId).emit(GameEvents.ProcessedClick, dataToSend);
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
    sendToBothPlayers(socket: Socket, message: ChatMessage, gameService: GameService): void {
        message.sender = gameService.getGameState(socket.id).playerName;
        socket.emit(GameEvents.MessageSent, message);

        message.senderId = SenderType.Opponent;
        const secondPlayerId = gameService.getGameState(socket.id).otherSocketId;
        socket.to(secondPlayerId).emit(GameEvents.MessageSent, message);
    }

    abandonSequence(socket: Socket, gameService: GameService): void {
        const playerName: string = gameService.getGameState(socket.id).otherSocketId ? ' par ' + gameService.getGameState(socket.id).playerName : '';
        socket.emit(GameEvents.MessageSent, this.getSystemChatMessage(playerName + ' a abandonné la partie'));
        const secondPlayerId = gameService.getGameState(socket.id).otherSocketId;
        socket.to(secondPlayerId).emit(GameEvents.OpponentAbandoned);
    }

    private getSystemChatMessage(message: string): ChatMessage {
        return {
            sender: 'Système',
            senderId: SenderType.System,
            text: message,
        };
    }
}
