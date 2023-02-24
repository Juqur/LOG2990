import { Component } from '@angular/core';

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
export class MessageBoxComponent {
    displayName: string = 'Charles';
    messageToSend: string = '';

    /**
     * This method is used to send a message to the server.
     *
     * @param messageInput the HTML input containing the message.
     */
    sendMessage(messageInput: HTMLTextAreaElement) {
        this.messageToSend = messageInput.value;
        messageInput.value = '';
        // TODO
        // Send HTTP request to server in order to send the message.
    }
}
