import { Injectable } from '@angular/core';
import { Vec2 } from '@app/interfaces/vec2';
import { Constants } from '@common/constants';

/**
 * This service is used to "draw" on a canvas. This includes drawing words or a grid pattern.
 *
 * @author Nikolay Radoev & Galen Hu
 * @class DrawService
 */
@Injectable({
    providedIn: 'root',
})
export class DrawService {
    context: CanvasRenderingContext2D;
    isInCanvas = true;
    private paintColor = 'black';
    private brushSize = 1;

    /**
     * Getter for the width of the canvas.
     */
    get width(): number {
        return this.context.canvas.width;
    }

    /**
     * Getter for the height of the canvas.
     */
    get height(): number {
        return this.context.canvas.height;
    }

    /**
     * Setter for the context.
     */
    set contextToUse(context: CanvasRenderingContext2D) {
        this.context = context;
    }

    /**
     * Set the color of the brush.
     *
     * @param color The color of the brush.
     */
    setPaintColor(color: string): void {
        this.paintColor = color;
        this.context.strokeStyle = color;
        this.context.fillStyle = color;
    }

    /**
     * SetBrushSize sets the brush size of the context.
     *
     * @param size The size of the brush.
     */
    setBrushSize(size: number): void {
        this.brushSize = size;
        this.context.lineWidth = size;
    }

    /**
     * PaintBrush sets the attributes for a brush.
     */
    paintBrush(): void {
        this.context.globalCompositeOperation = 'source-over';
        this.context.strokeStyle = this.paintColor;
        this.context.lineWidth = this.brushSize;
        this.context.lineCap = 'round';
    }

    /**
     * EraseBrush sets the attributes for an eraser.
     */
    eraseBrush(): void {
        this.context.globalCompositeOperation = 'destination-out';
        this.context.lineWidth = this.brushSize;
        this.context.lineCap = 'square';
    }

    /**
     * Method used to draw an error message on the canvas at a given coordinate.
     *
     * @param coord The coordinate at which to start drawing the word ERREUR.
     */
    drawError(coord: Vec2): void {
        this.context.font = '36px system-ui';
        this.context.fillStyle = 'red';
        this.context.fillText('ERREUR', coord.x, coord.y);
    }

    /**
     * Method used to draw on the canvas at a given coordinate.
     *
     * @param previous The previous coordinate.
     * @param active The current coordinate.
     */
    draw(previous: Vec2, active: Vec2 = { x: -1, y: -1 }): void {
        this.context.beginPath();
        this.context.moveTo(previous.x, previous.y);
        if (active.x !== Constants.minusOne && active.y !== Constants.minusOne) {
            if (!this.isInCanvas) {
                this.context.moveTo(active.x, active.y);
                this.isInCanvas = true;
            }
            this.context.lineTo(active.x, active.y);
        } else {
            this.context.lineTo(previous.x + 1, previous.y);
        }
        this.context.stroke();
    }

    /**
     * This function is called when the user is on rectangle tool and draws a rectangle.
     *
     * @param coordinate Starting coordinate of the rectangle.
     * @param width The width of the rectangle.
     * @param height The height of the rectangle.
     */
    drawRect(coordinate: Vec2, width: number, height: number): void {
        this.context.beginPath();
        this.context.rect(coordinate.x, coordinate.y, width, height);
        this.context.fill();
        this.context.stroke();
    }
}
