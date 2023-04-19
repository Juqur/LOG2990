import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { VideoChatComponent } from './video-chat.component';

describe('VideoChatComponent', () => {
    let component: VideoChatComponent;
    let fixture: ComponentFixture<VideoChatComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [VideoChatComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(VideoChatComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('messagesList should return the messages list', () => {
        component['messages'] = [{ senderId: '1', sender: 'Charles', text: 'Hello world' }];
        const messageList = component.messagesList;
        expect(messageList).toEqual(component['messages']);
    });

    it('addMessage should add a message to the messages list and call scrollToBottom', fakeAsync(() => {
        component['messages'] = [];
        component.addMessage({ senderId: '1', sender: 'Charles', text: 'Hello world' });
        spyOn(component, 'scrollToBottom' as never);
        tick();
        expect(component['messages'].length).toEqual(1);
        expect(component.scrollToBottom).toHaveBeenCalledTimes(1);
    }));

    it('scrollToBottom should scroll to the bottom of the chat', () => {
        const scrollHeight = component.messagesContainer.nativeElement.scrollHeight;
        const scrollTop = component.messagesContainer.nativeElement.scrollTop;
        component.scrollToBottom();
        expect(scrollHeight).toEqual(scrollTop);
    });

    it('clearChat should clear the messages list', () => {
        component['messages'] = [{ senderId: '1', sender: 'Charles', text: 'Hello world' }];
        component.clearChat();
        expect(component['messages'].length).toEqual(0);
    });
});
