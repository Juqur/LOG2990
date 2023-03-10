import { Component, Input, OnInit } from '@angular/core';
import { ChatMessage } from '@common/chat-messages';
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
    private displayName: string;
    private textMessage: ChatMessage;

    /**
     * Getter for the display name attribute.
     */
    get name(): string {
        return this.displayName;
    }

    /**
     * Getter for the textMessage attribute
     */
    get message(): ChatMessage {
        return this.textMessage;
    }

    @Input()
    set message(message: ChatMessage) {
        this.textMessage = message;
    }

    /**
     * Limits the length of the name displayed to Constants.maxNameLengthShown. This has no impact
     * on the length of the name saved.
     */
    formatNameLength(): void {
        if (this.textMessage.sender.length > Constants.maxNameLength) {
            this.displayName = this.textMessage.sender.substring(0, Constants.maxNameLengthShown) + '...';
        } else {
            this.displayName = this.textMessage.sender;
        }
    }

    ngOnInit(): void {
        this.formatNameLength();
    }
}
