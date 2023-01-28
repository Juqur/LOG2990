import { Component, Input, OnInit } from '@angular/core';
import { Message } from '@app/messages';

@Component({
    selector: 'app-chat-message',
    templateUrl: './chat-message.component.html',
    styleUrls: ['./chat-message.component.scss'],
})
export class ChatMessageComponent implements OnInit {
    @Input() message: Message = { sender: 'No name', text: 'No text', hourPosted: '00:00', playerId: -1 };
    @Input() index: number | -1;

    displayName: string;

    formatNameLength() {
        if (this.message.sender.length > 11) {
            this.displayName = this.message.sender.substring(0, 8) + '...';
        } else {
            this.displayName = this.message.sender;
        }
    }

    createMessageComponent(): void {
        if (this.message.playerId === 1) {
            this.createMessageComponentPlayer1();
        } else {
            this.createMessageComponentPlayer2();
        }
    }

    createMessageComponentPlayer1() {
        document.getElementsByClassName('sender').item(this.index)?.classList.add('player1');
    }

    createMessageComponentPlayer2() {
        document.getElementsByClassName('sender').item(this.index)?.classList.add('player2');
    }

    ngOnInit(): void {
        this.formatNameLength();
        this.createMessageComponent();
    }
}
