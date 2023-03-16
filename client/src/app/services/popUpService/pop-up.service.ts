import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { PopUpDialogComponent } from '@app/components/pop-up-dialog/pop-up-dialog.component';

export interface DialogData {
    textToSend: string;
    inputData?: InputData;
    imgSrc?: string;
    isConfirmation?: boolean;
    closeButtonMessage: string;
}

export interface InputData {
    inputLabel: string;
    /**
     * A user of this service must provide, if they desire an input, a function that processes the input
     * to both check if the value is of the correct format and save it where they desire or make the required HTTP requests.
     *
     * The pop-up-service should also save the value indicated in the input so a user of this service could only provide
     * a way to check if the input is valid.
     *
     * The function returns a boolean indicating if the input was valid.
     *
     * @param value the value given to the HTMLInput in string format
     * @returns a boolean indicating if the value was correct or not.
     */
    submitFunction: (value: string) => boolean;
    returnValue: string;
}

@Injectable({
    providedIn: 'root',
})
/**
 * This service is used to interact with a pop-up-dialog component to generate a custom pop up on the screen.
 * It is only used to start the pop-up-dialog and retrieve the information that may or may not have been given
 * by the pop-up input field.
 *
 * @author Charles Degrandpré
 * @class PopUpService
 */
export class PopUpService {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dialogRef: MatDialogRef<PopUpDialogComponent, any>;
    constructor(public dialog: MatDialog, private router: Router) {}

    /**
     * This method is used to send data to the PopUpDialogComponent.
     * You first feed it the relevant information such as the text of the pop-up,
     * a boolean indicating if it needs an input field, the label of said input field
     * and the route to send the user once the pop-up is closed.
     *
     * @param dataToSend a DialogData instance which has three attributes.
     * @param routToGo the route to send the user to once the pop-up is closed.
     */
    openDialog(dataToSend: DialogData, routeToGo?: string): void {
        this.dialogRef = this.dialog.open(PopUpDialogComponent, {
            disableClose: true,
            width: '500px',
            data: dataToSend,
        });

        this.dialogRef.afterClosed().subscribe(() => {
            if (routeToGo) {
                this.router.navigate([routeToGo]);
            }
        });
    }
}
