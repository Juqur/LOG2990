import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { ChatMessage } from '@common/interfaces/chat-messages';

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

    /**
     * Getter for the display name attribute.
     */
    get messagesList(): ChatMessage[] {
        return this.messages;
    }

    /**
     * The message to add to the message box
     *
     * @param message The player's message.
     */
    addMessage(message: ChatMessage): void {
        this.messages.push(message);
        setTimeout(() => {
            this.scrollToBottom();
        }, 0);
    }

    /**
     * Scrolls the message box to the bottom.
     */
    scrollToBottom(): void {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    }

    /**
     * Clears the chat.
     */
    clearChat(): void {
        this.messages = [];
    }
}
