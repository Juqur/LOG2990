import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogData, InputData, PopUpService } from '@app/services/popUpService/pop-up.service';

import { PopUpDialogComponent } from './pop-up-dialog.component';
import SpyObj = jasmine.SpyObj;

describe('PopUpDialogComponent', () => {
    let component: PopUpDialogComponent;
    let fixture: ComponentFixture<PopUpDialogComponent>;
    let matDialogueRefMock: SpyObj<MatDialogRef<PopUpService>>;
    let dialogData: DialogData;
    let inputMockData: SpyObj<InputData>;

    beforeEach(() => {
        matDialogueRefMock = jasmine.createSpyObj('MatDialogRef', ['close']);
        inputMockData = jasmine.createSpyObj('InputData', ['submitFunction']);
        dialogData = {
            textToSend: 'Hello',
            inputData: inputMockData,
            closeButtonMessage: 'Return to selection page',
        };
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MatDialogModule],
            declarations: [PopUpDialogComponent],
            providers: [
                { provide: MatDialogRef, useValue: matDialogueRefMock },
                { provide: MAT_DIALOG_DATA, useValue: dialogData },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(PopUpDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('Component should initiate with inputWasValid as false and inputValue as empty', () => {
        component['data'] = dialogData;
        expect(component['inputWasValid']).toEqual(false);
        expect(component['inputValue']).toEqual('');
    });

    it('If provided with dataInput in injected data, we should have an input in the html', () => {
        component['data'] = dialogData;
        expect(document.getElementById('pop-up-input')).toBeInstanceOf(HTMLInputElement);
        expect(document.getElementById('pop-up-input')).toBeTruthy();
    });

    it('If not provided with a dataInput in injected data, we should not have an input', () => {
        dialogData.inputData = undefined;
        fixture = TestBed.createComponent(PopUpDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        expect(document.getElementById('pop-up-input')).toBeNull();
    });

    it('If not provided with a dataInput in injected data, the exit button should be enabled', () => {
        dialogData.inputData = undefined;
        fixture = TestBed.createComponent(PopUpDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        expect((document.getElementById('close-button') as HTMLButtonElement).disabled).toEqual(false);
    });

    it('If provided with a dataInput, the button should be disabled', () => {
        expect((document.getElementById('close-button') as HTMLButtonElement).disabled).toEqual(true);
    });

    it('On close click should call MatDialogRef.close', () => {
        component.onCloseClick();
        expect(matDialogueRefMock.close).toHaveBeenCalledTimes(1);
    });

    it('submitText should call submitFunction from data.', () => {
        component.submitText('Hello world');
        expect(inputMockData.submitFunction).toHaveBeenCalledTimes(1);
    });

    it('Input was valid should be the same value as submitFunction', () => {
        inputMockData.submitFunction.and.returnValue(true);
        component.submitText('Hello world');
        expect(component['inputWasValid']).toEqual(true);

        inputMockData.submitFunction.and.returnValue(false);
        component.submitText('Hello world');
        expect(component['inputWasValid']).toEqual(false);
    });

    it('Input was valid should be false if the value string is empty', () => {
        component.submitText('');
        expect(component['inputWasValid']).toBeFalse();
    });

    it('Input was valid should be undefined if we have no inputData', () => {
        dialogData.inputData = undefined;
        fixture = TestBed.createComponent(PopUpDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        component.submitText('Hello');
        expect(component['inputWasValid']).toBeUndefined();
    });
});
