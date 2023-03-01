import { Injectable } from '@angular/core';
import { Vec2 } from '@app/interfaces/vec2';
import { MouseService } from '@app/services/mouse.service';
import { Constants } from '@common/constants';

@Injectable({
    providedIn: 'root',
})
export class DrawService {
    context: CanvasRenderingContext2D;
    private canvasSize: Vec2 = { x: Constants.DEFAULT_WIDTH, y: Constants.DEFAULT_HEIGHT };

    get width(): number {
        return this.canvasSize.x;
    }

    get height(): number {
        return this.canvasSize.y;
    }

    // TODO : pas de valeurs magiques!! Faudrait avoir une meilleure manière de le faire
    /* eslint-disable @typescript-eslint/no-magic-numbers */
    drawGrid() {
        this.context.beginPath();
        this.context.strokeStyle = 'black';
        this.context.lineWidth = 3;

        this.context.moveTo((this.width * 3) / 10, (this.height * 4) / 10);
        this.context.lineTo((this.width * 7) / 10, (this.height * 4) / 10);

        this.context.moveTo((this.width * 3) / 10, (this.height * 6) / 10);
        this.context.lineTo((this.width * 7) / 10, (this.height * 6) / 10);

        this.context.moveTo((this.width * 4) / 10, (this.height * 3) / 10);
        this.context.lineTo((this.width * 4) / 10, (this.height * 7) / 10);

        this.context.moveTo((this.width * 6) / 10, (this.height * 3) / 10);
        this.context.lineTo((this.width * 6) / 10, (this.height * 7) / 10);

        this.context.stroke();
    }

    drawWord(word: string) {
        const startPosition: Vec2 = { x: 175, y: 100 };
        const step = 20;
        this.context.font = '20px system-ui';
        for (let i = 0; i < word.length; i++) {
            this.context.fillText(word[i], startPosition.x + step * i, startPosition.y);
        }
    }

    drawError(mouseService: MouseService) {
        this.context.font = '36px system-ui';
        this.context.fillStyle = 'red';
        this.context.fillText('ERREUR', mouseService.getX(), mouseService.getY());
    }

    drawSuccess(mouseService: MouseService) {
        this.context.font = '36px system-ui';
        this.context.fillStyle = 'green';
        this.context.fillText('TROUVÉ', mouseService.getX(), mouseService.getY());
    }
}
