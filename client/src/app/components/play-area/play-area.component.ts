import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { DrawService } from '@app/services/draw.service';
import { MouseService } from '@app/services/mouse.service';

// TODO : Avoir un fichier séparé pour les constantes!
export const DEFAULT_WIDTH = 640;
export const DEFAULT_HEIGHT = 480;

@Component({
    selector: 'app-play-area',
    templateUrl: './play-area.component.html',
    styleUrls: ['./play-area.component.scss'],
})
export class PlayAreaComponent implements AfterViewInit {
    @ViewChild('gridCanvas', { static: false }) private canvas!: ElementRef<HTMLCanvasElement>;

    buttonPressed = '';

    private canvasSize = { x: DEFAULT_WIDTH, y: DEFAULT_HEIGHT };
    constructor(private readonly drawService: DrawService, private readonly mouseService: MouseService) {}

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
        this.drawService.context = this.canvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        const ctx = this.drawService.context;
        const currentImage = new Image();
        currentImage.src = './assets/un_regal.bmp';
        currentImage.onload = () => {
            ctx.drawImage(currentImage, 0, 0, this.width, this.height);
        };
        this.canvas.nativeElement.focus();
    }

    mouseHitDetect(event: MouseEvent) {
        this.mouseService.mouseHitDetect(event);
    }
}
