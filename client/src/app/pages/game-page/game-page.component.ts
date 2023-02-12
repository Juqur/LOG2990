import { Component } from '@angular/core';
import { DialogData, PopUpServiceService } from '@app/services/pop-up-service.service';
import { Constants } from '@common/constants';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent {
    bodyText: string = 'Test text';
    data: DialogData = {
        textToSend: 'Hello',
        inputData: {
            inputLabel: 'Name',
            submitFunction: (value) => {
                if (value.length < Constants.ten) return true;
                return false;
            },
            returnValue: 'No Value Given',
        },
        closeButtonMessage: 'Return to selection page',
    };
    constructor(public service: PopUpServiceService) {}
}
