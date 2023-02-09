import { Component } from '@angular/core';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { CanvasSharingService } from '@app/services/canvas-sharing.service';
import { DrawService } from '@app/services/draw.service';
import { MouseService } from '@app/services/mouse.service';

@Component({
    selector: 'app-creation',
    templateUrl: './creation.component.html',
    styleUrls: ['./creation.component.scss'],
})
export class CreationComponent {

    constructor(private canvasShare: CanvasSharingService, private mouseService: MouseService) { }

    defaultImage: File | null = null;
    diffImage: File | null = null;
    sliderValue = 1;
    radius = 3;
    radiusTable = [0,3,9,15];
    nbDifferences = 0;
    isSaveable = false;

    defaultArea: PlayAreaComponent | null = null;
    modifiedArea: PlayAreaComponent | null = null;
    defaultCanvasCtx: CanvasRenderingContext2D | null = null;
    diffCanvasCtx: CanvasRenderingContext2D | null = null;

    url: any;
    msg = "";

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
        this.defaultImage = target.files[0];
        this.showDefaultImage();
    }
    diffImageSelector(event: Event) {
        const target = event.target as HTMLInputElement;
        if (!target.files) {
            return;
        }
        this.diffImage = target.files[0];
        this.showDiffImage();
    }
    bothImagesSelector(event: Event) {
        const target = event.target as HTMLInputElement;
        if (!target.files) {
            return;
        }
        this.defaultImage = target.files[0];
        this.diffImage = target.files[0];
        this.showDefaultImage();
        this.showDiffImage();
    }
    cleanSrc(event: Event) {
        const target = event.target as HTMLInputElement;
        target.value = "";
    }

    showDefaultImage() {
        if (!this.defaultImage) {
            return;
        }
        const image1 = new Image();
        image1.src = URL.createObjectURL(this.defaultImage);
        image1.onload = () => {
            if (!this.defaultCanvasCtx) {
                return;
            }
            this.canvasShare.defaultCanvasRef.width = image1.width;
            this.canvasShare.defaultCanvasRef.height = image1.height;
            this.canvasShare.defaultCanvasRef.getContext('2d')?.drawImage(image1, 0, 0);
            this.defaultCanvasCtx = this.canvasShare.defaultCanvasRef.getContext('2d');
        }
    }
    showDiffImage() {
        if (!this.diffImage) {
            return;
        }

        const image2 = new Image();
        image2.src = URL.createObjectURL(this.diffImage);

        image2.onload = () => {
            if (!this.defaultCanvasCtx || !this.diffCanvasCtx) {
                return;
            }
            this.canvasShare.diffCanvasRef.width = image2.width;
            this.canvasShare.diffCanvasRef.height = image2.height;
            this.canvasShare.diffCanvasRef.getContext('2d')?.drawImage(image2, 0, 0);
            this.diffCanvasCtx = this.canvasShare.diffCanvasRef.getContext('2d');
        };
    }

    resetDefault() {
        this.canvasShare.defaultCanvasRef.getContext('2d')?.clearRect(0, 0, this.canvasShare.defaultCanvasRef.width,
            this.canvasShare.defaultCanvasRef.height);

        //televerser img1 commune -> reinitialiser une zone -> televerser img1 commune ne fonctionne pas??
        //en fait tu peux pas televerser la meme image 2 fois (telev img1 -> reinit -> telev img1)
    }
    resetDiff() {
        this.canvasShare.diffCanvasRef.getContext('2d')?.clearRect(0, 0, this.canvasShare.diffCanvasRef.width,
            this.canvasShare.diffCanvasRef.height);
    }

    sliderChange(value : number) {
        this.radius = this.radiusTable[value];
    }

    detectDifference(){
        //Lancer la validation des différences selon le rayon
        //Ouvrir un popup qui affiche le résultat
        if (this.nbDifferences >= 3 && this.nbDifferences <= 9)
            this.isSaveable = true;
        else
            this.isSaveable = false;
    }

    saveGame(){
        if (!this.isSaveable){
            //Ouvrir un popup qui demande à l'utilisateur de nommer le jeu
            //Sauvegarder le jeu
        }
    }
}
