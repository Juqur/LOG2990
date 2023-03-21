import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Vec2 } from '@app/interfaces/vec2';
import { DrawService } from '@app/services/drawService/draw.service';
import { Constants } from '@common/constants';

describe('DrawService', () => {
    let service: DrawService;
    let ctxStub: CanvasRenderingContext2D;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(DrawService);
        ctxStub = CanvasTestHelper.createCanvas(Constants.DEFAULT_WIDTH, Constants.DEFAULT_HEIGHT).getContext('2d', {
            willReadFrequently: true,
        }) as CanvasRenderingContext2D;
        service.context = ctxStub;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('width should return the width of the grid canvas', () => {
        expect(service.width).toEqual(Constants.DEFAULT_WIDTH);
    });

    it('height should return the height of the grid canvas', () => {
        expect(service.height).toEqual(Constants.DEFAULT_HEIGHT);
    });

    it('drawError should have red text', () => {
        service.drawError({ x: 1, y: 1 } as Vec2);
        expect(service.context.fillStyle.toString()).toEqual('#ff0000');
    });

    it('setPaintColor should set the color of the context', () => {
        service.setPaintColor('#000000');
        expect(service.context.strokeStyle).toEqual('#000000');
        expect(service.context.fillStyle).toEqual('#000000');
    });

    it('setBrushSize should set the brush size of the context', () => {
        service.setBrushSize(Constants.ten);
        expect(service.context.lineWidth).toEqual(Constants.ten);
    });

    it('paintBrush should set attributes for a brush', () => {
        service.paintBrush();
        expect(service.context.lineCap).toEqual('round');
        expect(service.context.globalCompositeOperation).toEqual('source-over');
    });

    it('eraseBrush should set attributes for an eraser', () => {
        service.eraseBrush();
        expect(service.context.lineCap).toEqual('square');
        expect(service.context.globalCompositeOperation).toEqual('destination-out');
    });

    it('draw should call the correct method when cursor in the canvas', () => {
        const beginPathSpy = spyOn(service.context, 'beginPath');
        const moveToSpy = spyOn(service.context, 'moveTo');
        const lineToSpy = spyOn(service.context, 'lineTo');
        const strokeSpy = spyOn(service.context, 'stroke');
        service.draw({ x: 1, y: 1 } as Vec2, { x: 2, y: 2 } as Vec2);
        expect(beginPathSpy).toHaveBeenCalled();
        expect(moveToSpy).toHaveBeenCalled();
        expect(lineToSpy).toHaveBeenCalled();
        expect(strokeSpy).toHaveBeenCalled();
    });

    it('draw should not call the correct method when cursor not in the canvas', () => {
        const beginPathSpy = spyOn(service.context, 'beginPath');
        const moveToSpy = spyOn(service.context, 'moveTo');
        const lineToSpy = spyOn(service.context, 'lineTo');
        const strokeSpy = spyOn(service.context, 'stroke');
        service.draw({ x: 1, y: 1 } as Vec2);
        expect(beginPathSpy).toHaveBeenCalled();
        expect(moveToSpy).toHaveBeenCalled();
        expect(lineToSpy).toHaveBeenCalled();
        expect(strokeSpy).toHaveBeenCalled();
    });

    it('drawRect should call the correct method', () => {
        const beginPathSpy = spyOn(service.context, 'beginPath');
        const rectSpy = spyOn(service.context, 'rect');
        const fillSpy = spyOn(service.context, 'fill');
        const strokeSpy = spyOn(service.context, 'stroke');
        service.drawRect({ x: 1, y: 1 } as Vec2, 1, 1);
        expect(beginPathSpy).toHaveBeenCalledTimes(1);
        expect(rectSpy).toHaveBeenCalledTimes(1);
        expect(fillSpy).toHaveBeenCalledTimes(1);
        expect(strokeSpy).toHaveBeenCalledTimes(1);
    });

    it('contextToUse should set the context to the correct value', () => {
        const context = CanvasTestHelper.createCanvas(Constants.DEFAULT_WIDTH, Constants.DEFAULT_HEIGHT).getContext('2d', {
            willReadFrequently: true,
        }) as CanvasRenderingContext2D;
        service.contextToUse = context;
        expect(service.context).toEqual(context);
    });
});
