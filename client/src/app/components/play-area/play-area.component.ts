import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Vec2 } from '@app/interfaces/vec2';
import { CanvasSharingService } from '@app/services/canvas-sharing.service';
import { DrawService } from '@app/services/draw.service';

// TODO : Avoir un fichier séparé pour les constantes!
export const DEFAULT_WIDTH = 640;
export const DEFAULT_HEIGHT = 480;

// TODO : Déplacer ça dans un fichier séparé accessible par tous
export enum MouseButton {
    Left = 0,
    Middle = 1,
    Right = 2,
    Back = 3,
    Forward = 4,
}

@Component({
    selector: 'app-play-area',
    templateUrl: './play-area.component.html',
    styleUrls: ['./play-area.component.scss'],
})
export class PlayAreaComponent implements AfterViewInit {
    @ViewChild('gridCanvas', { static: false }) private canvas!: ElementRef<HTMLCanvasElement>;
    //@Input() currentCanvas: HTMLCanvasElement;

    mousePosition: Vec2 = { x: 0, y: 0 };
    buttonPressed = '';

    currentImage = new Image();
    //currentImgSrc = 'assets/un_regal.bmp';

    /*setCanvas(value: HTMLCanvasElement) {
        if (this.canvas) {
            console.log(this.canvas.nativeElement);
            this.canvas.nativeElement = value;
        }
    }*/

    private canvasSize = { x: DEFAULT_WIDTH, y: DEFAULT_HEIGHT };
    constructor(private readonly drawService: DrawService, private canvasSharing: CanvasSharingService) {}

    get width(): number {
        return this.canvasSize.x;
    }

    get height(): number {
        return this.canvasSize.y;
    }

    @HostListener('keydown', ['$event'])
    buttonDetect(event: KeyboardEvent) {
        this.buttonPressed = event.key;
    }

    ngAfterViewInit(): void {
        /*if(this.currentCanvas)
        {
            this.canvas.nativeElement = this.currentCanvas;
        }*/
        if (this.canvas) {
            this.canvasSharing.setCanvasRef(this.canvas.nativeElement);
            this.drawService.context = this.canvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
            /*const ctx = this.drawService.context;

            this.currentImage.src = this.currentImgSrc;
            this.currentImage.onload = () => {
                ctx.drawImage(this.currentImage, 0, 0, this.width, this.height);
            };*/
            this.canvas.nativeElement.focus();}
    }

    // TODO : déplacer ceci dans un service de gestion de la souris!
    mouseHitDetect(event: MouseEvent) {
        if (event.button === MouseButton.Left) {
            this.mousePosition = { x: event.offsetX, y: event.offsetY };
        }
    }
}
