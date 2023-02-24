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
    defaultCanvasRef: HTMLCanvasElement;
    diffCanvasRef: HTMLCanvasElement;

    /**
     * Setter for the default canvas
     *
     * @param canvas the default canvas
     */
    setDefaultCanvasRef(canvas: HTMLCanvasElement) {
        this.defaultCanvasRef = canvas;
    }

    /**
     * Setter for the difference canvas
     *
     * @param canvas the difference canvas
     */
    setDiffCanvasRef(canvas: HTMLCanvasElement) {
        this.diffCanvasRef = canvas;
    }
}
