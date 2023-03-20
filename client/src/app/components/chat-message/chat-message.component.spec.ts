import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatMessageComponent } from './chat-message.component';

describe('ChatMessageComponent', () => {
    let component: ChatMessageComponent;
    let fixture: ComponentFixture<ChatMessageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ChatMessageComponent],
        }).compileComponents();
        fixture = TestBed.createComponent(ChatMessageComponent);
        component = fixture.componentInstance;
        component['chatMessage'] = {
            senderId: '1',
            sender: 'I am a super long name',
            text: 'Hello world',
        };
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('Chat message should display the name with the appropriate length', () => {
        component['chatMessage'] = { senderId: '1', sender: 'Charles', text: 'Hello world' };

        component.ngOnInit();

        expect(component['displayName']).toEqual('Charles');
    });

    it('Chat message should cut name if name is to long', () => {
        component.ngOnInit();

        expect(component['displayName']).toEqual('I am a s...');
    });

    it('Chat message should cut name if name is to long', () => {
        component.ngOnInit();

        expect(component['displayName']).toEqual('I am a s...');
    });

    it('A message should have the class player1 if the message has an id of 1', () => {
        spyOn(component, 'formatNameLength');

        component.ngOnInit();

        expect(document.getElementById('message-outer-box')).toBeTruthy();
        expect(document.getElementById('sender')?.classList).toContain('player1');
    });

    it('A message should have the class player2 if the message has an id of 2', () => {
        fixture = TestBed.createComponent(ChatMessageComponent);
        component = fixture.componentInstance;
        component['chatMessage'] = {
            senderId: '2',
            sender: 'I am a super long name',
            text: 'Hello world',
        };
        fixture.detectChanges();
        spyOn(component, 'formatNameLength');

        component.ngOnInit();

        expect(document.getElementById('message-outer-box')).toBeTruthy();
        expect(document.getElementById('sender')?.classList).toContain('player2');
    });
});
