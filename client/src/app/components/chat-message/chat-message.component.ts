import { Component, Input, OnInit } from '@angular/core';
import { ChatMessage } from '@common/chat-messages';
import { Constants } from '@common/constants';

/**
 * This component represents a message in the chat history.
 *
 * @author Charles Degrandpré & Louis Félix St-Amour
 * @class ChatMessageComponent
 */
@Component({
    selector: 'app-chat-message',
    templateUrl: './chat-message.component.html',
    styleUrls: ['./chat-message.component.scss'],
})
export class ChatMessageComponent implements OnInit {
    private displayName: string;
    private chatMessage: ChatMessage;

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
        return this.chatMessage;
    }

    /**
     * Setter for the textMessage attribute
     *
     * @param message The message to be displayed
     */
    @Input()
    set message(message: ChatMessage) {
        this.chatMessage = message;
    }

    ngOnInit(): void {
        this.formatNameLength();
    }

    /**
     * Limits the length of the name displayed to Constants.maxNameLengthShown. This has no impact
     * on the length of the name saved.
     */
    private formatNameLength(): void {
        if (this.chatMessage.sender.length > Constants.maxNameLength) {
            this.displayName = this.chatMessage.sender.substring(0, Constants.maxNameLengthShown) + '...';
        } else {
            this.displayName = this.chatMessage.sender;
        }
    }
}
