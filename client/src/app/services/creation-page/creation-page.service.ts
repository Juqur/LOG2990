/* eslint-disable max-lines */
/* The documentation makes this file exceeds the max lines. */
import { Injectable } from '@angular/core';
import { MatSlider } from '@angular/material/slider';
import { CreationSpecs } from '@app/interfaces/creation-specs';
import { Dialogs } from '@app/interfaces/dialogs';
import { LevelDifferences } from '@app/interfaces/level-differences';
import { LevelFormData } from '@app/interfaces/level-form-data';
import { CanvasSharingService } from '@app/services/canvas-sharing/canvas-sharing.service';
import { CommunicationService } from '@app/services/communication/communication.service';
import { DifferenceDetectorService } from '@app/services/difference-detector/difference-detector.service';
import { DrawService } from '@app/services/draw/draw.service';
import { MouseService } from '@app/services/mouse/mouse.service';
import { PopUpService } from '@app/services/pop-up/pop-up.service';
import { Constants } from '@common/constants';
import { SocketHandler } from '../socket-handler/socket-handler.service';

@Injectable({
    providedIn: 'root',
})
export class CreationPageService {
    private isSaveable: boolean = false;
    private differenceAmountMessage: string = '';
    private drawServiceDefault: DrawService = new DrawService();
    private drawServiceDifference: DrawService = new DrawService();
    private defaultUploadFile: File;
    private differenceUploadFile: File;
    private creationSpecs: CreationSpecs = {
        defaultImageFile: new File([], ''),
        differenceImageFile: new File([], ''),
        radius: Constants.RADIUS_DEFAULT,
        brushSize: 1,
        nbDifferences: Constants.INIT_DIFF_NB,
        differences: {} as LevelDifferences,
        defaultBgCanvasContext: document.createElement('canvas').getContext('2d'),
        differenceBgCanvasContext: document.createElement('canvas').getContext('2d'),
    } as CreationSpecs;

    /**
     * It is true that this service has a lot of services, however,
     * those services are qualified terminal, which means it cannot be refactored any further.
     */
    // eslint-disable-next-line max-params
    constructor(
        private canvasShare: CanvasSharingService,
        private differenceService: DifferenceDetectorService,
        public popUpService: PopUpService,
        private communicationService: CommunicationService,
        private socketHandler: SocketHandler,
        private mouseServiceDefault: MouseService,
        private mouseServiceDifference: MouseService,
    ) {
        this.canvasShare.defaultCanvas = this.creationSpecs.defaultBgCanvasContext?.canvas as HTMLCanvasElement;
        this.canvasShare.differenceCanvas = this.creationSpecs.differenceBgCanvasContext?.canvas as HTMLCanvasElement;
        this.getEmptyBmpFile().then((res) => {
            this.creationSpecs.defaultImageFile = res;
            this.creationSpecs.differenceImageFile = res;
            this.showDefaultImage();
            this.showDifferenceImage();
        });
    }

    /**
     * Getter for the radius attribute.
     */
    get radius(): number {
        return this.creationSpecs.radius;
    }

    /**
     * Getter for the number of differences last verified.
     */
    get nbDifferences(): number {
        return this.creationSpecs.nbDifferences;
    }

    /**
     * Getter for the difference amount message.
     */
    get differenceMessage(): string {
        return this.differenceAmountMessage;
    }

    /**
     * Getter for the isSaveable attribute.
     */
    get saveable(): boolean {
        return this.isSaveable;
    }

    /**
     * Sets isSaveable to false as it should not be set to true from outside the service.
     */
    saveFalse(): void {
        this.isSaveable = false;
    }

    /**
     * The method is in charge of taking the default image given in the input, verifying that it is
     * of the correct format and then displaying it.
     *
     * @param event File upload event on the HTMLInputElement.
     */
    defaultImageSelector(event: Event): void {
        this.restartGame();
        const target = event.target as HTMLInputElement;
        if (target.files) {
            this.creationSpecs.defaultImageFile = target.files[0];
            this.verifyImageFormat(this.creationSpecs.defaultImageFile).then((result) => {
                if (result) this.showDefaultImage();
            });
        }
    }

    /**
     * The method is in charge of taking the modified image given in the input, verifying that it is
     * of the correct format and then displaying it.
     *
     * @param event File upload event on the HTMLInputElement.
     */
    differenceImageSelector(event: Event): void {
        this.restartGame();
        const target = event.target as HTMLInputElement;
        if (target.files) {
            this.creationSpecs.differenceImageFile = target.files[0];
            this.verifyImageFormat(this.creationSpecs.differenceImageFile).then((result) => {
                if (result) this.showDifferenceImage();
            });
        }
    }

    /**
     * This method is in charge of selecting the image given to the input verifying that it is
     * of the correct format and display as both the default and different image.
     *
     * @param event Event on the HTMLInputElement.
     */
    bothImagesSelector(event: Event): void {
        this.defaultImageSelector(event);
        this.differenceImageSelector(event);
    }

    /**
     * This method clears the value of the input, effectively removing the file that was given.
     *
     * @param event Event on the HTMLInputElement.
     */
    cleanSrc(event: Event): void {
        (event.target as HTMLInputElement).value = '';
    }

    /**
     * This methods clears all modifications made to the default image.
     */
    resetDefaultBackground(): void {
        this.restartGame();
        this.canvasShare.defaultCanvas.getContext('2d')?.clearRect(0, 0, this.canvasShare.defaultCanvas.width, this.canvasShare.defaultCanvas.height);
        this.getEmptyBmpFile().then((res) => {
            this.creationSpecs.defaultImageFile = res;
            this.showDefaultImage();
        });
    }

    /**
     * This method clears all modifications made to the different image.
     */
    resetDiffBackground(): void {
        this.restartGame();
        this.canvasShare.differenceCanvas
            .getContext('2d')
            ?.clearRect(0, 0, this.canvasShare.differenceCanvas.width, this.canvasShare.differenceCanvas.height);
        this.getEmptyBmpFile().then((res) => {
            this.creationSpecs.differenceImageFile = res;
            this.showDifferenceImage();
        });
    }

    /**
     * Changes the value of the radius depending on a value given as parameter.
     * The possible options are 0, 3, 9, and 15 each corresponding to the indexes 0, 1, 2 and 3 that can be given as parameters.
     *
     * @param value The index of the new slider value.
     */
    differenceSliderChange(value: number): void {
        this.creationSpecs.radius = Constants.RADIUS_TABLE[value];
    }

    /**
     * Sets the brush size to the value given by the slider.
     *
     * @param event The mat slider.
     * @param defaultContext The default canvas context.
     * @param differenceContext The different canvas context.
     */
    brushSliderChange(event: MatSlider, defaultContext: CanvasRenderingContext2D, differenceContext: CanvasRenderingContext2D): void {
        this.drawServiceDefault.context = defaultContext;
        this.drawServiceDifference.context = differenceContext;
        this.drawServiceDefault.setBrushSize(event.value);
        this.drawServiceDifference.setBrushSize(event.value);
    }

    /**
     * This methods starts the detection of differences between the two images and
     * launches a popUp display the result as a white and black image where the black
     * sections are differences while the white are regions shared between images.
     *
     * @param defaultMergedContext The default canvas context.
     * @param differenceMergedContext The different canvas context.
     */
    detectDifference(defaultMergedContext: CanvasRenderingContext2D, differenceMergedContext: CanvasRenderingContext2D): void {
        this.creationSpecs.differences = this.differenceService.detectDifferences(
            defaultMergedContext,
            differenceMergedContext,
            this.creationSpecs.radius,
        );
        if (!this.creationSpecs.differences) {
            this.errorDialog('Veuillez fournir des images non vides');
            return;
        }
        this.creationSpecs.nbDifferences = this.creationSpecs.differences.clusters.length;
        this.isSaveable =
            this.creationSpecs.nbDifferences >= Constants.MIN_DIFFERENCES_LIMIT &&
            this.creationSpecs.nbDifferences <= Constants.MAX_DIFFERENCES_LIMIT;
        if (this.creationSpecs.nbDifferences > Constants.MAX_DIFFERENCES_LIMIT)
            this.differenceAmountMessage = ' (Attention, le nombre de différences est trop élevé)';
        else if (this.creationSpecs.nbDifferences < Constants.MIN_DIFFERENCES_LIMIT)
            this.differenceAmountMessage = ' (Attention, le nombre de différences est trop bas)';
        else this.differenceAmountMessage = '';
        const textToSend = this.isSaveable
            ? 'Image de différence (contient ' + this.creationSpecs.nbDifferences + ' différences) :'
            : 'Image de différence (contient ' +
              this.creationSpecs.nbDifferences +
              ' différences) (Le nombre de différences doit être compris entre 3 et 9):';
        const imageSrc = this.creationSpecs.differences.canvas.canvas.toDataURL();
        this.popUpService.openDialog(Dialogs.differenceDisplay(textToSend, imageSrc));
        if (this.isSaveable) {
            this.toImgFile(defaultMergedContext).then((res) => {
                this.defaultUploadFile = new File([res], 'default.bmp', { type: 'image/bmp' });
            });
            this.toImgFile(differenceMergedContext).then((res) => {
                this.differenceUploadFile = new File([res], 'diff.bmp', { type: 'image/bmp' });
            });
        }
    }

    /**
     * This method is used to save the game.
     * It opens a popUp asking the user to give a name to their new game and saves it.
     */
    saveGame(): void {
        if (this.isSaveable && this.defaultUploadFile && this.differenceUploadFile) {
            this.popUpService.openDialog(Dialogs.inputLevelName);
            this.popUpService.dialogRef.afterClosed().subscribe((result) => {
                if (this.creationSpecs.differences) {
                    this.communicationService
                        .postLevel({
                            imageOriginal: this.defaultUploadFile,
                            imageDiff: this.differenceUploadFile,
                            name: result,
                            isEasy: (!this.creationSpecs.differences.isHard).toString(),
                            clusters: JSON.stringify(this.creationSpecs.differences.clusters),
                            nbDifferences: this.creationSpecs.nbDifferences.toString(),
                        } as LevelFormData)
                        .subscribe((data) => {
                            if (data.title === 'error') {
                                this.errorDialog(data.body);
                            } else if (data.title === 'success') {
                                this.popUpService.openDialog(Dialogs.confirmation(data.body), '/config');
                            }
                            this.socketHandler.send('game', 'onRefreshLevels');
                        });
                }
            });
        }
    }

    /**
     * When the user press on the paint brush button, this method is called.
     * It sets the mouse service to Paint mode.
     *
     * @param defaultContext The default canvas context.
     * @param differenceContext The diff canvas context.
     */
    paintBrushMode(defaultContext: CanvasRenderingContext2D, differenceContext: CanvasRenderingContext2D): void {
        this.mouseServiceDefault.isRectangleMode = false;
        this.mouseServiceDifference.isRectangleMode = false;
        this.drawServiceDefault.context = defaultContext;
        this.drawServiceDifference.context = differenceContext;
        this.drawServiceDefault.paintBrush();
        this.drawServiceDifference.paintBrush();
    }

    /**
     * When the user press on the erase brush button, this method is called.
     * It sets the mouse service to Erase mode.
     *
     * @param defaultContext The default canvas context.
     * @param differenceContext The diff canvas context.
     */
    eraseBrushMode(defaultContext: CanvasRenderingContext2D, differenceContext: CanvasRenderingContext2D): void {
        this.mouseServiceDefault.isRectangleMode = false;
        this.mouseServiceDifference.isRectangleMode = false;
        this.drawServiceDefault.context = defaultContext;
        this.drawServiceDifference.context = differenceContext;
        this.drawServiceDefault.eraseBrush();
        this.drawServiceDifference.eraseBrush();
    }

    /**
     * When the user press on the rectangle button, this method is called.
     * It sets the mouse service to rectangle mode.
     */
    rectangleMode(): void {
        this.drawServiceDefault.paintBrush();
        this.drawServiceDifference.paintBrush();
        this.mouseServiceDefault.isRectangleMode = true;
        this.mouseServiceDifference.isRectangleMode = true;
    }

    /**
     * When the user press on the color picker button, this method is called.
     * It sets the color of the paint brush and the Rectangle brush to the color.
     */
    colorPickerMode(event: Event): void {
        const color = (event.target as HTMLInputElement).value;
        this.mouseServiceDefault.mouseDrawColor = color;
        this.mouseServiceDifference.mouseDrawColor = color;
        this.drawServiceDefault.setPaintColor(color);
        this.drawServiceDifference.setPaintColor(color);
    }

    /**
     * This method is used to convert a canvas to a file.
     * It uses the canvas.toBlob() method to convert the canvas to a Blob object.
     *
     * @param currentContext the context of the canvas we want to convert to a file.
     * @returns a Promise<Blob> which when resolved gives the Blob object associated with the canvas.
     */
    async toImgFile(currentContext: CanvasRenderingContext2D): Promise<Blob> {
        return new Promise((resolve) => {
            currentContext.canvas.toBlob((blob) => resolve(blob as Blob));
        });
    }

    /**
     * This method is used to get the File() object associated with the image_empty.bmp.
     *
     * @returns A file Object containing the image_empty.bmp.
     */
    private async getEmptyBmpFile(): Promise<File> {
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
        image.onload = async () => {
            if (!this.creationSpecs.defaultBgCanvasContext) {
                this.errorDialog('Aucun canvas de base.');
                return;
            }
            if (image.width !== Constants.DEFAULT_WIDTH || image.height !== Constants.DEFAULT_HEIGHT) {
                this.errorDialog('Les images doivent être de taille 640x480.');
                return;
            }
            this.canvasShare.defaultCanvas.width = image.width;
            this.canvasShare.defaultCanvas.height = image.height;
            (this.canvasShare.defaultCanvas.getContext('2d') as CanvasRenderingContext2D).drawImage(image, 0, 0);
            this.creationSpecs.defaultBgCanvasContext = this.canvasShare.defaultCanvas.getContext('2d');
        };
    }

    /**
     * This method is used to display the different image on the different canvas.
     */
    private showDifferenceImage(): void {
        const image = new Image();
        image.src = URL.createObjectURL(this.creationSpecs.differenceImageFile);
        image.onload = async () => {
            if (!this.creationSpecs.differenceBgCanvasContext) {
                this.errorDialog('Aucun canvas de différence.');
                return;
            }
            if (image.width !== Constants.DEFAULT_WIDTH || image.height !== Constants.DEFAULT_HEIGHT) {
                this.errorDialog('Les images doivent être de taille 640x480.');
                return;
            }
            this.canvasShare.differenceCanvas.width = image.width;
            this.canvasShare.differenceCanvas.height = image.height;
            (this.canvasShare.differenceCanvas.getContext('2d') as CanvasRenderingContext2D).drawImage(image, 0, 0);
            this.creationSpecs.differenceBgCanvasContext = this.canvasShare.differenceCanvas.getContext('2d');
        };
    }

    /**
     * Verifies if an image file is of the good format, that is the file is in PNG and of type image/bmp.
     * The image must also have only 24 bits per pixels.
     *
     * @param imageFile The image file we want to check if the format is valid.
     * @returns A Promise<boolean> which when resolved gives if the image was of the correct format.
     */
    private async verifyImageFormat(imageFile: File): Promise<boolean> {
        if (imageFile.type !== 'image/bmp') {
            this.errorDialog('Les images doivent être au format bmp.');
            return Promise.resolve(false);
        }
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = async (event) => {
                const view = new DataView((event.target as FileReader).result as ArrayBuffer);
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
     * This method re-initializes the game games values to prevent the user from saving.
     */
    private restartGame(): void {
        this.creationSpecs.nbDifferences = Constants.INIT_DIFF_NB;
        this.isSaveable = false;
    }

    /**
     * This method is used to display an dialog with an error message.
     *
     * @param message The error message we want to display.
     */
    private errorDialog(message = 'Une erreur est survenue'): void {
        if (this.popUpService.dialogRef) this.popUpService.dialogRef.close();
        this.popUpService.openDialog(Dialogs.errorDialog(message));
    }
}
