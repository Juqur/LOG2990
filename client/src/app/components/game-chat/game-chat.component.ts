import { Component, OnDestroy, OnInit } from '@angular/core';
import { ChatMessage, SenderType } from '@common/chat-messages';
import { SocketHandler } from 'src/app/services/socket-handler.service';

@Component({
    selector: 'app-game-chat',
    templateUrl: './game-chat.component.html',
    styleUrls: ['./game-chat.component.scss'],
})

/**
 * Is the "container" of all messages sent in the game be they player sent or system sent.
 *
 * @author Charles Degrandpré
 * @class GameChatComponent
 */
export class GameChatComponent implements OnInit, OnDestroy {
    messages: ChatMessage[] = [];

    constructor(private socketHandler: SocketHandler) {}

    /**
     * Method in charge of creating a new message once it has been received by the server.
     */
    receiveMessage(message: ChatMessage): void {
        this.messages.push(message);
    }

    listenForMessages(): void {
        if (!this.socketHandler.isSocketAlive('game')) {
            this.socketHandler.connect('game');
        }
        this.socketHandler.on('game', 'messageSent', (message: ChatMessage) => {
            this.receiveMessage(message);
        });
    }

    ngOnInit(): void {
        this.listenForMessages();
        this.messages.push({
            sender: 'System',
            senderId: SenderType.System,
            text: 'Welcome to the game!',
        });
        this.messages.push({
            sender: 'unLama',
            senderId: SenderType.Player,
            text: 'Welcome to the game!',
        });
    }

    ngOnDestroy(): void {
        this.socketHandler.disconnect('game');
    }
}
