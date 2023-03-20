import { Component, OnInit } from '@angular/core';
import { SocketHandler } from '@app/services/socketHandlerService/socket-handler.service';
import { ChatMessage, SenderType } from '@common/chat-messages';

/**
 * This component represents the box in chat to write and send a message.
 *
 * @author Charles Degrandpré & Louis Félix St-Amour
 * @class MessageBoxComponent
 */
@Component({
    selector: 'app-message-box',
    templateUrl: './message-box.component.html',
    styleUrls: ['./message-box.component.scss'],
})
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
     * since the sender is the player, the senderId is always SenderType.Player.
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
     * This method is called when the user presses a key in the message box.
     * It checks if the space bar was pressed and sends the message.
     *
     * @param event the event that triggered the method.
     * @param messageInput the HTML input containing the message.
     */
    onKeyDown(event: KeyboardEvent, messageInput: HTMLTextAreaElement): void {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.sendMessage(messageInput);
        }
    }

    /**
     * This method sends a message to the server
     * and clears the message box.
     *
     * @param messageInput the HTML input containing the message.
     */
    sendMessage(messageInput: HTMLTextAreaElement): void {
        const text: string = messageInput.value;
        this.socketHandler.send('game', 'onMessageReception', this.createMessage(text));
        messageInput.value = '';
    }

    /**
     * Starts the socket if it was not already started.
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
