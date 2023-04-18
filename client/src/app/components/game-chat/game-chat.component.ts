import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { SocketHandler } from '@app/services/socket-handler/socket-handler.service';
import { ChatMessage } from '@common/interfaces/chat-messages';
import { Constants } from '@common/constants';

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
    @ViewChild('messagesContainer') messagesContainer: ElementRef<HTMLElement>;
    @Input() isMultiplayer: boolean = true;
    @Input() playerName: string = '';
    private messages: ChatMessage[] = [];

    constructor(private socketHandler: SocketHandler) {}

    /**
     * Getter for the display name attribute.
     */
    get messagesList(): ChatMessage[] {
        return this.messages;
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

    /**
     * Method in charge of creating a new message once it has been received by the server.
     * Also auto scrolls to the last message
     * The scroll needs a delay for the angular page to update before it
     * can scroll to the bottom.
     *
     * @param message The message received.
     */
    private receiveMessage(message: ChatMessage): void {
        this.messages.push(message);
        console.log('Message received: ' + message);
        setTimeout(() => {
            this.scrollToBottom();
        }, Constants.scrollDelay);
    }

    private scrollToBottom(): void {
        if (this.messagesContainer) {
            this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
        }
    }
}
