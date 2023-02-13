import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogData, PopUpServiceService } from '@app/services/pop-up-service.service';

@Component({
    selector: 'app-pop-up-dialog',
    templateUrl: './pop-up-dialog.component.html',
    styleUrls: ['./pop-up-dialog.component.scss'],
})
export class PopUpDialogComponent {
    @ViewChild('pop-up-input') elRef: ElementRef;
    inputWasValid: boolean | undefined = false;
    inputValue: string = '';
    constructor(public dialogRef: MatDialogRef<PopUpServiceService>, @Inject(MAT_DIALOG_DATA) public data: DialogData) {
        if (!data.inputData) {
            this.inputWasValid = true;
        }
    }

    /**
     * Function in charge of closing the pop up once we either click outside it or
     * when we click on the close button.
     */
    onCloseClick(): void {
        this.dialogRef.close();
    }

    /**
     * Function in charge of submitting the text of the input once we have typed it out.
     *
     * @param event The keyboard event to process
     * @param input The HTMLInput element associated with the input.
     */
    submitText(value: string) {
        this.inputValue = value;
        this.inputWasValid = this.data.inputData?.submitFunction(value);
        if (this.inputValue.length === 0) {
            this.inputWasValid = false;
        }
    }
}
