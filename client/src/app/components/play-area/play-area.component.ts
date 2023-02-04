import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { DrawService } from '@app/services/draw.service';
import { MouseService } from '@app/services/mouse.service';
import { Constants } from '@common/constants';

// TODO : Avoir un fichier séparé pour les constantes!

@Component({
    selector: 'app-play-area',
    templateUrl: './play-area.component.html',
    styleUrls: ['./play-area.component.scss'],
})
export class PlayAreaComponent implements AfterViewInit {
    @ViewChild('gridCanvas', { static: false }) private canvas!: ElementRef<HTMLCanvasElement>;

    buttonPressed = '';

    private canvasSize = { x: Constants.DEFAULT_WIDTH, y: Constants.DEFAULT_HEIGHT };
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
        this.drawPlayArea();
        // this.drawService.drawGrid();
        // this.drawService.drawPlayArea();
    }

    mouseHitDetect(event: MouseEvent) {
        if (this.mouseService.canClick) {
            const clickedOnDiff: boolean = this.mouseService.mouseHitDetect(event);
            if (clickedOnDiff) {
                this.drawService.drawSuccess(this.mouseService);
                // setTimeout(this.drawService.drawPlayArea, 1000);
                this.timeout(Constants.millisecondsInOneSecond).then(() => {
                    this.drawPlayArea();
                });
            } else {
                this.drawService.drawError(this.mouseService);
                this.mouseService.changeClickState();
                this.timeout(Constants.millisecondsInOneSecond).then(() => {
                    this.mouseService.changeClickState();
                    this.drawPlayArea();
                });
            }
        } else {
            // The player is not allowed to click again so he has to wait.
        }
    }

    drawPlayArea() {
        this.drawService.context = this.canvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        const ctx = this.drawService.context;
        const currentImage = new Image();
        currentImage.src = './assets/un_regal.bmp';
        currentImage.onload = () => {
            ctx.drawImage(currentImage, 0, 0, this.width, this.height);
        };
        this.canvas.nativeElement.focus();
    }

    async timeout(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
