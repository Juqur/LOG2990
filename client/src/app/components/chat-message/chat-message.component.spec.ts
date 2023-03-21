import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SenderType } from '@common/chat-messages';
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
            sender: 'I am a super long name',
            senderId: SenderType.Player,
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

    it('A message should have the class player if the message has an id = to SenderType.Player', () => {
        spyOn(component, 'formatNameLength' as never);

        component.ngOnInit();

        expect(document.getElementById('message-outer-box')).toBeTruthy();
        expect(document.getElementById('sender')?.classList).toContain('player');
    });

    it('A message should have the class opponent if the message has an id = SenderType.Opponent', () => {
        fixture = TestBed.createComponent(ChatMessageComponent);
        component = fixture.componentInstance;
        component['chatMessage'] = {
            sender: 'I am a super long name',
            senderId: SenderType.Opponent,
            text: 'Hello world',
        };
        fixture.detectChanges();
        spyOn(component, 'formatNameLength' as never);

        component.ngOnInit();

        expect(document.getElementById('message-outer-box')).toBeTruthy();
        expect(document.getElementById('sender')?.classList).toContain('opponent');
    });

    it('A message should have the class system if the message has an id = SenderType.System', () => {
        fixture = TestBed.createComponent(ChatMessageComponent);
        component = fixture.componentInstance;
        component['chatMessage'] = {
            sender: 'I am a super long name',
            senderId: SenderType.System,
            text: 'Hello world',
        };
        fixture.detectChanges();
        spyOn(component, 'formatNameLength' as never);

        component.ngOnInit();

        expect(document.getElementById('message-outer-box')).toBeTruthy();
        expect(document.getElementById('sender')?.classList).toContain('system');
    });

    it('should set chatMessage property when message input is set', () => {
        const message = {
            senderId: SenderType.Opponent,
            sender: 'angryOpponent23',
            text: 'Hell yeah i am gonna win',
        };
        component.ngOnInit();

        component.message = message;
        expect(component.message).toEqual(message);
    });
});
