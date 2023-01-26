import { Component } from '@angular/core';

@Component({
    selector: 'app-message-box',
    templateUrl: './message-box.component.html',
    styleUrls: ['./message-box.component.scss'],
})
export class MessageBoxComponent {
    displayName: string = 'Charles';
    messageToSend: string = '';

    sendMessage(messageInput: HTMLTextAreaElement) {
        this.messageToSend = messageInput.value;
        messageInput.value = '';
    }
}
