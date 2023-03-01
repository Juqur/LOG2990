/* eslint-disable max-lines */
import { Component, OnInit } from '@angular/core';
import { Difference } from '@app/classes/difference';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { Level } from '@app/levels';
import { CanvasSharingService } from '@app/services/canvas-sharing.service';
import { CommunicationService } from '@app/services/communicationService/communication.service';
import { DifferenceDetectorService } from '@app/services/difference-detector.service';
import { DrawService } from '@app/services/draw.service';
import { DialogData, PopUpServiceService } from '@app/services/pop-up-service.service';
import { Constants } from '@common/constants';
import { LevelFormData } from '@common/levelFormData';
/**
 * This component represents the creation, the page where we can create new levels/games.
 *
 * @author Simon Gagné
 * @class CreationComponent
 */
@Component({
    selector: 'app-creation',
    templateUrl: './creation.component.html',
    styleUrls: ['./creation.component.scss'],
})
/**
 * This component represents the creation, the page where we can create new levels/games.
 *
 * @author Simon Gagné
 * @class CreationComponent
 */
export class CreationComponent implements OnInit {
    defaultImageFile: File | null = null;
    diffImageFile: File | null = null;
    sliderValue = Constants.SLIDER_DEFAULT;
    radius = Constants.RADIUS_DEFAULT;
    radiusTable = Constants.RADIUS_TABLE;
    nbDifferences = Constants.INIT_DIFF_NB;
    isSaveable = false;
    differences: Difference | undefined;
    defaultArea: PlayAreaComponent | null = null;
    modifiedArea: PlayAreaComponent | null = null;
    defaultCanvasCtx: CanvasRenderingContext2D | null = null;
    diffCanvasCtx: CanvasRenderingContext2D | null = null;
    defaultImageUrl = '';
    msg = '';
    differenceAmountMsg = '';
    savedLevel: Level;
    // eslint-disable-next-line max-params
    constructor(
        private canvasShare: CanvasSharingService,
        private diffService: DifferenceDetectorService,
        public popUpService: PopUpServiceService,
        private communicationService: CommunicationService,
    ) {}

    /**
     * The method initiates two empty canvas on the page. The canvases are represented by two
     * PlayArea components.
     */
    ngOnInit(): void {
        this.defaultCanvasCtx = document.createElement('canvas').getContext('2d');
        this.canvasShare.setDefaultCanvasRef(this.defaultCanvasCtx?.canvas as HTMLCanvasElement);
        this.diffCanvasCtx = document.createElement('canvas').getContext('2d');
        this.canvasShare.setDiffCanvasRef(this.diffCanvasCtx?.canvas as HTMLCanvasElement);

        this.defaultArea = new PlayAreaComponent(new DrawService(), this.canvasShare);
        this.modifiedArea = new PlayAreaComponent(new DrawService(), this.canvasShare);
    }

    /**
     * The method is in charge of taking the default image given in the input, verifying that it is
     * of the correct format and then displaying it.
     *
     * @param event event on the HTMLInputElement
     */
    defaultImageSelector(event: Event) {
        this.reinitGame();
        const target = event.target as HTMLInputElement;
        if (!target.files) {
            return;
        }
        this.defaultImageFile = target.files[0];
        this.verifyImageFormat(this.defaultImageFile).then((result) => {
            if (!result) return;
            else this.showDefaultImage();
        });
    }

    /**
     * The method is in charge of taking the modified image given in the input, verifying that it is
     * of the correct format and then displaying it.
     *
     * @param event event on the HTMLInputElement
     */
    diffImageSelector(event: Event) {
        this.reinitGame();
        const target = event.target as HTMLInputElement;
        if (!target.files) {
            return;
        }
        this.diffImageFile = target.files[0];
        this.verifyImageFormat(this.diffImageFile).then((result) => {
            if (!result) return;
            else this.showDiffImage();
        });
    }

    /**
     * This method is in charge of selecting the image given to the input verifying that it is
     * of the correct format and display as both the default and different image.
     *
     * @param event event on the HTMLInputElement
     */
    bothImagesSelector(event: Event) {
        this.reinitGame();
        const target = event.target as HTMLInputElement;
        if (!target.files) {
            return;
        }
        this.defaultImageFile = target.files[0];
        this.diffImageFile = target.files[0];
        this.verifyImageFormat(this.defaultImageFile).then((result) => {
            if (!result) return;
            else {
                this.showDefaultImage();
                this.showDiffImage();
            }
        });
    }

    /**
     * This method clears the value of the input, effectively removing the file that was given.
     *
     * @param event event on the HTMLInputElement
     */
    cleanSrc(event: Event) {
        const target = event.target as HTMLInputElement;
        target.value = '';
    }

    /**
     * This method is used to display the default image on the default canvas.
     */
    showDefaultImage() {
        if (!this.defaultImageFile) {
            this.errorDialog('aucun fichier de base');
            return;
        }
        const image1 = new Image();
        this.defaultImageUrl = URL.createObjectURL(this.defaultImageFile);
        image1.src = this.defaultImageUrl;
        image1.onload = () => {
            if (!this.defaultCanvasCtx) {
                this.errorDialog('aucun canvas de base');
                return;
            }
            if (image1.width !== Constants.DEFAULT_WIDTH || image1.height !== Constants.DEFAULT_HEIGHT) {
                this.errorDialog('Les images doivent être de taille 640x480');
                return;
            }
            this.canvasShare.defaultCanvasRef.width = image1.width;
            this.canvasShare.defaultCanvasRef.height = image1.height;
            this.canvasShare.defaultCanvasRef.getContext('2d')?.drawImage(image1, 0, 0);
            this.defaultCanvasCtx = this.canvasShare.defaultCanvasRef.getContext('2d');
        };
    }

    /**
     * This method is used to display the different image on the different canvas.
     */
    showDiffImage() {
        if (!this.diffImageFile) {
            this.errorDialog('aucun fichier de différence');
            return;
        }
        const image2 = new Image();
        image2.src = URL.createObjectURL(this.diffImageFile);
        image2.onload = () => {
            if (!this.diffCanvasCtx) {
                this.errorDialog('aucun canvas de différence');
                return;
            }
            if (image2.width !== Constants.DEFAULT_WIDTH || image2.height !== Constants.DEFAULT_HEIGHT) {
                this.errorDialog('Les images doivent être de taille 640x480');
                return;
            }
            this.canvasShare.diffCanvasRef.width = image2.width;
            this.canvasShare.diffCanvasRef.height = image2.height;
            this.canvasShare.diffCanvasRef.getContext('2d')?.drawImage(image2, 0, 0);
            this.diffCanvasCtx = this.canvasShare.diffCanvasRef.getContext('2d');
        };
    }

    /**
     * Verifies if an image file is of the good format, that is the file is in PNG and of type image/bmp
     * The image must also have only 24 bits per pixels.
     *
     * @param imageFile the image file we want to check if the format is valid.
     * @returns A Promise<boolean> which when resolved gives if the image was of the correct format.
     */
    async verifyImageFormat(imageFile: File) {
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
     * This methods clears all modifications made to the default image.
     */
    resetDefault() {
        this.reinitGame();
        this.canvasShare.defaultCanvasRef
            .getContext('2d')
            ?.clearRect(0, 0, this.canvasShare.defaultCanvasRef.width, this.canvasShare.defaultCanvasRef.height);
    }

    /**
     * This method clears all modifications made to the different image.
     */
    resetDiff() {
        this.reinitGame();
        this.canvasShare.diffCanvasRef.getContext('2d')?.clearRect(0, 0, this.canvasShare.diffCanvasRef.width, this.canvasShare.diffCanvasRef.height);
    }

    /**
     * Changes the value of the radius depending on a value given as parameter. The possible options
     * are 0, 3, 9, and 15 each corresponding to the indexes 0, 1, 2 and 3 that can be given as parameters
     *
     * @param value the index of the new slider value
     */
    sliderChange(value: number) {
        this.radius = this.radiusTable[value];
    }

    /**
     * This methods starts the detection of differences between the two images and
     * launches a popUp display the result as a white and black image where the black
     * sections are differences while the white are regions shared between images.
     */
    detectDifference() {
        if (!this.defaultCanvasCtx || !this.diffCanvasCtx) {
            this.errorDialog('Canvas manquant');
            return;
        }
        this.nbDifferences = Constants.INIT_DIFF_NB;
        this.differences = this.diffService.detectDifferences(this.defaultCanvasCtx, this.diffCanvasCtx, this.radius);
        if (!this.differences) {
            this.errorDialog('Veuillez fournir des images non vides');
            return;
        }
        this.nbDifferences = this.differences.clusters.length;
        this.nbDifferences = this.differences.clusters.length;
        let respecteNb = '';
        if (this.nbDifferences >= Constants.RADIUS_DEFAULT && this.nbDifferences <= Constants.BIG_DIFF_NB) {
            this.isSaveable = true;
        } else {
            this.isSaveable = false;
            respecteNb = '(Le nombre de différences doit être compris entre 3 et 9)';
        }
        const canvasDialogData: DialogData = {
            textToSend: 'Image de différence (contient ' + this.nbDifferences + ' différences) ' + respecteNb + ' :',
            imgSrc: this.differences.canvas.canvas.toDataURL(),
            closeButtonMessage: 'Fermer',
        };
        this.differenceAmountMsg = '';
        if (this.nbDifferences >= Constants.MAX_DIFFERENCES_LIMIT) this.differenceAmountMsg = ' (Attention, le nombre de différences est trop élevé)';
        if (this.nbDifferences <= Constants.MIN_DIFFERENCES_LIMIT) this.differenceAmountMsg = ' (Attention, le nombre de différences est trop bas)';

        this.popUpService.openDialog(canvasDialogData);
    }
    /**
     * This methods reinitializes the game games values to prevent the user from saving
     * using obsolete values after a change.
     */
    reinitGame() {
        this.nbDifferences = Constants.INIT_DIFF_NB;
        this.defaultImageUrl = '';
        this.isSaveable = false;
    }

    /**
     * THis method is used to save the game, it opens a popUp asking the user
    /**
     * This method is used to save the game, it opens a popUp asking the user
     * to give a name to their new game and saves it.
     */
    saveGame() {
        if (this.isSaveable) {
            let gameName = '';
            const saveDialogData: DialogData = {
                textToSend: 'Veuillez entrer le nom du jeu',
                inputData: {
                    inputLabel: 'Nom du jeu',
                    submitFunction: (value) => {
                        if (value.length < Constants.ten) {
                            return true;
                        }
                        return false;
                    },
                    returnValue: gameName,
                },
                closeButtonMessage: 'Sauvegarder',
            };
            if (!this.diffImageFile) {
                this.errorDialog('aucun fichier de différence');
                return;
            }
            this.popUpService.openDialog(saveDialogData);
            this.popUpService.dialogRef.afterClosed().subscribe((result) => {
                gameName = result;
                this.savedLevel = {
                    id: 0,
                    name: gameName,
                    playerSolo: [],
                    timeSolo: [],
                    playerMulti: [],
                    timeMulti: [],
                    isEasy: !this.differences?.isHard,
                    nbDifferences: this.nbDifferences,
                };
                if (!this.defaultImageFile || !this.diffImageFile || !this.differences) {
                    return;
                }
                const levelFormData: LevelFormData = {
                    imageOriginal: this.defaultImageFile,
                    imageDiff: this.diffImageFile,
                    name: this.savedLevel.name,
                    isEasy: this.savedLevel.isEasy.toString(),
                    clusters: JSON.stringify(this.differences.clusters),
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
                            // eslint-disable-next-line max-lines
                        };
                        this.popUpService.openDialog(dialogData, '/config');
                    }
                });
            });
        }
    }

    /**
     * This method is used to display an dialog with an error message.
     *
     * @param msg the error message we want to display.
     */
    errorDialog(msg = 'Une erreur est survenue') {
        if (this.popUpService.dialogRef) this.popUpService.dialogRef.close();
        const errorDialogData: DialogData = {
            textToSend: msg,
            closeButtonMessage: 'Fermer',
        };
        this.popUpService.openDialog(errorDialogData);
    }
}
