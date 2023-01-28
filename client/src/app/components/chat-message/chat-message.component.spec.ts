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
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('Chat message should display the name with the appropriate length', () => {
        component.message = { sender: 'Charles', text: 'Hello world', hourPosted: '01:00', playerId: 1 };
        component.index = 0;

        const fakeCreateMessageComponent = () => {
            /* nothing */
        };
        spyOn(component, 'createMessageComponent').and.callFake(fakeCreateMessageComponent);
        component.ngOnInit();

        expect(component.displayName).toEqual('Charles');
    });

    it('Chat message should cut name if name is to long', () => {
        component.message = {
            sender: 'I am a super long name',
            text: 'Hello world',
            hourPosted: '01:00',
            playerId: 1,
        };
        component.index = 0;

        const fakeCreateMessageComponent = () => {
            /* nothing */
        };
        spyOn(component, 'createMessageComponent').and.callFake(fakeCreateMessageComponent);
        component.ngOnInit();

        expect(component.displayName).toEqual('I am a s...');
    });

    it('Chat message should cut name if name is to long', () => {
        component.message = {
            sender: 'I am a super long name',
            text: 'Hello world',
            hourPosted: '01:00',
            playerId: 1,
        };
        component.index = 0;

        const fakeCreateMessageComponent = () => {
            /* nothing */
        };
        spyOn(component, 'createMessageComponent').and.callFake(fakeCreateMessageComponent);
        component.ngOnInit();

        expect(component.displayName).toEqual('I am a s...');
    });

    it('Create message should add player1 as class of sender', () => {
        component.message = {
            sender: 'I am a super long name',
            text: 'Hello world',
            hourPosted: '01:00',
            playerId: 1,
        };
        component.index = 0;

        const fakeFormatNameLength = () => {
            /* nothing */
        };
        spyOn(component, 'formatNameLength').and.callFake(fakeFormatNameLength);
        component.ngOnInit();

        expect(document.getElementById('message-outer-box')).toBeTruthy();
        expect(document.getElementById('sender')?.classList).toContain('player1');

        component.index = 1;
        component.ngOnInit();
        expect(document.getElementById('sender')?.classList).toContain('player1');
    });

    it('Create message should add player2 as class of sender', () => {
        component.message = {
            sender: 'I am a super long name',
            text: 'Hello world',
            hourPosted: '01:00',
            playerId: 2,
        };
        component.index = 0;

        const fakeFormatNameLength = () => {
            /* nothing */
        };
        spyOn(component, 'formatNameLength').and.callFake(fakeFormatNameLength);
        component.ngOnInit();

        expect(document.getElementById('message-outer-box')).toBeTruthy();
        expect(document.getElementById('sender')?.classList).toContain('player2');

        component.index = 1;
        component.ngOnInit();
        expect(document.getElementById('sender')?.classList).toContain('player2');
    });
});
