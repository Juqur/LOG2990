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

    export const inputLevelName: DialogData = {
        textToSend: 'Veuillez entrer le nom du jeu',
        inputData: {
            inputLabel: 'Nom du jeu',
            submitFunction: Dialogs.submitFunction,
        },
        closeButtonMessage: 'Sauvegarder',
        mustProcess: true,
    };

    export const differenceDisplay: (textToSend: string, imageSrc: string) => DialogData = (textToSend: string, imageSrc: string) => {
        return {
            textToSend,
            imageSrc,
            closeButtonMessage: 'Fermer',
            mustProcess: false,
        };
    };

    export const confirmation = (message: string) => {
        return {
            textToSend: message,
            closeButtonMessage: 'Fermer',
            mustProcess: false,
        } as DialogData;
    };

    export const errorDialog: (message: string) => DialogData = (message: string) => {
        return {
            textToSend: message,
            closeButtonMessage: 'Fermer',
            mustProcess: false,
        };
    };

    export const submitFunction: (value: string) => boolean = (value: string) => {
        return value.length !== 0 && value.length < Constants.MAX_GAME_NAME_LENGTH;
    };
}
