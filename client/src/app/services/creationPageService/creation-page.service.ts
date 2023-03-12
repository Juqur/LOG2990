/* eslint-disable max-lines */
import { Injectable } from '@angular/core';
import { LevelDifferences } from '@app/classes/difference';
import { CreationSpecs } from '@app/interfaces/creation-specs';
import { CanvasSharingService } from '@app/services/canvasSharingService/canvas-sharing.service';
import { CommunicationService } from '@app/services/communicationService/communication.service';
import { DifferenceDetectorService } from '@app/services/difference-detector.service';
import { DialogData, PopUpService } from '@app/services/popUpService/pop-up.service';
import { Constants } from '@common/constants';

@Injectable({
    providedIn: 'root',
})
export class CreationPageService {
    private creationSpecs: CreationSpecs;
    private isSaveable = false;
    private differenceAmountMsg = '';
    private submitFunction: (value: string) => boolean;
    // eslint-disable-next-line max-params
    constructor(
        private canvasShare: CanvasSharingService,
        private diffService: DifferenceDetectorService,
        public popUpService: PopUpService,
        private communicationService: CommunicationService,
    ) {
        this.creationSpecs = {
            defaultImageFile: new File([], ''),
            diffImageFile: new File([], ''),
            radius: Constants.RADIUS_DEFAULT,
            nbDifferences: Constants.INIT_DIFF_NB,
            differences: new LevelDifferences(),
            defaultCanvasCtx: document.createElement('canvas').getContext('2d'),
            diffCanvasCtx: document.createElement('canvas').getContext('2d'),
        } as CreationSpecs;

        this.getEmptyBMPFile().then((res) => {
            this.creationSpecs.defaultImageFile = res;
            this.creationSpecs.diffImageFile = res;
        });

        this.canvasShare.defaultCanvas = this.creationSpecs.defaultCanvasCtx?.canvas as HTMLCanvasElement;

        this.canvasShare.diffCanvas = this.creationSpecs.diffCanvasCtx?.canvas as HTMLCanvasElement;

        this.submitFunction = (value) => {
            return value.length !== 0 && value.length < Constants.MAX_GAME_NAME_LENGTH;
        };
    }

    /**
     * Getter for the radius attribute
     */
    get radius(): number {
        return this.creationSpecs.radius;
    }

    /**
     * Getter for the isSaveable attribute
     */
    get saveable(): boolean {
        return this.isSaveable;
    }

    /**
     * Getter for the number of differences last verified.
     */
    get nbDifferences(): number {
        return this.creationSpecs.nbDifferences;
    }

    /**
     * Getter for the difference amount message
     */
    get differenceMsg(): string {
        return this.differenceAmountMsg;
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
            this.creationSpecs.defaultImageFile = target.files[0];
            this.verifyImageFormat(this.creationSpecs.defaultImageFile).then((result) => {
                if (result) {
                    this.showDefaultImage();
                }
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
            this.creationSpecs.diffImageFile = target.files[0];
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
        this.diffImageSelector(event);
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
        this.creationSpecs.radius = Constants.RADIUS_TABLE[value];
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
        this.creationSpecs.differences = this.diffService.detectDifferences(
            this.creationSpecs.defaultCanvasCtx,
            this.creationSpecs.diffCanvasCtx,
            this.creationSpecs.radius,
        );
        if (!this.creationSpecs.differences) {
            this.errorDialog('Veuillez fournir des images non vides');
            return;
        }
        this.creationSpecs.nbDifferences = this.creationSpecs.differences.clusters.length;
        this.isSaveable =
            this.creationSpecs.nbDifferences >= Constants.MIN_DIFFERENCES_LIMIT && this.creationSpecs.nbDifferences <= Constants.MAX_DIFFERENCES_LIMIT
                ? true
                : false;
        if (this.creationSpecs.nbDifferences > Constants.MAX_DIFFERENCES_LIMIT)
            this.differenceAmountMsg = ' (Attention, le nombre de différences est trop élevé)';
        else if (this.creationSpecs.nbDifferences < Constants.MIN_DIFFERENCES_LIMIT)
            this.differenceAmountMsg = ' (Attention, le nombre de différences est trop bas)';
        this.popUpService.openDialog({
            textToSend: this.isSaveable
                ? 'Image de différence (contient ' + this.creationSpecs.nbDifferences + ' différences) :'
                : 'Image de différence (contient ' +
                  this.creationSpecs.nbDifferences +
                  ' différences) (Le nombre de différences doit être compris entre 3 et 9):',
            imgSrc: this.creationSpecs.differences.canvas.canvas.toDataURL(),
            closeButtonMessage: 'Fermer',
        });
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
                    submitFunction: this.submitFunction,
                },
                closeButtonMessage: 'Sauvegarder',
            });
            this.popUpService.dialogRef.afterClosed().subscribe((result) => {
                if (this.creationSpecs.differences) {
                    this.communicationService
                        .postLevel({
                            imageOriginal: this.creationSpecs.defaultImageFile,
                            imageDiff: this.creationSpecs.diffImageFile,
                            name: result,
                            isEasy: (!this.creationSpecs.differences.isHard).toString(),
                            clusters: JSON.stringify(this.creationSpecs.differences.clusters),
                            nbDifferences: this.creationSpecs.nbDifferences.toString(),
                        })
                        .subscribe((data) => {
                            if (data.title === 'error') {
                                this.errorDialog(data.body);
                            } else if (data.title === 'success') {
                                const dialogData: DialogData = {
                                    textToSend: data.body,
                                    closeButtonMessage: 'Fermer',
                                };
                                this.popUpService.openDialog(dialogData, '/config');
                            }
                        });
                }
            });
        }
    }

    /**
     * This method is used to get the File() object associated with the image_empty.bmp.
     *
     * @returns a file Object containing the image_empty.bmp
     */
    private async getEmptyBMPFile(): Promise<File> {
        const imageSrc = './assets/images/image_empty.bmp';
        return fetch(imageSrc)
            .then(async (res) => res.blob())
            .then((blob) => {
                return new File([blob], 'image_empty.bmp', { type: 'image/bmp' });
            });
    }

    /**
     * This method is used to display the default image on the default canvas.
     */
    private showDefaultImage(): void {
        const image = new Image();
        image.src = URL.createObjectURL(this.creationSpecs.defaultImageFile);
        image.onload = () => {
            if (!this.creationSpecs.defaultCanvasCtx) {
                this.errorDialog('Aucun canvas de base.');
                return;
            }
            if (image.width !== Constants.DEFAULT_WIDTH || image.height !== Constants.DEFAULT_HEIGHT) {
                this.errorDialog('Les images doivent être de taille 640x480.');
                return;
            }
            this.canvasShare.defaultCanvas.width = image.width;
            this.canvasShare.defaultCanvas.height = image.height;
            this.canvasShare.defaultCanvas.getContext('2d')?.drawImage(image, 0, 0);
            this.creationSpecs.defaultCanvasCtx = this.canvasShare.defaultCanvas.getContext('2d');
        };
    }

    /**
     * This method is used to display the different image on the different canvas.
     */
    private showDiffImage(): void {
        const image = new Image();
        image.src = URL.createObjectURL(this.creationSpecs.diffImageFile);
        image.onload = () => {
            if (!this.creationSpecs.diffCanvasCtx) {
                this.errorDialog('aucun canvas de différence');
                return;
            }
            if (image.width !== Constants.DEFAULT_WIDTH || image.height !== Constants.DEFAULT_HEIGHT) {
                this.errorDialog('Les images doivent être de taille 640x480');
                return;
            }
            this.canvasShare.diffCanvas.width = image.width;
            this.canvasShare.diffCanvas.height = image.height;
            this.canvasShare.diffCanvas.getContext('2d')?.drawImage(image, 0, 0);
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
                const view = new DataView(e.target?.result as ArrayBuffer);
                const bitNb = view.getUint16(Constants.BMP_BPP_POS, true);
                if (bitNb !== Constants.BMP_BPP) {
                    this.errorDialog('Les images doivent être de 24 bits par pixel');
                    resolve(false);
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
        this.isSaveable = false;
    }

    /**
     * This method is used to display an dialog with an error message.
     *
     * @param msg the error message we want to display.
     */
    private errorDialog(msg = 'Une erreur est survenue'): void {
        if (this.popUpService.dialogRef) this.popUpService.dialogRef.close();
        this.popUpService.openDialog({
            textToSend: msg,
            closeButtonMessage: 'Fermer',
        });
    }
}
