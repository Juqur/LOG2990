/* eslint-disable max-lines */
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaintAreaComponent } from '@app/components/paint-area/paint-area.component';
import { DrawService } from '@app/services/draw/draw.service';
import { MouseService } from '@app/services/mouse/mouse.service';
import SpyObj = jasmine.SpyObj;

fdescribe('PaintAreaComponent', () => {
    let mouseServiceSpy: SpyObj<MouseService>;
    let drawServiceSpy: SpyObj<DrawService>;
    let component: PaintAreaComponent;
    let fixture: ComponentFixture<PaintAreaComponent>;

    beforeEach(() => {
        mouseServiceSpy = jasmine.createSpyObj('MouseService', ['mouseHitDetect', 'getCanClick', 'getX', 'getY', 'changeClickState', 'mouseDrag']);
        drawServiceSpy = jasmine.createSpyObj('DrawService', ['draw', 'drawRect', 'setPaintColor', 'paintBrush']);
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PaintAreaComponent],
            imports: [HttpClientModule],
            providers: [{ provide: MouseService, useValue: mouseServiceSpy }],
        })
            .overrideProvider(DrawService, { useValue: drawServiceSpy })
            .compileComponents();

        fixture = TestBed.createComponent(PaintAreaComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('getter', () => {
        it('width should return the canvas width.', () => {
            const expected = 100;
            component['canvasSize'].x = expected;
            expect(component.width).toEqual(expected);
        });

        it('height should return the canvas height.', () => {
            const expected = 100;
            component['canvasSize'].y = expected;
            expect(component.height).toEqual(expected);
        });

        it('paintCanvas should return the foreground canvas.', () => {
            const expected = component.foregroundCanvas.nativeElement;
            expect(component.paintCanvas).toEqual(expected);
        });
    });

    describe('buttonDetect', () => {
        it('should detect when shift is pressed', () => {
            const buttonEvent = {
                key: 'Shift',
            } as KeyboardEvent;
            component.buttonDetect(buttonEvent);
            expect(component.isShiftPressed).toBeTrue();
        });
    });

    describe('buttonRelease', () => {
        it('should detect when shift is released', () => {
            const buttonEvent = {
                key: 'Shift',
            } as KeyboardEvent;
            component.buttonRelease(buttonEvent);
            expect(component.isShiftPressed).toBeFalse();
        });
    });

    describe('onCanvasClick', () => {
        const mouseEvent = {
            offsetX: 100,
            offsetY: 200,
            button: 0,
        } as MouseEvent;

        it('onCanvasClick should set isDragging to true and call appropriate functions if in in rectangle mode', () => {
            mouseServiceSpy.isRectangleMode = true;
            const tempCanvasSpy = spyOn(component, 'createTempCanvas');
            component.onCanvasClick(mouseEvent);
            expect(mouseServiceSpy.mouseDrag).toHaveBeenCalledTimes(1);
            expect(tempCanvasSpy).toHaveBeenCalledTimes(1);
        });
    });

    // it('onCanvasClick should set isDragging to true and call appropriate functions if not in rectangle mode', () => {
    //     const mouseEvent = {
    //         offsetX: 100,
    //         offsetY: 200,
    //         button: 0,
    //     } as MouseEvent;
    //     mouseServiceSpy.isRectangleMode = false;
    //     component.onCanvasClick(mouseEvent);
    //     expect(mouseServiceSpy.mouseDrag).toHaveBeenCalledTimes(1);
    //     expect(drawServiceSpy.draw).toHaveBeenCalledTimes(1);
    // });

    // it('onCanvasClick should draw any extra tempCanvas', () => {
    //     const mouseEvent = {
    //         offsetX: 100,
    //         offsetY: 200,
    //         button: 0,
    //     } as MouseEvent;
    //     mouseServiceSpy.isRectangleMode = true;
    //     const drawImageSpy = spyOn(CanvasRenderingContext2D.prototype, 'drawImage');
    //     const tempCanvas = document.createElement('canvas');
    //     tempCanvas.classList.add('draw');
    //     const currentCanvas = document.body.querySelector('#' + component.foregroundCanvas.nativeElement.id);
    //     currentCanvas?.parentNode?.insertBefore(tempCanvas, currentCanvas);
    //     component.onCanvasClick(mouseEvent);
    //     expect(drawImageSpy).toHaveBeenCalledTimes(1);
    // });
    // it('getCanvas should return the canvas element', () => {
    //     const canvas = component.paintCanvas;
    //     expect(canvas).toEqual(component.foregroundCanvas.nativeElement);
    // });

    // it('loadBackground should call context.drawImage', fakeAsync(() => {
    //     const drawImageSpy = spyOn(CanvasRenderingContext2D.prototype, 'drawImage');
    //     component.loadBackground(environment.serverUrl + 'originals/1.bmp');
    //     component.currentImage.dispatchEvent(new Event('load'));

    //     expect(drawImageSpy).toHaveBeenCalledTimes(1);
    // }));

    // it('loadBackground should call the diff canvas when isDiff is true', fakeAsync(() => {
    //     const drawImageSpy = spyOn(CanvasRenderingContext2D.prototype, 'drawImage');
    //     component.isDiff = true;
    //     component.loadBackground(environment.serverUrl + 'originals/1.bmp');
    //     component.currentImage.dispatchEvent(new Event('load'));

    //     expect(drawImageSpy).toHaveBeenCalledTimes(1);
    // }));

    // it('mergeCanvas should return a canvas with the correct size', () => {
    //     const result = component.mergeCanvas();
    //     expect(result.width).toBe(Constants.DEFAULT_WIDTH);
    //     expect(result.height).toBe(Constants.DEFAULT_HEIGHT);
    // });

    // it('createTempCanvas should correctly add a canvas on top of the other canvas', () => {
    //     component.createTempCanvas();
    //     const tempCanvasElement = document.body.querySelector('.draw');
    //     expect(tempCanvasElement).not.toBeNull();
    //     expect(tempCanvasElement?.tagName).toBe('CANVAS');
    //     const tempCanvas = tempCanvasElement as HTMLCanvasElement;
    //     expect(tempCanvas.width).toBe(Constants.DEFAULT_WIDTH);
    //     expect(tempCanvas.height).toBe(Constants.DEFAULT_HEIGHT);
    //     expect(tempCanvas.style.position).toBe('absolute');
    //     expect(tempCanvas.style.top).toBe(component.foregroundCanvas.nativeElement.offsetTop + 'px');
    //     expect(tempCanvas.style.left).toBe(component.foregroundCanvas.nativeElement.offsetLeft + 'px');
    //     expect(tempCanvas.previousElementSibling).toBe(component.foregroundCanvas.nativeElement);
    // });

    // it('canvasDrag should call the appropriate drawing function if in rectangle mode', () => {
    //     const mouseEvent = {
    //         offsetX: 100,
    //         offsetY: 200,
    //         button: 0,
    //     } as MouseEvent;
    //     component.isDragging = true;
    //     mouseServiceSpy.isRectangleMode = true;
    //     const rectangleSpy = spyOn(component, 'canvasRectangularDrag');
    //     component.canvasDrag(mouseEvent);
    //     expect(rectangleSpy).toHaveBeenCalledTimes(1);
    // });

    // it('canvasDrag should call the appropriate drawing function if not in rectangle mode', () => {
    //     const mouseEvent = {
    //         offsetX: 100,
    //         offsetY: 200,
    //         button: 0,
    //     } as MouseEvent;
    //     component.isDragging = true;
    //     mouseServiceSpy.isRectangleMode = false;
    //     const paintSpy = spyOn(component, 'canvasPaint');
    //     component.canvasDrag(mouseEvent);
    //     expect(paintSpy).toHaveBeenCalledTimes(1);
    // });

    // it('canvasPaint should paint on the canvas', () => {
    //     const mouseEvent = {
    //         offsetX: 100,
    //         offsetY: 200,
    //         button: 0,
    //     } as MouseEvent;
    //     mouseServiceSpy.getX.and.returnValue(mouseEvent.offsetX);
    //     mouseServiceSpy.getY.and.returnValue(mouseEvent.offsetY);
    //     component.canvasPaint(mouseEvent);
    //     expect(mouseServiceSpy.mouseDrag).toHaveBeenCalledTimes(1);
    //     expect(drawServiceSpy.draw).toHaveBeenCalledTimes(1);
    //     expect(drawServiceSpy.setPaintColor).toHaveBeenCalledTimes(1);
    // });

    // it('canvasPaint should not paint outside of the canvas', () => {
    //     const mouseEvent = {
    //         offsetX: 1000,
    //         offsetY: 2000,
    //         button: 0,
    //     } as MouseEvent;
    //     mouseServiceSpy.getX.and.returnValue(mouseEvent.offsetX);
    //     mouseServiceSpy.getY.and.returnValue(mouseEvent.offsetY);
    //     const releaseSpy = spyOn(component, 'onCanvasRelease');
    //     component.canvasPaint(mouseEvent);
    //     expect(mouseServiceSpy.mouseDrag).toHaveBeenCalledTimes(1);
    //     expect(releaseSpy).toHaveBeenCalledTimes(1);

    //     expect(drawServiceSpy.draw).not.toHaveBeenCalled();
    //     expect(drawServiceSpy.setPaintColor).not.toHaveBeenCalled();
    // });

    // it('canvasRectangularDrag should draw a rectangle inside the canvas', () => {
    //     const mouseEvent = {
    //         offsetX: 100,
    //         offsetY: 200,
    //         button: 0,
    //     } as MouseEvent;
    //     component.createTempCanvas();
    //     mouseServiceSpy.getX.and.returnValue(mouseEvent.offsetX);
    //     mouseServiceSpy.getY.and.returnValue(mouseEvent.offsetY);
    //     component.canvasRectangularDrag(mouseEvent);
    //     expect(mouseServiceSpy.mouseDrag).toHaveBeenCalledTimes(1);
    //     expect(drawServiceSpy.drawRect).toHaveBeenCalledTimes(1);
    // });

    // it('canvasRectangularDrag should not draw a rectangle outside the canvas', () => {
    //     const mouseEvent = {
    //         offsetX: 1000,
    //         offsetY: 2000,
    //         button: 0,
    //     } as MouseEvent;
    //     const releaseSpy = spyOn(component, 'onCanvasRelease');
    //     component.createTempCanvas();
    //     mouseServiceSpy.getX.and.returnValue(mouseEvent.offsetX);
    //     mouseServiceSpy.getY.and.returnValue(mouseEvent.offsetY);
    //     component.canvasRectangularDrag(mouseEvent);
    //     expect(mouseServiceSpy.mouseDrag).toHaveBeenCalledTimes(1);
    //     expect(releaseSpy).toHaveBeenCalledTimes(1);
    //     expect(drawServiceSpy.drawRect).not.toHaveBeenCalled();
    // });

    // it('canvasRectangularDrag should draw a square when shift is pressed', () => {
    //     let mouseEvent = {
    //         offsetX: 100,
    //         offsetY: 200,
    //         button: 0,
    //     } as MouseEvent;
    //     mouseServiceSpy.getX.and.returnValue(mouseEvent.offsetX);
    //     mouseServiceSpy.getY.and.returnValue(mouseEvent.offsetY);
    //     component.isShiftPressed = true;
    //     mouseServiceSpy.isRectangleMode = true;
    //     component.onCanvasClick(mouseEvent);
    //     mouseEvent = {
    //         offsetX: 150,
    //         offsetY: 300,
    //         button: 0,
    //     } as MouseEvent;
    //     mouseServiceSpy.getX.and.returnValue(mouseEvent.offsetX);
    //     mouseServiceSpy.getY.and.returnValue(mouseEvent.offsetY);
    //     component.canvasRectangularDrag(mouseEvent);
    //     expect(mouseServiceSpy.mouseDrag).toHaveBeenCalledTimes(2);
    //     expect(drawServiceSpy.drawRect).toHaveBeenCalledTimes(1);
    // });

    // it('canvasRectangularDrag should draw a square in the right quadrand', () => {
    //     let mouseEvent = {
    //         offsetX: 100,
    //         offsetY: 200,
    //         button: 0,
    //     } as MouseEvent;
    //     mouseServiceSpy.getX.and.returnValue(mouseEvent.offsetX);
    //     mouseServiceSpy.getY.and.returnValue(mouseEvent.offsetY);
    //     component.isShiftPressed = true;
    //     mouseServiceSpy.isRectangleMode = true;
    //     component.onCanvasClick(mouseEvent);
    //     mouseEvent = {
    //         offsetX: 250,
    //         offsetY: 100,
    //         button: 0,
    //     } as MouseEvent;
    //     mouseServiceSpy.getX.and.returnValue(mouseEvent.offsetX);
    //     mouseServiceSpy.getY.and.returnValue(mouseEvent.offsetY);
    //     component.canvasRectangularDrag(mouseEvent);
    //     expect(mouseServiceSpy.mouseDrag).toHaveBeenCalledTimes(2);
    //     expect(drawServiceSpy.drawRect).toHaveBeenCalledTimes(1);
    // });

    // it('canvasRectangularDrag should draw a square in the right quadrand', () => {
    //     let mouseEvent = {
    //         offsetX: 100,
    //         offsetY: 200,
    //         button: 0,
    //     } as MouseEvent;
    //     mouseServiceSpy.getX.and.returnValue(mouseEvent.offsetX);
    //     mouseServiceSpy.getY.and.returnValue(mouseEvent.offsetY);
    //     component.isShiftPressed = true;
    //     mouseServiceSpy.isRectangleMode = true;
    //     component.onCanvasClick(mouseEvent);
    //     mouseEvent = {
    //         offsetX: 150,
    //         offsetY: 100,
    //         button: 0,
    //     } as MouseEvent;
    //     mouseServiceSpy.getX.and.returnValue(mouseEvent.offsetX);
    //     mouseServiceSpy.getY.and.returnValue(mouseEvent.offsetY);
    //     component.canvasRectangularDrag(mouseEvent);
    //     expect(mouseServiceSpy.mouseDrag).toHaveBeenCalledTimes(2);
    //     expect(drawServiceSpy.drawRect).toHaveBeenCalledTimes(1);
    // });

    // it('canvasRectangularDrag should draw a square in the right quadrant', () => {
    //     let mouseEvent = {
    //         offsetX: 100,
    //         offsetY: 200,
    //         button: 0,
    //     } as MouseEvent;
    //     mouseServiceSpy.getX.and.returnValue(mouseEvent.offsetX);
    //     mouseServiceSpy.getY.and.returnValue(mouseEvent.offsetY);
    //     component.isShiftPressed = true;
    //     mouseServiceSpy.isRectangleMode = true;
    //     component.onCanvasClick(mouseEvent);
    //     mouseEvent = {
    //         offsetX: 50,
    //         offsetY: 100,
    //         button: 0,
    //     } as MouseEvent;
    //     mouseServiceSpy.getX.and.returnValue(mouseEvent.offsetX);
    //     mouseServiceSpy.getY.and.returnValue(mouseEvent.offsetY);
    //     component.canvasRectangularDrag(mouseEvent);
    //     expect(mouseServiceSpy.mouseDrag).toHaveBeenCalledTimes(2);
    //     expect(drawServiceSpy.drawRect).toHaveBeenCalledTimes(1);
    // });

    // it('canvasRectangularDrag should draw a square in the right quadrant', () => {
    //     let mouseEvent = {
    //         offsetX: 100,
    //         offsetY: 200,
    //         button: 0,
    //     } as MouseEvent;
    //     mouseServiceSpy.getX.and.returnValue(mouseEvent.offsetX);
    //     mouseServiceSpy.getY.and.returnValue(mouseEvent.offsetY);
    //     component.isShiftPressed = true;
    //     mouseServiceSpy.isRectangleMode = true;
    //     component.onCanvasClick(mouseEvent);
    //     mouseEvent = {
    //         offsetX: 10,
    //         offsetY: 150,
    //         button: 0,
    //     } as MouseEvent;
    //     mouseServiceSpy.getX.and.returnValue(mouseEvent.offsetX);
    //     mouseServiceSpy.getY.and.returnValue(mouseEvent.offsetY);
    //     component.canvasRectangularDrag(mouseEvent);
    //     expect(mouseServiceSpy.mouseDrag).toHaveBeenCalledTimes(2);
    //     expect(drawServiceSpy.drawRect).toHaveBeenCalledTimes(1);
    // });

    // it('onCanvasRelease should set isDragging to false', () => {
    //     component.onCanvasRelease();
    //     expect(component.isDragging).toBe(false);
    // });

    // it('onCanvasRelease should remove the temp canvas', () => {
    //     mouseServiceSpy.isRectangleMode = true;
    //     component.createTempCanvas();
    //     component.onCanvasRelease();
    //     const tempCanvasElement = document.body.querySelector('.draw');
    //     expect(tempCanvasElement).toBeNull();
    // });
});
