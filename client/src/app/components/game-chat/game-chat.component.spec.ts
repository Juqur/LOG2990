import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatMessageComponent } from '@app/components/chat-message/chat-message.component';
import { MessageBoxComponent } from '@app/components/message-box/message-box.component';
// '../services/mouse-handler.service'

import SpyObj = jasmine.SpyObj;

import { GameChatComponent } from './game-chat.component';

describe('GameChatComponent', () => {
    let chatMessageComponentSpy: SpyObj<ChatMessageComponent>;
    let messageBoxComponentSpy: SpyObj<MessageBoxComponent>;
    let component: GameChatComponent;
    let fixture: ComponentFixture<GameChatComponent>;

    beforeEach(() => {
        chatMessageComponentSpy = jasmine.createSpyObj('ChatMessageComponent', ['formatNameLength', 'createMessageComponent']);
        messageBoxComponentSpy = jasmine.createSpyObj('MessageBoxComponent', ['sendMessage']);
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameChatComponent],
            providers: [
                { provide: ChatMessageComponent, useValue: chatMessageComponentSpy },
                { provide: MessageBoxComponent, useValue: messageBoxComponentSpy },
            ],
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
});
