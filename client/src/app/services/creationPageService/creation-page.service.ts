import { Injectable } from '@angular/core';
import { CreationSpecs } from '@app/interfaces/creation-specs';
import { CanvasSharingService } from '@app/services/canvasSharingService/canvas-sharing.service';
import { Constants } from '@common/constants';

@Injectable({
    providedIn: 'root',
})
export class CreationPageService {
    creationSpecs: CreationSpecs;
    constructor(private canvasShare: CanvasSharingService) {
        this.creationSpecs.defaultImageFile = null;
        this.creationSpecs.diffImageFile = null;
        this.creationSpecs.radius = Constants.RADIUS_DEFAULT;
        this.creationSpecs.nbDifferences = Constants.INIT_DIFF_NB;
        this.creationSpecs.defaultArea = null;
        this.creationSpecs.modifiedArea = null;
        this.creationSpecs.defaultCanvasCtx = document.createElement('canvas').getContext('2d');
        this.canvasShare.defaultCanvas = this.creationSpecs.defaultCanvasCtx?.canvas as HTMLCanvasElement;
        this.creationSpecs.diffCanvasCtx = document.createElement('canvas').getContext('2d');
        this.canvasShare.diffCanvas = this.creationSpecs.diffCanvasCtx?.canvas as HTMLCanvasElement;
    }
}
