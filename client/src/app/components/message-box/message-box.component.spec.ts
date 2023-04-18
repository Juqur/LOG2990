import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIcon } from '@angular/material/icon';

import { SocketHandler } from '@app/services/socket-handler/socket-handler.service';
import { MessageBoxComponent } from './message-box.component';

describe('MessageBoxComponent', () => {
    let component: MessageBoxComponent;
    let fixture: ComponentFixture<MessageBoxComponent>;
    let socketHandler: jasmine.SpyObj<SocketHandler>;
    let createSocketSpy: jasmine.Spy;
    let messageInput: HTMLTextAreaElement;

    beforeEach(async () => {
        messageInput = {
            value: 'Time to test!',
        } as HTMLTextAreaElement;
        socketHandler = jasmine.createSpyObj('SocketHandler', ['send', 'isSocketAlive', 'connect', 'removeListener']);

        await TestBed.configureTestingModule({
            declarations: [MessageBoxComponent, MatIcon],
            providers: [{ provide: SocketHandler, useValue: socketHandler }],
        }).compileComponents();

        fixture = TestBed.createComponent(MessageBoxComponent);
        component = fixture.componentInstance;
        createSocketSpy = spyOn(component, 'createSocket' as never);
        fixture.detectChanges();
        createSocketSpy.calls.reset();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit', () => {
        it('should call createSocket', () => {
            component.ngOnInit();
            expect(createSocketSpy).toHaveBeenCalledTimes(1);
        });
    });

    describe('onKeyDown', () => {
        let mockedEvent: KeyboardEvent;
        let preventDefaultSpy: jasmine.Spy;
        let sendMessageSpy: jasmine.Spy;

        beforeEach(() => {
            preventDefaultSpy = jasmine.createSpy('preventDefault');
            mockedEvent = {
                key: 'Enter',
                preventDefault: preventDefaultSpy,
            } as unknown as KeyboardEvent;
            sendMessageSpy = spyOn(component, 'sendMessage');
        });

        it('should call preventDefault if the key is Enter', () => {
            component.onKeyDown(mockedEvent, messageInput);
            expect(preventDefaultSpy).toHaveBeenCalledTimes(1);
        });

        it('should call sendMessage if the key is Enter', () => {
            component.onKeyDown(mockedEvent, messageInput);
            expect(sendMessageSpy).toHaveBeenCalledTimes(1);
        });
    });

    describe('sendMessage', () => {
        let createMessageSpy: jasmine.Spy;

        beforeEach(() => {
            createMessageSpy = spyOn(component, 'createMessage' as never).and.returnValue({} as never);
        });

        it('should call createMessage with the messageInput value', () => {
            component.sendMessage(messageInput);
            expect(createMessageSpy).toHaveBeenCalledTimes(1);
        });

        it('should call send if the messageInput is not empty', () => {
            component.sendMessage(messageInput);
            expect(socketHandler.send).toHaveBeenCalledOnceWith('game', 'onMessageReception', {});
        });
    });

    describe('createSocket', () => {
        it('should call connect if the socket is not alive', () => {
            createSocketSpy.and.callThrough();
            socketHandler.isSocketAlive.and.returnValue(false);
            component['createSocket']();
            expect(socketHandler.connect).toHaveBeenCalledTimes(1);
        });
    });

    describe('createMessage', () => {
        it('should return a valid message', () => {
            const message = component['createMessage']('someText');
            expect(message).toEqual({ sender: component.playerName, senderId: 'player', text: 'someText' });
        });
    });
});
