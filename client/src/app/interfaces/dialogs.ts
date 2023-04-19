import { Constants } from '@common/constants';

export interface DialogData {
    textToSend: string;
    inputData?: InputData;
    imageSrc?: string;
    isConfirmation?: boolean;
    closeButtonMessage: string;
    mustProcess: boolean;
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
}

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
            submitFunction: (value) => {
                return value.length !== 0 && value.length < Constants.MAX_GAME_NAME_LENGTH;
            },
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

    export const confirmDeleteLevel: DialogData = {
        textToSend: 'Voulez-vous vraiment supprimer ce niveau?',
        isConfirmation: true,
        closeButtonMessage: '',
        mustProcess: true,
    };

    export const confirmDeleteAllLevels: DialogData = {
        textToSend: 'Voulez-vous vraiment supprimer TOUS les niveaux? Ceci sera irréversible.',
        isConfirmation: true,
        closeButtonMessage: '',
        mustProcess: true,
    };

    export const confirmResetGameConstants: DialogData = {
        textToSend: 'Voulez-vous vraiment réinitialiser les paramètres de jeu?',
        isConfirmation: true,
        closeButtonMessage: '',
        mustProcess: true,
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
}
