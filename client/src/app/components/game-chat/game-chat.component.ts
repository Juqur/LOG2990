import { Component } from '@angular/core';
import { messages } from '@app/messages';

@Component({
    selector: 'app-game-chat',
    templateUrl: './game-chat.component.html',
    styleUrls: ['./game-chat.component.scss'],
})
export class GameChatComponent {
    messages = messages;

    receiveMessage() {
        // TODO
        // Method to catch that a message has been received, wether that message is
        // a server wide message or not. THis should add the message to the .messages
        // div component in the HTML.
    }
}
