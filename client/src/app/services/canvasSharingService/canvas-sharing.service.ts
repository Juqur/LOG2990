import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
/**
 * This service is used in order to share the canvases to components that need both in easy access
 *
 * @author Simon Gagné
 * @class CanvasSharingService
 */
export class CanvasSharingService {
    private defaultCanvasRef: HTMLCanvasElement;
    private diffCanvasRef: HTMLCanvasElement;

    /**
     * Getter for the default canvas
     */
    get defaultCanvas(): HTMLCanvasElement {
        return this.defaultCanvasRef;
    }

    /**
     * Getter for the difference canvas
     */
    get diffCanvas(): HTMLCanvasElement {
        return this.diffCanvasRef;
    }

    /**
     * Setter for the default canvas
     *
     * @param canvas the default canvas
     */
    set defaultCanvas(canvas: HTMLCanvasElement) {
        this.defaultCanvasRef = canvas;
    }

    /**
     * Setter for the difference canvas
     *
     * @param canvas the difference canvas
     */
    set diffCanvas(canvas: HTMLCanvasElement) {
        this.diffCanvasRef = canvas;
    }
}
