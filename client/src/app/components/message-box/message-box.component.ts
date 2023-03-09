import { Component, OnInit } from '@angular/core';
import { Message } from '@app/messages';
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
    createMessage(message: string): Message {
        return {
            sender: this.displayName,
            text: message,
            playerId: 0,
        };
    }

    /**
     * This method is used to send a message to the server.
     *
     * @param messageInput the HTML input containing the message.
     */
    sendMessage(messageInput: HTMLTextAreaElement): void {
        messageInput.value = '';
        this.socketHandler.send('chat', 'soloClassic', this.createMessage(document.getElementById('message-input').value));
    }

    createSocket(): void {
        if (!this.socketHandler.isSocketAlive('chat')) {
            this.socketHandler.connect('chat');
            this.socketHandler.send('chat', 'soloClassic');
        }
    }

    ngOnInit(): void {
        this.createSocket();
    }
}
