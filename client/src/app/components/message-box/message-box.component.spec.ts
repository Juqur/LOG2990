import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIcon } from '@angular/material/icon';
import { By } from '@angular/platform-browser';
import { Message } from '@app/messages';

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
        const message: Message = { sender: '', text: 'someValue', playerId: 0 }; // test is not checking for sender
        const returnedMessage: Message = component.createMessage('someValue'); // has to be updated when sender is added
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

        expect(spySocketHandler.send).toHaveBeenCalledWith('chat', 'soloClassic', jasmine.any(Object));
        expect(messageInput.value).toEqual('');
    });
});
