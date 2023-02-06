import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CanvasSharingService {

  originalCanvasRef: HTMLCanvasElement;
  diffCanvasRef: HTMLCanvasElement;

  setOriginalCanvasRef(canvas: HTMLCanvasElement) {
    this.originalCanvasRef = canvas;
  }

  setDiffCanvasRef(canvas: HTMLCanvasElement) {
    this.diffCanvasRef = canvas;
  }
}