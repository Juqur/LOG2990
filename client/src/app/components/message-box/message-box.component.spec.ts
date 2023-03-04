import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIcon } from '@angular/material/icon';
import { By } from '@angular/platform-browser';

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

    it('Clicking on the icon should remove the current display message', () => {
        const input = fixture.debugElement.query(By.css('textarea'));
        const el = input.nativeElement;

        expect(el.value).toBe('');

        el.value = 'someValue';
        document.getElementById('send-icon')?.dispatchEvent(new Event('click'));

        expect(el.value).toBe('');
    });
});
