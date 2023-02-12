import { TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';

import { AppModule } from '@app/app.module';
import { PopUpDialogComponent } from '@app/components/pop-up-dialog/pop-up-dialog.component';
import { Constants } from '@common/constants';
import { of } from 'rxjs';
import { DialogData, PopUpServiceService } from './pop-up-service.service';

describe('PopUpServiceService', () => {
    let service: PopUpServiceService;
    let dialogRef: MatDialogRef<PopUpDialogComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MatDialogModule, RouterTestingModule, AppModule],
            providers: [
                PopUpServiceService,
                {
                    provide: MatDialogRef,
                    useValue: { afterClosed: () => of({}) },
                },
                { provide: MAT_DIALOG_DATA, useValue: {} },
            ],
        });
        service = TestBed.inject(PopUpServiceService);
        dialogRef = TestBed.inject(MatDialogRef);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('OpenDialog should call open from dialog data', () => {
        spyOn(dialogRef, 'afterClosed').and.returnValue(of({}));
        spyOn(service.dialog, 'open').and.returnValue(dialogRef);

        const dialogData: DialogData = {
            textToSend: 'some text',
            closeButtonMessage: 'close button message',
        };

        service.openDialog(dialogData);
        expect(service.dialog.open).toHaveBeenCalledTimes(1);
    });

    it('should call afterClosed', () => {
        spyOn(dialogRef, 'afterClosed').and.returnValue(of({}));
        spyOn(service.dialog, 'open').and.returnValue(dialogRef);

        const dialogData: DialogData = {
            textToSend: 'some text',
            closeButtonMessage: 'close button message',
        };
        service.openDialog(dialogData);

        expect(dialogRef.afterClosed).toHaveBeenCalledTimes(1);
    });

    it('should navigate to the correct route', () => {
        spyOn(dialogRef, 'afterClosed').and.returnValue(of({}));
        spyOn(service.dialog, 'open').and.returnValue(dialogRef);
        const spy = spyOn(service['router'], 'navigate');

        const dialogData: DialogData = {
            textToSend: 'some text',
            closeButtonMessage: 'close button message',
        };
        const routeToGo = '/some-route';

        service.openDialog(dialogData, routeToGo);

        expect(spy).toHaveBeenCalledOnceWith([routeToGo]);
    });

    it('If the pop up has an input, we should get a result string', () => {
        spyOn(dialogRef, 'afterClosed').and.returnValue(of('Hello'));
        spyOn(service.dialog, 'open').and.returnValue(dialogRef);

        const dialogData: DialogData = {
            textToSend: 'some text',
            inputData: {
                inputLabel: 'Name',
                submitFunction: (value) => {
                    if (value.length < Constants.ten) return true;
                    return false;
                },
                returnValue: 'No return Value',
            },
            closeButtonMessage: 'close button message',
        };

        service.openDialog(dialogData);

        expect(service.result).toEqual('Hello');
    });
});
