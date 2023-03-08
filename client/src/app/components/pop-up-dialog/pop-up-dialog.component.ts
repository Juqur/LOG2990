import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogData, PopUpService } from '@app/services/popUpService/pop-up.service';

@Component({
    selector: 'app-pop-up-dialog',
    templateUrl: './pop-up-dialog.component.html',
    styleUrls: ['./pop-up-dialog.component.scss'],
})
/**
 * This component represents a pop-up.
 *
 * @author Charles Degrandpré
 * @class PopUpDialogComponent
 */
export class PopUpDialogComponent {
    @ViewChild('pop-up-input') elRef: ElementRef;
    inputWasValid: boolean | undefined = false;
    inputValue: string = '';
    constructor(public dialogRef: MatDialogRef<PopUpService>, @Inject(MAT_DIALOG_DATA) public data: DialogData) {
        if (!data.inputData) {
            this.inputWasValid = true;
        }
    }

    /**
     * Function in charge of closing the pop up once we click on the close button.
     */
    onCloseClick(): void {
        this.dialogRef.close();
    }

    /**
     * Function in charge of verifying if an input was valid and save the value in inputValue attribute.
     *
     * @param value the new value of the input.
     */
    submitText(value: string) {
        this.inputValue = value;
        this.inputWasValid = this.data.inputData?.submitFunction(value);
        if (this.inputValue.length === 0) {
            this.inputWasValid = false;
        }
    }
}
