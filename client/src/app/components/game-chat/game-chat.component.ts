import { Component, OnInit } from '@angular/core';
import { Message } from '@app/messages';
import { SocketHandler } from 'src/app/services/socket-handler.service';

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
export class GameChatComponent implements OnInit {
    messages: Message[] = [];

    constructor(private socketHandler: SocketHandler) {}

    /**
     * Method in charge of creating a new message once it has been received by the server.
     *
     */
    receiveMessage(message: Message): void {
        this.messages.push(message);
    }

    listenForMessages(): void {
        if (!this.socketHandler.isSocketAlive('chat')) {
            this.socketHandler.connect('chat');
            this.socketHandler.send('chat', 'soloClassic');
            this.socketHandler.on('chat', 'message', (message: Message) => {
                this.receiveMessage(message);
            });
        }
    }

    ngOnInit(): void {
        this.listenForMessages();
    }
}
