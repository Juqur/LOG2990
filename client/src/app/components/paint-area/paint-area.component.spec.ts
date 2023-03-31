/* eslint-disable max-lines */
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaintAreaComponent } from '@app/components/paint-area/paint-area.component';
import { DrawService } from '@app/services/draw/draw.service';
import { MouseService } from '@app/services/mouse/mouse.service';
import SpyObj = jasmine.SpyObj;

fdescribe('PaintAreaComponent', () => {
    const mouseEvent = {} as unknown as MouseEvent;
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
        let drawSiblingCanvasesSpy: jasmine.Spy;
        let createTemporaryCanvasSpy: jasmine.Spy;

        beforeEach(() => {
            drawSiblingCanvasesSpy = spyOn(component, 'drawSiblingCanvases' as never);
            createTemporaryCanvasSpy = spyOn(component, 'createTemporaryCanvas');
        });

        it('should call drawSiblingCanvases', () => {
            component.onCanvasClick(mouseEvent);
            expect(drawSiblingCanvasesSpy).toHaveBeenCalledTimes(1);
        });

        it('should call mouseDrag', () => {
            component.onCanvasClick(mouseEvent);
            expect(mouseServiceSpy.mouseDrag).toHaveBeenCalledTimes(1);
        });

        it('should set lastMousePosition to the appropriate expected mouse position', () => {
            const expected = { x: 100, y: 200 };
            mouseServiceSpy.getX.and.returnValue(expected.x);
            mouseServiceSpy.getY.and.returnValue(expected.y);
            component.onCanvasClick(mouseEvent);
            expect(component['lastMousePosition']).toEqual(expected);
        });

        it('should call createTemporaryCanvas if it is in rectangle mode', () => {
            mouseServiceSpy.isRectangleMode = true;
            component.onCanvasClick(mouseEvent);
            expect(createTemporaryCanvasSpy).toHaveBeenCalledTimes(1);
        });

        it('should not call createTemporaryCanvas if it is not in rectangle mode', () => {
            mouseServiceSpy.isRectangleMode = false;
            component.onCanvasClick(mouseEvent);
            expect(createTemporaryCanvasSpy).not.toHaveBeenCalled();
        });
    });

    describe('onCanvasRelease', () => {
        let drawImageSpy: jasmine.Spy;
        let removeChildSpy: jasmine.Spy;

        beforeEach(() => {
            drawImageSpy = spyOn(CanvasRenderingContext2D.prototype, 'drawImage');
            removeChildSpy = spyOn(HTMLElement.prototype, 'removeChild' as never);
        });
        it('should set isDragging to false', () => {
            component.onCanvasRelease();
            expect(component.isDragging).toBeFalse();
        });

        it('should set lastMousePosition to the appropriate expected mouse position', () => {
            const expected = { x: -1, y: -1 };
            mouseServiceSpy.getX.and.returnValue(expected.x);
            mouseServiceSpy.getY.and.returnValue(expected.y);
            component.onCanvasRelease();
            expect(component['lastMousePosition']).toEqual(expected);
        });

        it('should call drawImage if it is in rectangle mode', () => {
            mouseServiceSpy.isRectangleMode = true;
            component.onCanvasRelease();
            expect(drawImageSpy).toHaveBeenCalledWith(component['tempCanvas'], 0, 0);
        });

        it('should call removeChildSpy if it is in rectangle mode', () => {
            mouseServiceSpy.isRectangleMode = true;
            component.onCanvasRelease();
            expect(removeChildSpy).toHaveBeenCalledWith(component['tempCanvas']);
        });
    });

    describe('onCanvasDrag', () => {
        let canvasRectangularDragSpy: jasmine.Spy;
        let canvasPaintSpy: jasmine.Spy;

        beforeEach(() => {
            component['isDragging'] = true;
            canvasRectangularDragSpy = spyOn(component, 'canvasRectangularDrag');
            canvasPaintSpy = spyOn(component, 'canvasPaint');
        });

        it('should call canvasRectangularDrag if it is in rectangle mode', () => {
            mouseServiceSpy.isRectangleMode = true;
            component.onCanvasDrag(mouseEvent);
            expect(canvasRectangularDragSpy).toHaveBeenCalledTimes(1);
        });

        it('should call canvasPaint if it is not in rectangle mode', () => {
            mouseServiceSpy.isRectangleMode = false;
            component.onCanvasDrag(mouseEvent);
            expect(canvasPaintSpy).toHaveBeenCalledTimes(1);
        });
    });
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

    // it('createTemporaryCanvas should correctly add a canvas on top of the other canvas', () => {
    //     component.createTemporaryCanvas();
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

    // it('onCanvasDrag should call the appropriate drawing function if in rectangle mode', () => {
    //     const mouseEvent = {
    //         offsetX: 100,
    //         offsetY: 200,
    //         button: 0,
    //     } as MouseEvent;
    //     component.isDragging = true;
    //     mouseServiceSpy.isRectangleMode = true;
    //     const rectangleSpy = spyOn(component, 'canvasRectangularDrag');
    //     component.onCanvasDrag(mouseEvent);
    //     expect(rectangleSpy).toHaveBeenCalledTimes(1);
    // });

    // it('onCanvasDrag should call the appropriate drawing function if not in rectangle mode', () => {
    //     const mouseEvent = {
    //         offsetX: 100,
    //         offsetY: 200,
    //         button: 0,
    //     } as MouseEvent;
    //     component.isDragging = true;
    //     mouseServiceSpy.isRectangleMode = false;
    //     const paintSpy = spyOn(component, 'canvasPaint');
    //     component.onCanvasDrag(mouseEvent);
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
    //     component.createTemporaryCanvas();
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
    //     component.createTemporaryCanvas();
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
});
