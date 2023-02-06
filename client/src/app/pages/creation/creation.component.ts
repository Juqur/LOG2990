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

    constructor(private defaultCanvasShare: CanvasSharingService, private diffCanvasShare: CanvasSharingService) { }

    defaultImage: File | null = null;
    diffImage: File | null = null;
    radius = 3;

    defaultArea: PlayAreaComponent | null = null;
    //document.getElementById('defaultArea') as unknown as PlayAreaComponent;
    modifiedArea: PlayAreaComponent | null = null;
    //document.getElementById('modifiedArea') as unknown as PlayAreaComponent;

    defaultCanvas: CanvasRenderingContext2D | null = null;
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
    bothImagesSelector(event: Event) {
        const target = event.target as HTMLInputElement;
        if (!target.files) {
            return;
        }
        this.defaultImage = target.files[0];
        this.diffImage = target.files[0];
    }

    showDefaultImage() {
    }

    detectDifference() {
        if (!this.defaultImage || !this.diffImage) {
            return;
        }

        this.defaultCanvas = document.createElement('canvas').getContext('2d');
        this.defaultCanvasShare.setDefaultCanvasRef(this.defaultCanvas?.canvas as HTMLCanvasElement);

        this.diffCanvas = document.createElement('canvas').getContext('2d');
        this.diffCanvasShare.setDiffCanvasRef(this.diffCanvas?.canvas as HTMLCanvasElement);

        this.defaultArea = new PlayAreaComponent(new DrawService(), this.defaultCanvasShare);
        this.modifiedArea = new PlayAreaComponent(new DrawService(), this.diffCanvasShare);

        const image1 = new Image();
        const image2 = new Image();
        image1.src = URL.createObjectURL(this.defaultImage);
        image2.src = URL.createObjectURL(this.diffImage);
        image1.onload = () => {
            image2.onload = () => {
                if (!this.defaultCanvas || !this.diffCanvas) {
                    return;
                }
                this.defaultCanvasShare.defaultCanvasRef.width = image1.width;
                this.defaultCanvasShare.defaultCanvasRef.height = image1.height;
                this.diffCanvasShare.diffCanvasRef.width = image1.width;
                this.diffCanvasShare.diffCanvasRef.height = image1.height;
                this.defaultCanvasShare.defaultCanvasRef.getContext('2d')?.drawImage(image1, 0, 0);
                this.diffCanvasShare.diffCanvasRef.getContext('2d')?.drawImage(image2, 0, 0);
            };
        };
    }

    resetDefault() {
        this.defaultCanvasShare.defaultCanvasRef.getContext('2d')?.clearRect(0, 0, this.defaultCanvasShare.defaultCanvasRef.width, 
            this.defaultCanvasShare.defaultCanvasRef.height);
    }

    resetDiff() {
        this.diffCanvasShare.diffCanvasRef.getContext('2d')?.clearRect(0, 0, this.diffCanvasShare.diffCanvasRef.width, 
            this.diffCanvasShare.diffCanvasRef.height);
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
            this.defaultArea = new PlayAreaComponent(new DrawService);
        }

    }*/
}
