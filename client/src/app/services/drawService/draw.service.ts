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
}
