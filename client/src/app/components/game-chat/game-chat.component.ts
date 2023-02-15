import { Component } from '@angular/core';
import { messages } from '@app/messages';

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
export class GameChatComponent {
    messages = messages;

    /**
     * Method in charge of creating a new message once it has been received by the server.
     *
     * TODO
     * Figure out the value type and information necessary to be received to perform this action.
     */
    receiveMessage() {
        // TODO
        // Method to catch that a message has been received, wether that message is
        // a server wide message or not. THis should add the message to the .messages
        // div component in the HTML.
    }
}
