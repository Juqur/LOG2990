import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DialogData } from '@app/interfaces/dialogs';
import { PopUpService } from '@app/services/pop-up/pop-up.service';

@Component({
    selector: 'app-pop-up-dialog',
    templateUrl: './pop-up-dialog.component.html',
    styleUrls: ['./pop-up-dialog.component.scss'],
})
/**
 * This component represents a pop-up.
 *
 * @author Charles Degrandpré and Junaid Qureshi
 * @class PopUpDialogComponent
 */
export class PopUpDialogComponent {
    @ViewChild('pop-up-input') elRef: ElementRef;
    private inputWasValid: boolean | undefined = false;
    private inputValue: string = '';
    constructor(public dialogRef: MatDialogRef<PopUpService>, @Inject(MAT_DIALOG_DATA) public data: DialogData) {
        if (!data.inputData) {
            this.inputWasValid = true;
        }
    }

    /**
     * Getter for the inputWasValid boolean.
     */
    get inputValid(): boolean | undefined {
        return this.inputWasValid;
    }

    /**
     * Getter for the value of the input for the pop-up.
     */
    get value(): string {
        return this.inputValue;
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
    submitText(value: string): void {
        this.inputValue = value;
        this.inputWasValid = this.data.inputData?.submitFunction(value);
        if (this.inputValue.length === 0) {
            this.inputWasValid = false;
        }
    }
}
