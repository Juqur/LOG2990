import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatMessageComponent } from '@app/components/chat-message/chat-message.component';
import { MessageBoxComponent } from '@app/components/message-box/message-box.component';
import { Message } from '@app/messages';
// '../services/mouse-handler.service'

import SpyObj = jasmine.SpyObj;

import { AppMaterialModule } from '@app/modules/material.module';
import { GameChatComponent } from './game-chat.component';

describe('GameChatComponent', () => {
    let chatMessageComponentSpy: SpyObj<ChatMessageComponent>;
    let messageBoxComponentSpy: SpyObj<MessageBoxComponent>;
    let component: GameChatComponent;
    let fixture: ComponentFixture<GameChatComponent>;

    beforeEach(() => {
        chatMessageComponentSpy = jasmine.createSpyObj('ChatMessageComponent', ['formatNameLength', 'createMessageComponent', 'ngOnInit']);
        messageBoxComponentSpy = jasmine.createSpyObj('MessageBoxComponent', ['sendMessage']);
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameChatComponent, MessageBoxComponent, ChatMessageComponent],
            providers: [
                { provide: ChatMessageComponent, useValue: chatMessageComponentSpy },
                { provide: MessageBoxComponent, useValue: messageBoxComponentSpy },
            ],
            imports: [AppMaterialModule],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GameChatComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should add a chat-message component when receiving a message', () => {
        const previousMessageCount: number = component.messages.length;
        const message: Message = { sender: 'User', text: 'Hello world', playerId: 0 };
        component.receiveMessage(message);
        expect(chatMessageComponentSpy.ngOnInit()).toHaveBeenCalledTimes(1);
        fixture.detectChanges();

        const newMessageCount: number = component.messages.length;
        expect(newMessageCount).toBe(previousMessageCount + 1);
        const chatMessageElements = fixture.nativeElement.querySelectorAll('app-chat-message');
        expect(chatMessageElements.length).toBe(newMessageCount);
    });
});
