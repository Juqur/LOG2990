import { Component } from '@angular/core';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { CanvasSharingService } from '@app/services/canvas-sharing.service';
import { DrawService } from '@app/services/draw.service';

@Component({
    selector: 'app-creation',
    templateUrl: './creation.component.html',
    styleUrls: ['./creation.component.scss'],
})
export class CreationComponent {

    constructor(private originalCanvasShare: CanvasSharingService, private diffCanvasShare: CanvasSharingService) { }

    defaultImage: File | null = null;
    diffImage: File | null = null;
    radius = 3;

    originalArea: PlayAreaComponent = document.getElementById('original-area') as unknown as PlayAreaComponent;
    modifiedArea: PlayAreaComponent = document.getElementById('modified-area') as unknown as PlayAreaComponent;

    originalCanvas: CanvasRenderingContext2D | null = null;
    diffCanvas: CanvasRenderingContext2D | null = null;

    url: any;
    msg = "";

    defaultImageSelector(event: Event) {
        const target = event.target as HTMLInputElement;
        if (!target.files) {
            return;
        }
        this.defaultImage = target.files[0];
    }
    diffImageSelector(event: Event) {
        const target = event.target as HTMLInputElement;
        if (!target.files) {
            return;
        }
        this.diffImage = target.files[0];
    }

    detectDifference() {
        if (!this.defaultImage || !this.diffImage) {
            return;
        }

        this.originalCanvas = document.createElement('canvas').getContext('2d');
        this.originalCanvasShare.setOriginalCanvasRef(this.originalCanvas?.canvas as HTMLCanvasElement);

        this.diffCanvas = document.createElement('canvas').getContext('2d');
        this.diffCanvasShare.setDiffCanvasRef(this.diffCanvas?.canvas as HTMLCanvasElement);

        this.originalArea = new PlayAreaComponent(new DrawService(), this.originalCanvasShare);
        this.modifiedArea = new PlayAreaComponent(new DrawService(), this.diffCanvasShare);

        const image1 = new Image();
        const image2 = new Image();
        image1.src = URL.createObjectURL(this.defaultImage);
        image2.src = URL.createObjectURL(this.diffImage);
        image1.onload = () => {
            image2.onload = () => {
                if (!this.originalCanvas || !this.diffCanvas) {
                    return;
                }
                this.originalCanvasShare.originalCanvasRef.width = image1.width;
                this.originalCanvasShare.originalCanvasRef.height = image1.height;
                this.diffCanvasShare.diffCanvasRef.width = image1.width;
                this.diffCanvasShare.diffCanvasRef.height = image1.height;
                this.originalCanvasShare.originalCanvasRef.getContext('2d')?.drawImage(image1, 0, 0);
                this.diffCanvasShare.diffCanvasRef.getContext('2d')?.drawImage(image2, 0, 0);
            };
        };
    }

    resetOriginal() {
        this.originalCanvasShare.originalCanvasRef.getContext('2d')?.clearRect(0, 0, this.originalCanvasShare.originalCanvasRef.width, 
            this.originalCanvasShare.originalCanvasRef.height);
        this.originalCanvasShare.originalCanvasRef.getContext('2d')?.drawImage(this.originalCanvasShare.originalCanvasRef, 0, 0);
    }

    resetDiff() {
        this.diffCanvasShare.diffCanvasRef.getContext('2d')?.clearRect(0, 0, this.diffCanvasShare.diffCanvasRef.width, 
            this.diffCanvasShare.diffCanvasRef.height);
       // this.diffCanvasShare.diffCanvasRef.getContext('2d')?.drawImage(this.diffCanvasShare.diffCanvasRef, 0, 0);
    }



    /*onFileChange(event: any){
        const target = event.target as HTMLInputElement;
        const files = target.files as FileList;
        this.defaultImage = files[0];


        if (!this.defaultImage) {

            this.msg = "No file selected!";
            return;
        }

        var reader = new FileReader();
        reader.readAsDataURL(this.defaultImage);
    	
        reader.onload = (_event) => {
            this.originalArea = new PlayAreaComponent(new DrawService);
        }

    }*/
}
