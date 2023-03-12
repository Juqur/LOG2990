import { Component, OnInit } from '@angular/core';
import { ChatMessage, SenderType } from '@common/chat-messages';
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
     * the senderId is set to undefined because the server since the client does not
     * know if he is player1 or player2.
     * undefined is used rather than '' to easily see errors.
     *
     * @param message the message to send.
     * @returns message formated in a ChatMessage interface.
     */
    createMessage(message: string): ChatMessage {
        return {
            sender: this.displayName,
            senderId: SenderType.Player,
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
