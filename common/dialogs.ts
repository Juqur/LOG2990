import { DialogData } from './../client/src/app/services/pop-up/pop-up.service';
import { Constants } from './constants';

export namespace Dialogs {
    export const inputNameDialogData: DialogData = {
        textToSend: 'Veuillez entrer votre nom',
        inputData: {
            inputLabel: 'Nom du joueur',
            submitFunction: (value) => {
                return value.length >= 1 && value.length <= Constants.MAX_NAME_LENGTH;
            },
        },
        closeButtonMessage: 'Débuter la partie',
        mustProcess: false,
    };
}
