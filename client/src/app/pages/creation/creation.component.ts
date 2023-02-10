import { Component, OnInit } from '@angular/core';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { CanvasSharingService } from '@app/services/canvas-sharing.service';
import { DifferenceDetectorService } from '@app/services/difference-detector.service';
import { DrawService } from '@app/services/draw.service';
import { MouseService } from '@app/services/mouse.service';
import { Constants } from '@common/constants';

@Component({
    selector: 'app-creation',
    templateUrl: './creation.component.html',
    styleUrls: ['./creation.component.scss'],
})
export class CreationComponent implements OnInit {
    defaultImageFile: File | null = null;
    diffImageFile: File | null = null;
    sliderValue = Constants.SLIDER_DEFAULT;
    radius = Constants.RADIUS_DEFAULT;
    radiusTable = Constants.RADIUS_TABLE;
    nbDifferences = Constants.INIT_DIFF_NB;
    isSaveable = false;

    defaultArea: PlayAreaComponent | null = null;
    modifiedArea: PlayAreaComponent | null = null;
    defaultCanvasCtx: CanvasRenderingContext2D | null = null;
    diffCanvasCtx: CanvasRenderingContext2D | null = null;

    url: unknown;
    msg = '';

    constructor(private canvasShare: CanvasSharingService, private mouseService: MouseService, private diffService : DifferenceDetectorService) { }

    ngOnInit(): void {
        this.defaultCanvasCtx = document.createElement('canvas').getContext('2d');
        this.canvasShare.setDefaultCanvasRef(this.defaultCanvasCtx?.canvas as HTMLCanvasElement);
        this.diffCanvasCtx = document.createElement('canvas').getContext('2d');
        this.canvasShare.setDiffCanvasRef(this.diffCanvasCtx?.canvas as HTMLCanvasElement);

        this.defaultArea = new PlayAreaComponent(new DrawService(), this.canvasShare, this.mouseService);
        this.modifiedArea = new PlayAreaComponent(new DrawService(), this.canvasShare, this.mouseService);
    }

    defaultImageSelector(event: Event) {
        const target = event.target as HTMLInputElement;
        if (!target.files) {
            return;
        }
        this.defaultImageFile = target.files[0];
        this.verifiyImageFormat(this.defaultImageFile).then((result) => {
            if (!result) return;
            else this.showDefaultImage();
        });
    }
    diffImageSelector(event: Event) {
        const target = event.target as HTMLInputElement;
        if (!target.files) {
            return;
        }
        this.diffImageFile = target.files[0];
        this.verifiyImageFormat(this.diffImageFile).then((result) => {
            if (!result) return;
            else this.showDiffImage();
        });
    }
    bothImagesSelector(event: Event) {
        const target = event.target as HTMLInputElement;
        if (!target.files) {
            return;
        }
        this.defaultImageFile = target.files[0];
        this.diffImageFile = target.files[0];
        this.verifiyImageFormat(this.defaultImageFile).then((result) => {
            if (!result) return;
            else {
                this.showDefaultImage();
                this.showDiffImage();
            }
        });
    }
    cleanSrc(event: Event) {
        const target = event.target as HTMLInputElement;
        target.value = '';
    }

    showDefaultImage() {
        if (!this.defaultImageFile) {
            return;
        }
        const image1 = new Image();
        image1.src = URL.createObjectURL(this.defaultImageFile);
        image1.onload = () => {
            if (!this.defaultCanvasCtx || image1.width !== 640 || image1.height !== 480) {
                return;
            }
            this.canvasShare.defaultCanvasRef.width = image1.width;
            this.canvasShare.defaultCanvasRef.height = image1.height;
            this.canvasShare.defaultCanvasRef.getContext('2d')?.drawImage(image1, 0, 0);
            this.defaultCanvasCtx = this.canvasShare.defaultCanvasRef.getContext('2d');
        };
    }
    showDiffImage() {
        if (!this.diffImageFile) {
            return;
        }
        const image2 = new Image();
        image2.src = URL.createObjectURL(this.diffImageFile);
        image2.onload = () => {
            if (!this.diffCanvasCtx || image2.width !== 640 || image2.height !== 480) {
                return;
            }
            this.canvasShare.diffCanvasRef.width = image2.width;
            this.canvasShare.diffCanvasRef.height = image2.height;
            this.canvasShare.diffCanvasRef.getContext('2d')?.drawImage(image2, 0, 0);
            this.diffCanvasCtx = this.canvasShare.diffCanvasRef.getContext('2d');
        };
    }

    verifiyImageFormat(imageFile: File) {
        if (imageFile.type !== 'image/bmp' || imageFile.type !== 'image/bmp') {
            this.msg = 'Les images doivent être au format PNG';
            return Promise.resolve(false);
        }

        return new Promise((resolve, reject) => {

            // Vérifie le header de l'image. Ce header contient les informations que l'on recherche :
            // Le Nombre de bits par pixel (en little endian)
            const reader = new FileReader();
            reader.onload = (e) => {
                const imgData = e.target?.result as ArrayBuffer;
                const view = new DataView(imgData);
                const bitNb = view.getUint16(28, true);

                if (bitNb !== 24) {
                    resolve(false);
                    this.msg = 'Les images doivent être de 24 bits par pixel';
                }
                resolve(true);
            };
            reader.readAsArrayBuffer(imageFile);
        });
    }

    resetDefault() {
        this.canvasShare.defaultCanvasRef
            .getContext('2d')
            ?.clearRect(0, 0, this.canvasShare.defaultCanvasRef.width, this.canvasShare.defaultCanvasRef.height);
    }
    resetDiff() {
        this.canvasShare.diffCanvasRef.getContext('2d')?.clearRect(0, 0, this.canvasShare.diffCanvasRef.width, this.canvasShare.diffCanvasRef.height);
    }

    sliderChange(value: number) {
        this.radius = this.radiusTable[value];
    }

    detectDifference() {
        // Lancer la validation des différences selon le rayon
        // Ouvrir un popup qui affiche le résultat
        if (!this.defaultCanvasCtx || !this.diffCanvasCtx) return;
        this.nbDifferences = Constants.INIT_DIFF_NB;

        const differences = this.diffService.detectDifferences(this.defaultCanvasCtx, this.diffCanvasCtx, this.radius);
        if (!differences) {
            return;
        }
        this.nbDifferences = differences.clusters.length;

        // Mets le dans le popup quand ce sera possible
        document.getElementById('top-area')?.appendChild(differences.canvas.canvas);

        if (this.nbDifferences >= Constants.RADIUS_DEFAULT && this.nbDifferences <= Constants.BIG_DIFF_NB) {
             this.isSaveable = true;
        }
        else this.isSaveable = false;
    }

    saveGame() {
        if (!this.isSaveable) {
            // Ouvrir un popup qui demande à l'utilisateur de nommer le jeu
            // Sauvegarder le jeu
        }
    }
}
