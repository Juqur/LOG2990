import { Component } from '@angular/core';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { DrawService } from '@app/services/draw.service';

@Component({
    selector: 'app-creation',
    templateUrl: './creation.component.html',
    styleUrls: ['./creation.component.scss'],
})
export class CreationComponent {
    defaultImage: File | null = null;
    diffImage: File | null = null;
    radius = 3;

    originalArea = new PlayAreaComponent(new DrawService());
    modifiedArea = new PlayAreaComponent(new DrawService());
    

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

    detectDifference() {
        if (!this.defaultImage || !this.diffImage) {
            return;
        }

        /*const defaultCanvas = document.createElement('canvas').getContext('2d');
        const diffCanvas = document.createElement('canvas').getContext('2d');*/
        this.defaultCanvas = document.createElement('canvas').getContext('2d');
        this.diffCanvas = document.createElement('canvas').getContext('2d');
        
        //document.body.getElementsByClassName('img-zone-container')[0].appendChild(this.defaultCanvas?.canvas as HTMLCanvasElement);
        //document.body.getElementsByClassName('img-zone-container')[1].appendChild(this.diffCanvas?.canvas as HTMLCanvasElement);
        //const originalArea = document.getElementById('original-area') as unknown as PlayAreaComponent;
        //const modifiedArea = document.getElementById('modified-area') as unknown as PlayAreaComponent;
        this.originalArea.setCanvas(this.defaultCanvas?.canvas as HTMLCanvasElement);
        this.modifiedArea.setCanvas(this.diffCanvas?.canvas as HTMLCanvasElement);

        /*document.body.getElementsByClassName('img-zone-container')[0].replaceChild(
            this.defaultCanvas?.canvas as HTMLCanvasElement, document.getElementsByTagName('canvas')[0]);

        document.body.appendChild(this.defaultCanvas?.canvas as HTMLCanvasElement);
        document.body.appendChild(this.diffCanvas?.canvas as HTMLCanvasElement);*/
        const image1 = new Image();
        const image2 = new Image();
        image1.src = URL.createObjectURL(this.defaultImage);
        image2.src = URL.createObjectURL(this.diffImage);
        image1.onload = () => {
            image2.onload = () => {
                if (!this.defaultCanvas || !this.diffCanvas) {
                    return;
                }
                this.defaultCanvas.canvas.width = image1.width;
                this.defaultCanvas.canvas.height = image1.height;
                this. diffCanvas.canvas.width = image1.width;
                this.diffCanvas.canvas.height = image1.height;
                this.defaultCanvas?.drawImage(image1, 0, 0);
                this.diffCanvas?.drawImage(image2, 0, 0);
            };
        };
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
