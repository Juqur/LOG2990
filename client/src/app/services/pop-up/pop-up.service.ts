import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { PopUpDialogComponent } from '@app/components/pop-up-dialog/pop-up-dialog.component';
import { DialogData } from '@app/interfaces/dialogs';

/**
 * This service is used to interact with a pop-up-dialog component to generate a custom pop up on the screen.
 * It is only used to start the pop-up-dialog and retrieve the information that may or may not have been given
 * by the pop-up input field.
 *
 * @author Charles Degrandpré
 * @class PopUpService
 */
@Injectable({
    providedIn: 'root',
})
export class PopUpService {
    dialogRef: MatDialogRef<PopUpDialogComponent>;

    constructor(public dialog: MatDialog, private router: Router) {}

    /**
     * This method is used to send data to the PopUpDialogComponent.
     * You first feed it the relevant information such as the text of the pop-up,
     * a boolean indicating if it needs an input field, the label of said input field
     * and the route to send the user once the pop-up is closed.
     *
     * @param dataToSend A DialogData instance which has three attributes.
     * @param routToGo The route to send the user to once the pop-up is closed.
     */
    openDialog(dataToSend: DialogData, routeToGo?: string): void {
        if (dataToSend.mustProcess) {
            this.dialogRef = this.dialog.open(PopUpDialogComponent, {
                width: '500px',
                data: dataToSend,
                disableClose: true,
            });
        } else {
            this.dialogRef = this.dialog.open(PopUpDialogComponent, {
                width: '500px',
                data: dataToSend,
            });
        }

        this.dialogRef.afterClosed().subscribe(() => {
            if (routeToGo) {
                this.router.navigate([routeToGo]);
            }
        });
    }
}
