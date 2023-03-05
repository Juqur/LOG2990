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

    fit('should add chat message in the message array', () => {
        const message: Message = { sender: 'User', text: 'Hello world', playerId: 0 };
        component.receiveMessage(message);
        expect(component.messages[0]).toEqual(message);
    });

    fit('should call receiveMessage when message is sent from the server', () => {
        const message: Message = { sender: 'User', text: 'Hello world', playerId: 0 };

        expect(component.receiveMessage).toHaveBeenCalled();
    });

    // check if the socket is alive
});
