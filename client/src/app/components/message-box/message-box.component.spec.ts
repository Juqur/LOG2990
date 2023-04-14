import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIcon } from '@angular/material/icon';
import { By } from '@angular/platform-browser';
import { ChatMessage, SenderType } from '@common/interfaces/chat-messages';

import { MessageBoxComponent } from './message-box.component';

describe('MessageBoxComponent', () => {
    let component: MessageBoxComponent;
    let fixture: ComponentFixture<MessageBoxComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MessageBoxComponent, MatIcon],
        }).compileComponents();

        fixture = TestBed.createComponent(MessageBoxComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('Clicking on the icon should call sendMessage', () => {
        const fakeSendMessage = () => {
            /* nothing */
        };
        const spy = spyOn(component, 'sendMessage').and.callFake(fakeSendMessage);
        document.getElementById('send-icon')?.dispatchEvent(new Event('click'));

        expect(spy).toHaveBeenCalled();
    });

    it('createMessage should return a valid message', () => {
        const message: ChatMessage = { sender: component.playerName, senderId: SenderType.Player, text: 'someText' };
        const returnedMessage: ChatMessage = component['createMessage']('someText');
        expect(returnedMessage).toEqual(message);
    });

    it('Clicking on the icon should remove the current display message', () => {
        const input = fixture.debugElement.query(By.css('textarea'));
        const el = input.nativeElement;

        expect(el.value).toBe('');

        el.value = 'someValue';
        document.getElementById('send-icon')?.dispatchEvent(new Event('click'));

        expect(el.value).toBe('');
    });

    it('should send a message to the server', () => {
        const spySocketHandler = jasmine.createSpyObj('socketHandler', ['on', 'isSocketAlive', 'send', 'connect']);
        component['socketHandler'] = spySocketHandler;

        const messageInput = document.createElement('textarea');
        messageInput.value = 'Hello, world!';
        component.sendMessage(messageInput);

        expect(spySocketHandler.send).toHaveBeenCalledWith('game', 'onMessageReception', jasmine.any(Object));
        expect(messageInput.value).toEqual('');
    });

    it('should call sendMessage when Enter key is pressed without shift key', () => {
        const messageInput = fixture.nativeElement.querySelector('#message-input');
        spyOn(component, 'sendMessage');
        const event = new KeyboardEvent('keydown', { key: 'Enter', shiftKey: false });
        messageInput.dispatchEvent(event);
        expect(component.sendMessage).toHaveBeenCalledWith(messageInput);
    });

    it('should not call sendMessage when Enter key is pressed with shift key', () => {
        const messageInput = fixture.nativeElement.querySelector('#message-input');
        spyOn(component, 'sendMessage');
        const event = new KeyboardEvent('keydown', { key: 'Enter', shiftKey: true });
        messageInput.dispatchEvent(event);
        expect(component.sendMessage).not.toHaveBeenCalled();
    });
});
