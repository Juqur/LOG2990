/* eslint-disable max-lines */
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaintAreaComponent } from '@app/components/paint-area/paint-area.component';
import { DrawService } from '@app/services/draw/draw.service';
import { MouseService } from '@app/services/mouse/mouse.service';
import SpyObj = jasmine.SpyObj;

describe('PaintAreaComponent', () => {
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
            expect(component['isShiftPressed']).toBeTrue();
        });
    });

    describe('buttonRelease', () => {
        it('should detect when shift is released', () => {
            const buttonEvent = {
                key: 'Shift',
            } as KeyboardEvent;
            component.buttonRelease(buttonEvent);
            expect(component['isShiftPressed']).toBeFalse();
        });
    });

    describe('ngAfterViewInit', () => {
        let addEventListenerSpy: jasmine.Spy;

        beforeEach(() => {
            loadBackgroundSpy.calls.reset();
            addEventListenerSpy = spyOn(HTMLCanvasElement.prototype, 'addEventListener');
        });

        it('should call loadBackground', () => {
            component.ngAfterViewInit();
            expect(loadBackgroundSpy).toHaveBeenCalledTimes(1);
        });

        it('should call addEventListenerSpy trice', () => {
            component.ngAfterViewInit();
            expect(addEventListenerSpy).toHaveBeenCalledTimes(3);
        });

        it('should set foregroundCanvas id to diffDrawCanvas', () => {
            component.isDiff = true;
            component.ngAfterViewInit();
            expect(component.foregroundCanvas.nativeElement.id).toEqual('diffDrawCanvas');
        });

        it('should set defaultDrawCanvas id to diffDrawCanvas', () => {
            component.isDiff = false;
            component.ngAfterViewInit();
            expect(component.foregroundCanvas.nativeElement.id).toEqual('defaultDrawCanvas');
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
            expect(component['isDragging']).toBeFalse();
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

    describe('canvasRectangularDrag', () => {
        beforeEach(() => {
            component['tempCanvas'] = document.createElement('canvas');
        });

        it('should call mouseDrag', () => {
            component.canvasRectangularDrag(mouseEvent);
            expect(mouseServiceSpy.mouseDrag).toHaveBeenCalledTimes(1);
        });

        it('should call onCanvasRelease if mouse button is not pressed', () => {
            const outsideValue = -1;
            const releaseSpy = spyOn(component, 'onCanvasRelease');
            mouseServiceSpy.getX.and.returnValue(outsideValue);
            mouseServiceSpy.getY.and.returnValue(outsideValue);
            component.canvasRectangularDrag(mouseEvent);
            expect(releaseSpy).toHaveBeenCalledTimes(1);
        });

        it('should correctly call drawRect if shift x < y', () => {
            const { x, y } = { x: 100, y: 120 };
            mouseServiceSpy.getX.and.returnValue(x);
            mouseServiceSpy.getY.and.returnValue(y);
            component['isShiftPressed'] = true;
            component.canvasRectangularDrag(mouseEvent);
            expect(drawServiceSpy.drawRect).toHaveBeenCalledTimes(1);
        });

        it('should correctly call drawRect if shift x > y', () => {
            const { x, y } = { x: 120, y: 100 };
            mouseServiceSpy.getX.and.returnValue(x);
            mouseServiceSpy.getY.and.returnValue(y);
            component['isShiftPressed'] = true;
            component.canvasRectangularDrag(mouseEvent);
            expect(drawServiceSpy.drawRect).toHaveBeenCalledTimes(1);
        });

        it('should call drawRect if shift is not pressed', () => {
            component['isShiftPressed'] = false;
            component.canvasRectangularDrag(mouseEvent);
            expect(drawServiceSpy.drawRect).toHaveBeenCalledTimes(1);
        });
    });

    describe('drawSiblingCanvases', () => {
        const siblingCanvases = [document.createElement('canvas'), document.createElement('canvas')] as unknown as NodeListOf<HTMLCanvasElement>;
        let drawImageSpy: jasmine.Spy;
        let removeSpy: jasmine.Spy;

        beforeEach(() => {
            drawImageSpy = spyOn(CanvasRenderingContext2D.prototype, 'drawImage');
            removeSpy = spyOn(HTMLCanvasElement.prototype, 'remove');
        });

        it('should call drawImage', () => {
            component['drawSiblingCanvases'](siblingCanvases);
            expect(drawImageSpy).toHaveBeenCalledTimes(2);
        });

        it('should call remove', () => {
            component['drawSiblingCanvases'](siblingCanvases);
            expect(removeSpy).toHaveBeenCalledTimes(2);
        });
    });
});
