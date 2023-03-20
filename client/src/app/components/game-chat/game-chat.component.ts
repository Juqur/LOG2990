import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { SocketHandler } from '@app/services/socketHandlerService/socket-handler.service';
import { ChatMessage } from '@common/chat-messages';

/**
 * Is the "container" of all messages sent in the game be they player sent or system sent.
 *
 * @author Charles Degrandpré & Louis Félix St-Amour
 * @class GameChatComponent
 */
@Component({
    selector: 'app-game-chat',
    templateUrl: './game-chat.component.html',
    styleUrls: ['./game-chat.component.scss'],
})
export class GameChatComponent implements OnInit, OnDestroy {
    @Input() isMultiplayer: boolean = true;
    @Input() playerName: string = '';
    @ViewChild('messagesContainer') messagesContainer: ElementRef<HTMLElement>;
    private messages: ChatMessage[] = [];

    constructor(private socketHandler: SocketHandler) {}

    /**
     * Getter for the display name attribute.
     */
    get messagesList(): ChatMessage[] {
        return this.messages;
    }

    /**
     * Method in charge of creating a new message once it has been received by the server.
     *
     * @param message The message received.
     */
    receiveMessage(message: ChatMessage): void {
        this.messages.push(message);
        if (this.messagesContainer) {
            this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
        }
    }

    ngOnInit(): void {
        this.listenForMessages();
    }

    ngOnDestroy(): void {
        this.socketHandler.removeListener('game', 'messageSent');
    }

    /**
     * Method to start listening for messages.
     */
    private listenForMessages(): void {
        if (!this.socketHandler.isSocketAlive('game')) {
            this.socketHandler.connect('game');
        }
        this.socketHandler.on('game', 'messageSent', (message: ChatMessage) => {
            this.receiveMessage(message);
        });
    }
}
