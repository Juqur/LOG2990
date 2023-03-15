import { Injectable } from '@angular/core';
import { Vec2 } from '@app/interfaces/vec2';

@Injectable({
    providedIn: 'root',
})
/**
 * This service is used to "draw" on a canvas. This includes drawing words or a grid pattern.
 *
 * @author Nikolay Radoev & Galen Hu
 * @class DrawService
 */
export class DrawService {
    context: CanvasRenderingContext2D;
    private paintColor = 'black';
    private brushSize = 10;

    /**
     * Getter for the width of the canvas
     */
    get width(): number {
        return this.context.canvas.width;
    }

    /**
     * Getter for the height of the canvas
     */
    get height(): number {
        return this.context.canvas.height;
    }

    paintBrush(): void {
        this.context.globalCompositeOperation = 'source-over';
        this.context.strokeStyle = this.paintColor;
        this.context.lineWidth = this.brushSize;
        this.context.lineCap = 'round';
    }

    eraseBrush(): void {
        this.context.globalCompositeOperation = 'destination-out';
        this.context.lineWidth = this.brushSize;
        this.context.lineCap = 'square';
    }

    /**
     * Method used to draw an error message on the canvas at a given coordinate
     *
     * @param coord The coordinate at which to start drawing the word ERREUR
     */
    drawError(coord: Vec2): void {
        this.context.font = '36px system-ui';
        this.context.fillStyle = 'red';
        this.context.fillText('ERREUR', coord.x, coord.y);
    }

    draw(prevCoord: Vec2, actCoord: Vec2 = { x: -1, y: -1 }): void {
        this.context.beginPath();
        this.context.moveTo(prevCoord.x, prevCoord.y);
        if (actCoord.x !== -1 && actCoord.y !== -1) {
            this.context.lineTo(actCoord.x, actCoord.y);
        } else {
            this.context.lineTo(prevCoord.x + 1, prevCoord.y);
        }

        this.context.stroke();
    }

    drawRect(coord: Vec2, width: number, height: number): void {
        console.log('draw rect');
        this.context.beginPath();
        this.context.rect(coord.x, coord.y, width, height);
        this.context.fill();
        this.context.stroke();
        // les la le de des oublie pas de créer un canvas par dessus et de le fusionner lorsque tu relaches le clic
    }
}
