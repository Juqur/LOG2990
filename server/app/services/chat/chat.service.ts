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
    getSystemMessage(socket: Socket, dataToSend: GameData, gameService: GameService): void {
        const secondPlayerId = gameService.getGameState(socket.id).otherSocketId;
        const message: string = dataToSend.differencePixels.length === 0 ? 'ERREUR' : 'DIFFÉRENCE TROUVÉE';
        const playerName: string = gameService.getGameState(socket.id).otherSocketId ? ' par ' + gameService.getGameState(socket.id).playerName : '';
        const chatMessage: ChatMessage = {
            sender: 'Système',
            senderId: SenderType.System,
            text: message + playerName,
        };
        socket.emit(GameEvents.MessageSent, chatMessage);
        if (gameService.getGameState(socket.id).otherSocketId) {
            socket.to(secondPlayerId).emit(GameEvents.MessageSent, chatMessage);
        }
        if (secondPlayerId) {
            dataToSend.amountOfDifferencesFoundSecondPlayer = gameService.getGameState(socket.id).foundDifferences.length;
            socket.to(secondPlayerId).emit(GameEvents.ProcessedClick, dataToSend);
        }
    }
}
