import { Component, Input, OnInit } from '@angular/core';
import { Message } from '@app/messages';

@Component({
    selector: 'app-chat-message',
    templateUrl: './chat-message.component.html',
    styleUrls: ['./chat-message.component.scss'],
})
export class ChatMessageComponent implements OnInit {
    @Input() message: Message;

    ngOnInit(): void {
        if (this.message.sender.length > 8) {
            this.message.sender = this.message.sender.substring(0, 5) + '...';
        }
    }
}
