import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { ChatMessage } from '@common/chat-messages';

@Component({
    selector: 'app-video-chat',
    templateUrl: './video-chat.component.html',
    styleUrls: ['./video-chat.component.scss'],
})
export class VideoChatComponent {
    @ViewChild('messagesContainer') messagesContainer: ElementRef<HTMLElement>;
    @Input() isMultiplayer: boolean = true;
    @Input() playerName: string = '';
    private messages: ChatMessage[] = [];

    // constructor() {}

    /**
     * Getter for the display name attribute.
     */
    get messagesList(): ChatMessage[] {
        return this.messages;
    }
}
