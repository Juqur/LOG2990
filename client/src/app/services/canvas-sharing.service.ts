import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CanvasSharingService {

  defaultCanvasRef: HTMLCanvasElement;
  diffCanvasRef: HTMLCanvasElement;

  setDefaultCanvasRef(canvas: HTMLCanvasElement) {
    this.defaultCanvasRef = canvas;
  }

  setDiffCanvasRef(canvas: HTMLCanvasElement) {
    this.diffCanvasRef = canvas;
  }
}