import { Component, Input, OnInit } from '@angular/core';
import { Message } from '@app/messages';
import { Constants } from '@common/constants';

@Component({
    selector: 'app-chat-message',
    templateUrl: './chat-message.component.html',
    styleUrls: ['./chat-message.component.scss'],
})

/**
 * This component represents a message in the chat history.
 *
 * @author Charles Degrandpré
 * @class ChatMessageComponent
 */
export class ChatMessageComponent implements OnInit {
    @Input() message: Message = { sender: 'No name', text: 'No text', playerId: -1 };
    @Input() index: number = Constants.minusOne;

    displayName: string;

    /**
     * Limits the length of the name displayed to Constants.maxNameLengthShown. This has no impact
     * on the length of the name saved.
     */
    formatNameLength() {
        if (this.message.sender.length > Constants.maxNameLength) {
            this.displayName = this.message.sender.substring(0, Constants.maxNameLengthShown) + '...';
        } else {
            this.displayName = this.message.sender;
        }
    }

    ngOnInit(): void {
        this.formatNameLength();
    }
}
