import { Component, OnInit } from '@angular/core';
import { ChatMessage } from '@common/chat-messages';
import { SocketHandler } from 'src/app/services/socket-handler.service';

@Component({
    selector: 'app-message-box',
    templateUrl: './message-box.component.html',
    styleUrls: ['./message-box.component.scss'],
})
/**
 * This component represents the box in chat to write and send a message.
 *
 * @author Charles Degrandpré
 * @class MessageBoxComponent
 */
export class MessageBoxComponent implements OnInit {
    private displayName: string = '';

    constructor(private socketHandler: SocketHandler) {}

    /**
     * Getter for the display name attribute.
     */
    get name(): string {
        return this.displayName;
    }

    /**
     * returns a Message object with the given message and the display name.
     */
    createMessage(message: string): ChatMessage {
        return {
            playerId: '0', // TODO: get the player id
            sender: this.displayName,
            text: message,
        };
    }

    /**
     * This method is used to send a message to the server.
     *
     * @param messageInput the HTML input containing the message.
     */
    sendMessage(messageInput: HTMLTextAreaElement): void {
        const text: string = messageInput.value;
        this.socketHandler.send('game', 'onMessageReception', this.createMessage(text));
        messageInput.value = '';
    }

    /**
     * starts the socket if it was not already started.
     */
    createSocket(): void {
        if (!this.socketHandler.isSocketAlive('game')) {
            this.socketHandler.connect('game');
        }
    }

    ngOnInit(): void {
        this.createSocket();
    }
}
