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
    @Input() isMultiplayer: boolean = true;
    private time: string;
    private displayName: string;
    private chatMessage: ChatMessage;

    /**
     * Getter for the timeSent attribute.
     */
    get timeReceived(): string {
        return this.time;
    }

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
     * @param message The message to be displayed.
     */
    @Input()
    set message(message: ChatMessage) {
        this.chatMessage = message;
    }

    /**
     * Initializes the component.
     * Formats the name and time.
     */
    ngOnInit(): void {
        this.formatNameLength();
        this.time = this.formatTime();
    }

    /**
     * Limits the length of the name displayed to Constants.maxNameLengthShown.
     * This has no impact on the length of the name saved.
     */
    private formatNameLength(): void {
        this.displayName =
            this.chatMessage.sender.length > Constants.maxNameLength
                ? (this.displayName = this.chatMessage.sender.substring(0, Constants.maxNameLengthShown) + '...')
                : (this.displayName = this.chatMessage.sender);
    }

    /**
     * Formats the time received to a string.
     *
     * @returns The formatted time.
     */
    private formatTime(): string {
        const date = new Date();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    }
}
