import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatMessageComponent } from '@app/components/chat-message/chat-message.component';
import { MessageBoxComponent } from '@app/components/message-box/message-box.component';

import SpyObj = jasmine.SpyObj;

import { ElementRef } from '@angular/core';
import { AppMaterialModule } from '@app/modules/material.module';
import { SocketHandler } from '@app/services/socket-handler/socket-handler.service';
import { ChatMessage } from '@common/chat-messages';
import { GameChatComponent } from './game-chat.component';

describe('GameChatComponent', () => {
    let component: GameChatComponent;
    let fixture: ComponentFixture<GameChatComponent>;
    let socketHandler: SpyObj<SocketHandler>;

    let chatMessageComponentSpy: SpyObj<ChatMessageComponent>;
    let messageBoxComponentSpy: SpyObj<MessageBoxComponent>;
    let listenForMessagesSpy: jasmine.Spy;

    beforeEach(() => {
        socketHandler = jasmine.createSpyObj('SocketHandler', ['on', 'isSocketAlive', 'connect', 'removeListener']);
        chatMessageComponentSpy = jasmine.createSpyObj('ChatMessageComponent', ['formatNameLength', 'createMessageComponent', 'ngOnInit']);
        messageBoxComponentSpy = jasmine.createSpyObj('MessageBoxComponent', ['sendMessage']);
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameChatComponent, MessageBoxComponent, ChatMessageComponent],
            providers: [
                { provide: ChatMessageComponent, useValue: chatMessageComponentSpy },
                { provide: MessageBoxComponent, useValue: messageBoxComponentSpy },
                { provide: SocketHandler, useValue: socketHandler },
            ],
            imports: [AppMaterialModule],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GameChatComponent);
        component = fixture.componentInstance;
        listenForMessagesSpy = spyOn(component, 'listenForMessages' as never);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('listenForMessages', () => {
        beforeEach(() => {
            spyOn(component, 'receiveMessage' as never);
            listenForMessagesSpy.and.callThrough();
        });

        it('should call isSocketAlive', () => {
            component['listenForMessages']();
            expect(socketHandler.isSocketAlive).toHaveBeenCalled();
        });

        it('should call connect if isSocketAlive is false', () => {
            socketHandler.isSocketAlive.and.returnValue(false);
            component['listenForMessages']();
            expect(socketHandler.connect).toHaveBeenCalled();
        });

        it('should call on', () => {
            socketHandler.isSocketAlive.and.returnValue(true);
            component['listenForMessages']();
            expect(socketHandler.on).toHaveBeenCalled();
        });

        it('should call on with the correct parameters', () => {
            const message = { sender: 'Player', senderId: 'player', text: 'Hello world' } as ChatMessage;
            socketHandler.isSocketAlive.and.returnValue(true);
            socketHandler.on.and.callFake((event, eventName, callback) => {
                if (eventName === 'messageSent') {
                    callback(message as never);
                }
            });
            component['listenForMessages']();
            expect(socketHandler.on).toHaveBeenCalledWith('game', 'messageSent', jasmine.any(Function));
        });
    });

    describe('receiveMessage', () => {
        it('should add chat message in the message array', () => {
            spyOn(component, 'scrollToBottom' as never);
            const message: ChatMessage = { sender: 'User', senderId: '0', text: 'Hello world' };
            component['receiveMessage'](message);
            expect(component['messages'][0]).toEqual(message);
        });
    });

    describe('scrollToBottom', () => {
        it('should call scrollIntoView', () => {
            const scrollTop = 50;
            const scrollHeight = 30;
            component['messagesContainer'] = { nativeElement: { scrollTop, scrollHeight } } as ElementRef<HTMLElement>;
            component['scrollToBottom']();
            expect(component['messagesContainer'].nativeElement.scrollTop).toEqual(scrollHeight);
        });
    });
});
