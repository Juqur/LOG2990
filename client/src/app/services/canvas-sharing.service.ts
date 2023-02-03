import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CanvasSharingService {

  canvasRef: HTMLCanvasElement;

  setCanvasRef(canvas: HTMLCanvasElement) {
    this.canvasRef = canvas;
  }
}