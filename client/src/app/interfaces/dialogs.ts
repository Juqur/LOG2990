import { DialogData } from '@app/services/pop-up/pop-up.service';
import { Constants } from '@common/constants';

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
