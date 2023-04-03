/* eslint-disable max-lines */
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaintAreaComponent } from '@app/components/paint-area/paint-area.component';
import { DrawService } from '@app/services/draw/draw.service';
import { MouseService } from '@app/services/mouse/mouse.service';
import SpyObj = jasmine.SpyObj;

fdescribe('PaintAreaComponent', () => {
    const mouseEvent = {} as unknown as MouseEvent;
    let loadBackgroundSpy: jasmine.Spy;
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
        loadBackgroundSpy = spyOn(component, 'loadBackground');
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

        it('canvas should return the foreground canvas.', () => {
            const expected = component.foregroundCanvas.nativeElement;
            expect(component.canvas).toEqual(expected);
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
        let paintCanvasSpy: jasmine.Spy;

        beforeEach(() => {
            component['isDragging'] = true;
            canvasRectangularDragSpy = spyOn(component, 'canvasRectangularDrag');
            paintCanvasSpy = spyOn(component, 'paintCanvas');
        });

        it('should call canvasRectangularDrag if it is in rectangle mode', () => {
            mouseServiceSpy.isRectangleMode = true;
            component.onCanvasDrag(mouseEvent);
            expect(canvasRectangularDragSpy).toHaveBeenCalledTimes(1);
        });

        it('should call paintCanvas if it is not in rectangle mode', () => {
            mouseServiceSpy.isRectangleMode = false;
            component.onCanvasDrag(mouseEvent);
            expect(paintCanvasSpy).toHaveBeenCalledTimes(1);
        });
    });

    describe('loadBackground', () => {
        beforeEach(() => {
            loadBackgroundSpy.and.callThrough();
        });

        it('should set the background canvas to diffImgCanvas', () => {
            const setSpy = spyOnProperty(component['canvasSharing'], 'diffCanvas', 'set');
            const expected = 'diffImgCanvas';
            component.isDiff = true;
            component.loadBackground('');
            expect(component.backgroundCanvas.nativeElement.id).toEqual(expected);
            expect(setSpy).toHaveBeenCalledTimes(1);
        });

        it('should set the background canvas to defaultImgCanvas', () => {
            const setSpy = spyOnProperty(component['canvasSharing'], 'defaultCanvas', 'set');
            const expected = 'defaultImgCanvas';
            component.isDiff = false;
            component.loadBackground('');
            expect(component.backgroundCanvas.nativeElement.id).toEqual(expected);
            expect(setSpy).toHaveBeenCalledTimes(1);
        });

        it('should call drawImage', async () => {
            const drawImageSpy = spyOn(CanvasRenderingContext2D.prototype, 'drawImage');
            const imageSpy = jasmine.createSpyObj('Image', ['onload']);
            spyOn(window, 'Image').and.returnValue(imageSpy);
            component.loadBackground('');
            imageSpy.onload();
            expect(drawImageSpy).toHaveBeenCalledTimes(1);
        });
    });

    // May need to recheck the mock.
    describe('mergeCanvas', () => {
        it('should call drawImage twice', () => {
            const drawImageSpy = spyOn(CanvasRenderingContext2D.prototype, 'drawImage');
            component.mergeCanvas();
            expect(drawImageSpy).toHaveBeenCalledTimes(2);
        });

        it('should return a canvas', () => {
            spyOn(CanvasRenderingContext2D.prototype, 'drawImage');
            const expected = { width: 640, height: 480 };
            const result = component.mergeCanvas();
            expect(result).toBeInstanceOf(HTMLCanvasElement);
            expect(result.width).toEqual(expected.width);
            expect(result.height).toEqual(expected.height);
        });
    });

    describe('createTemporaryCanvas', () => {
        let addEventListenerSpy: jasmine.Spy;

        beforeEach(() => {
            addEventListenerSpy = spyOn(HTMLCanvasElement.prototype, 'addEventListener');
        });

        it('should call paintBrush', () => {
            component.createTemporaryCanvas();
            expect(drawServiceSpy.paintBrush).toHaveBeenCalledTimes(1);
        });

        it('should call setPaintColor', () => {
            component.createTemporaryCanvas();
            expect(drawServiceSpy.setPaintColor).toHaveBeenCalledTimes(1);
        });

        it('should call addEventListener trice', () => {
            component.createTemporaryCanvas();
            expect(addEventListenerSpy).toHaveBeenCalledTimes(3);
            expect(addEventListenerSpy).toHaveBeenCalledWith('mousedown', jasmine.any(Function));
            expect(addEventListenerSpy).toHaveBeenCalledWith('mouseup', jasmine.any(Function));
            expect(addEventListenerSpy).toHaveBeenCalledWith('mousemove', jasmine.any(Function));
        });

        it('should set the temporary canvas with the appropriate attributes', () => {
            component.createTemporaryCanvas();
            expect(component['tempCanvas']).toBeInstanceOf(HTMLCanvasElement);
            expect(component['tempCanvas'].className).toEqual('draw');
            expect(component['tempCanvas'].style.position).toEqual('absolute');
            expect(component['tempCanvas'].style.top).toEqual(component.foregroundCanvas.nativeElement.offsetTop + 'px');
            expect(component['tempCanvas'].style.left).toEqual(component.foregroundCanvas.nativeElement.offsetLeft + 'px');
            expect(component['tempCanvas'].width).toEqual(component.width);
            expect(component['tempCanvas'].height).toEqual(component.height);
        });
    });

    describe('paintCanvas', () => {
        it('should call mouseDrag', () => {
            component.paintCanvas(mouseEvent);
            expect(mouseServiceSpy.mouseDrag).toHaveBeenCalledTimes(1);
        });

        it('should call setPaintColor', () => {
            component.paintCanvas(mouseEvent);
            expect(drawServiceSpy.setPaintColor).toHaveBeenCalledTimes(1);
        });

        it('should call draw', () => {
            component.paintCanvas(mouseEvent);
            expect(drawServiceSpy.draw).toHaveBeenCalledTimes(1);
        });

        it('should call onCanvasRelease if mouse button is not pressed', () => {
            const outsideValue = -1;
            const releaseSpy = spyOn(component, 'onCanvasRelease');
            mouseServiceSpy.getX.and.returnValue(outsideValue);
            mouseServiceSpy.getY.and.returnValue(outsideValue);
            component.paintCanvas(mouseEvent);
            expect(releaseSpy).toHaveBeenCalledTimes(1);
        });
    });

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
    //     const paintSpy = spyOn(component, 'paintCanvas');
    //     component.onCanvasDrag(mouseEvent);
    //     expect(paintSpy).toHaveBeenCalledTimes(1);
    // });

    // it('paintCanvas should paint on the canvas', () => {
    //     const mouseEvent = {
    //         offsetX: 100,
    //         offsetY: 200,
    //         button: 0,
    //     } as MouseEvent;
    //     mouseServiceSpy.getX.and.returnValue(mouseEvent.offsetX);
    //     mouseServiceSpy.getY.and.returnValue(mouseEvent.offsetY);
    //     component.paintCanvas(mouseEvent);
    //     expect(mouseServiceSpy.mouseDrag).toHaveBeenCalledTimes(1);
    //     expect(drawServiceSpy.draw).toHaveBeenCalledTimes(1);
    //     expect(drawServiceSpy.setPaintColor).toHaveBeenCalledTimes(1);
    // });

    // it('paintCanvas should not paint outside of the canvas', () => {
    //     const mouseEvent = {
    //         offsetX: 1000,
    //         offsetY: 2000,
    //         button: 0,
    //     } as MouseEvent;
    //     mouseServiceSpy.getX.and.returnValue(mouseEvent.offsetX);
    //     mouseServiceSpy.getY.and.returnValue(mouseEvent.offsetY);
    //     const releaseSpy = spyOn(component, 'onCanvasRelease');
    //     component.paintCanvas(mouseEvent);
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

    // describe('drawSiblingCanvases', () => {
    //     it('should call drawServiceSpy.drawCanvas', () => {
    //         component.drawSiblingCanvases();
    //         expect(drawServiceSpy.drawCanvas).toHaveBeenCalledTimes(1);
    //     });
    // });
});
