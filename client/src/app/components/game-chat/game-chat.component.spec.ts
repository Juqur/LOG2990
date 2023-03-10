import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatMessageComponent } from '@app/components/chat-message/chat-message.component';
import { MessageBoxComponent } from '@app/components/message-box/message-box.component';
import { ChatMessage } from '@common/chat-messages';

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

    it('should add chat message in the message array', () => {
        const message: ChatMessage = { playerId: '0', sender: 'User', text: 'Hello world' };

        component.receiveMessage(message);
        expect(component.messages[0]).toEqual(message);
    });

    it('should call receiveMessage when message is sent from the server', () => {
        const spyOnComponent = spyOn(component, 'receiveMessage');
        const message: ChatMessage = { playerId: '0', sender: 'User', text: 'Hello world' };
        const mockSocketHandler = jasmine.createSpyObj('socketHandler', ['on', 'isSocketAlive', 'send', 'connect']);
        mockSocketHandler.isSocketAlive.and.returnValue(false);
        mockSocketHandler.on.and.callFake((gateway: string, event: string, callback: (message: ChatMessage) => void) => {
            callback(message);
        });
        component['socketHandler'] = mockSocketHandler;
        component.listenForMessages();
        expect(mockSocketHandler.isSocketAlive).toHaveBeenCalled();
        expect(mockSocketHandler.connect).toHaveBeenCalled();
        expect(mockSocketHandler.send).toHaveBeenCalled();
        expect(mockSocketHandler.on).toHaveBeenCalled();
        expect(spyOnComponent).toHaveBeenCalled();
    });
});
