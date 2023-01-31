import { Component } from '@angular/core';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { DrawService } from '@app/services/draw.service';

@Component({
    selector: 'app-creation',
    templateUrl: './creation.component.html',
    styleUrls: ['./creation.component.scss'],
})
export class CreationComponent {
    originalImgFile: File | null = null;
    modifiedImgFile: File | null = null;

    originalArea = new PlayAreaComponent(new DrawService);
    modifiedArea = new PlayAreaComponent(new DrawService);

    url: any;
    msg = "";

    onFileChange(event: any){
        const target = event.target as HTMLInputElement;
        const files = target.files as FileList;
        this.originalImgFile = files[0];


        if (!this.originalImgFile) {

            this.msg = "No file selected!";
            return;
        }

        var reader = new FileReader();
		reader.readAsDataURL(this.originalImgFile);
		
		reader.onload = (_event) => {
            this.originalArea = new PlayAreaComponent(new DrawService);
		}

    }
}
