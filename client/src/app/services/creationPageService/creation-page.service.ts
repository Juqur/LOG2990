/* eslint-disable max-lines */
import { Injectable } from '@angular/core';
import { LevelDifferences } from '@app/classes/difference';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { CreationSpecs } from '@app/interfaces/creation-specs';
import { Level } from '@app/levels';
import { CanvasSharingService } from '@app/services/canvasSharingService/canvas-sharing.service';
import { CommunicationService } from '@app/services/communicationService/communication.service';
import { DifferenceDetectorService } from '@app/services/difference-detector.service';
import { DrawService } from '@app/services/draw.service';
import { DialogData, PopUpService } from '@app/services/popUpService/pop-up.service';
import { Constants } from '@common/constants';
import { LevelFormData } from '@common/levelFormData';

@Injectable({
    providedIn: 'root',
})
export class CreationPageService {
    creationSpecs: CreationSpecs = {
        defaultImageFile: await this.convertRelativeUriToFile(),
        diffImageFile: null,
        radius: Constants.RADIUS_DEFAULT,
        nbDifferences: Constants.INIT_DIFF_NB,
        differences: new LevelDifferences(),
        defaultArea: new PlayAreaComponent(new DrawService(), this.canvasShare),
        diffArea: new PlayAreaComponent(new DrawService(), this.canvasShare),
        defaultCanvasCtx: document.createElement('canvas').getContext('2d'),
        diffCanvasCtx: document.createElement('canvas').getContext('2d'),
    };
    sliderValue = Constants.SLIDER_DEFAULT;
    isSaveable = false;
    defaultImageUrl = '';
    msg = '';
    differenceAmountMsg = '';
    savedLevel: Level;
    // eslint-disable-next-line max-params
    constructor(
        private canvasShare: CanvasSharingService,
        private diffService: DifferenceDetectorService,
        public popUpService: PopUpService,
        private communicationService: CommunicationService,
    ) {
        this.canvasShare.defaultCanvas = this.creationSpecs.defaultCanvasCtx?.canvas as HTMLCanvasElement;

        this.canvasShare.diffCanvas = this.creationSpecs.diffCanvasCtx?.canvas as HTMLCanvasElement;
    }

    /**
     * The method is in charge of taking the default image given in the input, verifying that it is
     * of the correct format and then displaying it.
     *
     * @param event file upload event on the HTMLInputElement
     */
    defaultImageSelector(event: Event): void {
        this.restartGame();
        const target = event.target as HTMLInputElement;
        if (target.files) {
            // ------------------------------------------------------------------------------------------------//
            this.creationSpecs.defaultImageFile = target.files[0]; // Could it be used directly in the if and never again?
            // ------------------------------------------------------------------------------------------------//
            this.verifyImageFormat(this.creationSpecs.defaultImageFile).then((result) => {
                if (result) this.showDefaultImage();
            });
        }
    }

    /**
     * The method is in charge of taking the modified image given in the input, verifying that it is
     * of the correct format and then displaying it.
     *
     * @param event file upload event on the HTMLInputElement
     */
    diffImageSelector(event: Event): void {
        this.restartGame();
        const target = event.target as HTMLInputElement;
        if (target.files) {
            // ------------------------------------------------------------------------------------------------//
            this.creationSpecs.diffImageFile = target.files[0]; // Could it be used directly in the if and never again?
            // ------------------------------------------------------------------------------------------------//
            this.verifyImageFormat(this.creationSpecs.diffImageFile).then((result) => {
                if (result) this.showDiffImage();
            });
        }
    }

    /**
     * This method is in charge of selecting the image given to the input verifying that it is
     * of the correct format and display as both the default and different image.
     *
     * @param event event on the HTMLInputElement
     */
    bothImagesSelector(event: Event): void {
        this.defaultImageSelector(event);
        this.diffImageSelector(event); // This generates very minor code duplication, check with pierre if that's cool.
    }

    /**
     * This method clears the value of the input, effectively removing the file that was given.
     *
     * @param event event on the HTMLInputElement
     */
    cleanSrc(event: Event): void {
        (event.target as HTMLInputElement).value = '';
    }

    /**
     * This methods clears all modifications made to the default image.
     */
    resetDefault(): void {
        this.restartGame();
        this.canvasShare.defaultCanvas.getContext('2d')?.clearRect(0, 0, this.canvasShare.defaultCanvas.width, this.canvasShare.defaultCanvas.height);
    }

    /**
     * This method clears all modifications made to the different image.
     */
    resetDiff(): void {
        this.restartGame();
        this.canvasShare.diffCanvas.getContext('2d')?.clearRect(0, 0, this.canvasShare.diffCanvas.width, this.canvasShare.diffCanvas.height);
    }

    /**
     * Changes the value of the radius depending on a value given as parameter. The possible options
     * are 0, 3, 9, and 15 each corresponding to the indexes 0, 1, 2 and 3 that can be given as parameters
     *
     * @param value the index of the new slider value
     */
    sliderChange(value: number): void {
        // ------------------------------------------------------------------------------------------------//
        this.creationSpecs.radius = Constants.RADIUS_TABLE[value];
        // ------------------------------------------------------------------------------------------------//
    }

    /**
     * This methods starts the detection of differences between the two images and
     * launches a popUp display the result as a white and black image where the black
     * sections are differences while the white are regions shared between images.
     */
    detectDifference(): void {
        if (!this.creationSpecs.defaultCanvasCtx || !this.creationSpecs.diffCanvasCtx) {
            this.errorDialog('Canvas manquant');
            return;
        }
        // ------------------------------------------------------------------------------------------------//
        this.creationSpecs.differences = this.diffService.detectDifferences(
            this.creationSpecs.defaultCanvasCtx,
            this.creationSpecs.diffCanvasCtx,
            this.creationSpecs.radius,
        ); // Seems to be super important, not much ways to change this.
        // ------------------------------------------------------------------------------------------------//
        if (!this.creationSpecs.differences) {
            this.errorDialog('Veuillez fournir des images non vides');
            return;
        }
        // ------------------------------------------------------------------------------------------------//
        this.creationSpecs.nbDifferences = this.creationSpecs.differences.clusters.length; // Could be only call.
        // ------------------------------------------------------------------------------------------------//
        this.isSaveable =
            this.creationSpecs.nbDifferences >= Constants.MIN_DIFFERENCES_LIMIT && this.creationSpecs.nbDifferences <= Constants.MAX_DIFFERENCES_LIMIT
                ? true
                : false;
        const canvasDialogData: DialogData = {
            textToSend: this.isSaveable
                ? 'Image de différence (contient ' + this.creationSpecs.nbDifferences + ' différences) :'
                : 'Image de différence (contient ' +
                  this.creationSpecs.nbDifferences +
                  ' différences) (Le nombre de différences doit être compris entre 3 et 9):',
            imgSrc: this.creationSpecs.differences.canvas.canvas.toDataURL(),
            closeButtonMessage: 'Fermer',
        };
        if (this.creationSpecs.nbDifferences >= Constants.MAX_DIFFERENCES_LIMIT)
            this.differenceAmountMsg = ' (Attention, le nombre de différences est trop élevé)';
        else if (this.creationSpecs.nbDifferences <= Constants.MIN_DIFFERENCES_LIMIT)
            this.differenceAmountMsg = ' (Attention, le nombre de différences est trop bas)';

        this.popUpService.openDialog(canvasDialogData);
    }

    /**
     * This method is used to save the game, it opens a popUp asking the user
     * to give a name to their new game and saves it.
     */
    saveGame(): void {
        if (this.isSaveable) {
            this.popUpService.openDialog({
                textToSend: 'Veuillez entrer le nom du jeu',
                inputData: {
                    inputLabel: 'Nom du jeu',
                    submitFunction: (value) => {
                        return value.length < Constants.MAX_GAME_NAME_LENGTH;
                    },
                },
                closeButtonMessage: 'Sauvegarder',
            });
            this.popUpService.dialogRef.afterClosed().subscribe((result) => {
                this.savedLevel = {
                    id: 0,
                    name: result,
                    playerSolo: [],
                    timeSolo: [],
                    playerMulti: [],
                    timeMulti: [],
                    isEasy: !this.creationSpecs.differences?.isHard,
                    nbDifferences: this.creationSpecs.nbDifferences,
                };
                // if (!this.creationSpecs.defaultImageFile || !this.creationSpecs.diffImageFile || !this.creationSpecs.differences) {
                //     return;
                // }
                const levelFormData: LevelFormData = {
                    imageOriginal: this.creationSpecs.defaultImageFile,
                    imageDiff: this.creationSpecs.diffImageFile,
                    name: this.savedLevel.name,
                    isEasy: this.savedLevel.isEasy.toString(),
                    clusters: JSON.stringify(this.creationSpecs.differences.clusters),
                    nbDifferences: this.savedLevel.nbDifferences.toString(),
                };
                this.communicationService.postLevel(levelFormData).subscribe((data) => {
                    if (data.title === 'error') {
                        this.errorDialog(data.body);
                        return;
                    } else if (data.title === 'success') {
                        const dialogData: DialogData = {
                            textToSend: data.body,
                            closeButtonMessage: 'Fermer',
                        };
                        this.popUpService.openDialog(dialogData, '/config');
                    }
                });
            });
        }
    }

    async convertRelativeUriToFile(filePath: string, fileName: string) {
        const imageUrl = await fetch(filePath);
        const buffer = await imageUrl.arrayBuffer();
        return new File([buffer], fileName);
    }

    /**
     * This method is used to display the default image on the default canvas.
     */
    private showDefaultImage(): void {
        if (!this.creationSpecs.defaultImageFile) {
            this.errorDialog('aucun fichier de base');
            return;
        }
        const image1 = new Image();
        this.defaultImageUrl = URL.createObjectURL(this.creationSpecs.defaultImageFile);
        image1.src = this.defaultImageUrl;
        image1.onload = () => {
            if (!this.creationSpecs.defaultCanvasCtx) {
                this.errorDialog('aucun canvas de base');
                return;
            }
            if (image1.width !== Constants.DEFAULT_WIDTH || image1.height !== Constants.DEFAULT_HEIGHT) {
                this.errorDialog('Les images doivent être de taille 640x480');
                return;
            }
            const defaultCanvas = this.canvasShare.defaultCanvas;
            defaultCanvas.width = image1.width;
            defaultCanvas.height = image1.height;
            defaultCanvas.getContext('2d')?.drawImage(image1, 0, 0);
            this.canvasShare.defaultCanvas = defaultCanvas;
            this.creationSpecs.defaultCanvasCtx = this.canvasShare.defaultCanvas.getContext('2d');
        };
    }

    /**
     * This method is used to display the different image on the different canvas.
     */
    private showDiffImage(): void {
        if (!this.creationSpecs.diffImageFile) {
            this.errorDialog('aucun fichier de différence');
            return;
        }
        const image2 = new Image();
        image2.src = URL.createObjectURL(this.creationSpecs.diffImageFile);
        image2.onload = () => {
            if (!this.creationSpecs.diffCanvasCtx) {
                this.errorDialog('aucun canvas de différence');
                return;
            }
            if (image2.width !== Constants.DEFAULT_WIDTH || image2.height !== Constants.DEFAULT_HEIGHT) {
                this.errorDialog('Les images doivent être de taille 640x480');
                return;
            }
            const diffCanvas = this.canvasShare.diffCanvas;
            diffCanvas.width = image2.width;
            diffCanvas.height = image2.height;
            diffCanvas.getContext('2d')?.drawImage(image2, 0, 0);
            this.canvasShare.diffCanvas = diffCanvas;
            this.creationSpecs.diffCanvasCtx = this.canvasShare.diffCanvas.getContext('2d');
        };
    }

    /**
     * Verifies if an image file is of the good format, that is the file is in PNG and of type image/bmp
     * The image must also have only 24 bits per pixels.
     *
     * @param imageFile the image file we want to check if the format is valid.
     * @returns A Promise<boolean> which when resolved gives if the image was of the correct format.
     */
    private async verifyImageFormat(imageFile: File): Promise<boolean> {
        if (imageFile.type !== 'image/bmp') {
            this.errorDialog('Les images doivent être au format bmp');
            return Promise.resolve(false);
        }
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const imgData = e.target?.result as ArrayBuffer;
                const view = new DataView(imgData);
                const bitNb = view.getUint16(Constants.BMP_BPP_POS, true);
                if (bitNb !== Constants.BMP_BPP) {
                    resolve(false);
                    this.errorDialog('Les images doivent être de 24 bits par pixel');
                }
                resolve(true);
            };
            reader.readAsArrayBuffer(imageFile);
        });
    }

    /**
     * This methods re initializes the game games values to prevent the user from saving
     * using obsolete values after a change.
     */
    private restartGame(): void {
        this.creationSpecs.nbDifferences = Constants.INIT_DIFF_NB;
        this.defaultImageUrl = '';
        this.isSaveable = false;
    }

    /**
     * This method is used to display an dialog with an error message.
     *
     * @param msg the error message we want to display.
     */
    private errorDialog(msg = 'Une erreur est survenue'): void {
        if (this.popUpService.dialogRef) this.popUpService.dialogRef.close();
        const errorDialogData: DialogData = {
            textToSend: msg,
            closeButtonMessage: 'Fermer',
        };
        this.popUpService.openDialog(errorDialogData);
    }
}
