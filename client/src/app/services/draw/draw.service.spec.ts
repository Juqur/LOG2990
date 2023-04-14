import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Vec2 } from '@app/interfaces/vec2';
import { DrawService } from '@app/services/draw/draw.service';
import { Constants } from '@common/constants';

describe('DrawService', () => {
    let service: DrawService;
    let ctxStub: CanvasRenderingContext2D;

    let beginPathSpy: jasmine.Spy;
    let moveToSpy: jasmine.Spy;
    let lineToSpy: jasmine.Spy;
    let strokeSpy: jasmine.Spy;
    let rectSpy: jasmine.Spy;
    let fillSpy: jasmine.Spy;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(DrawService);
        ctxStub = CanvasTestHelper.createCanvas(Constants.DEFAULT_WIDTH, Constants.DEFAULT_HEIGHT).getContext('2d', {
            willReadFrequently: true,
        }) as CanvasRenderingContext2D;
        service.context = ctxStub;

        beginPathSpy = spyOn(service.context, 'beginPath');
        moveToSpy = spyOn(service.context, 'moveTo');
        lineToSpy = spyOn(service.context, 'lineTo');
        strokeSpy = spyOn(service.context, 'stroke');
        rectSpy = spyOn(service.context, 'rect');
        fillSpy = spyOn(service.context, 'fill');
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('getters', () => {
        it('width should return the width of the grid canvas', () => {
            expect(service.width).toEqual(Constants.DEFAULT_WIDTH);
        });

        it('height should return the height of the grid canvas', () => {
            expect(service.height).toEqual(Constants.DEFAULT_HEIGHT);
        });
    });

    describe('setters', () => {
        it('contextToUse should set the appropriate context', () => {
            service.contextToUse = ctxStub;
            expect(service.context).toEqual(ctxStub);
        });
    });

    describe('setPaintColor', () => {
        it('should set the color of the context', () => {
            service.setPaintColor('#000000');
            expect(service['paintColor']).toEqual('#000000');
            expect(service.context.strokeStyle).toEqual('#000000');
            expect(service.context.fillStyle).toEqual('#000000');
        });
    });

    describe('setBrushSize', () => {
        it('should set the brush size of the context', () => {
            const expected = 10;
            service.setBrushSize(expected);
            expect(service.context.lineWidth).toEqual(expected);
        });
    });

    describe('paintBrush', () => {
        it('should set the attributes of the brush', () => {
            service.paintBrush();
            expect(service.context.lineCap).toEqual('round');
            expect(service.context.globalCompositeOperation).toEqual('source-over');
        });
    });

    describe('eraseBrush', () => {
        it('should set attributes for an eraser', () => {
            service.eraseBrush();
            expect(service.context.lineCap).toEqual('square');
            expect(service.context.globalCompositeOperation).toEqual('destination-out');
        });
    });

    describe('drawError', () => {
        it('should have red text', () => {
            service.drawError({ x: 1, y: 1 } as Vec2);
            expect(service.context.fillStyle.toString()).toEqual('#ff0000');
        });
    });

    describe('draw', () => {
        beforeEach(() => {
            service.isInCanvas = true;
        });

        it('should call beginPath', () => {
            service.draw({ x: 1, y: 1 } as Vec2);
            expect(beginPathSpy).toHaveBeenCalledTimes(1);
        });

        it('should call moveTo', () => {
            const expected = { x: 1, y: 1 } as Vec2;
            service.draw(expected);
            expect(moveToSpy).toHaveBeenCalledOnceWith(expected.x, expected.y);
        });

        it('should call lineTo if the active coordinates are default', () => {
            const expected = { x: 1, y: 1 } as Vec2;
            service.draw(expected);
            expect(lineToSpy).toHaveBeenCalledOnceWith(expected.x + 1, expected.y);
        });

        it('should call stroke', () => {
            const coordinates = { x: 1, y: 1 } as Vec2;
            service.draw(coordinates);
            expect(strokeSpy).toHaveBeenCalledTimes(1);
        });

        it('should call lineTo if the active coordinates are not default', () => {
            const coordinates = { x: 1, y: 1 } as Vec2;
            const expected = { x: 2, y: 2 } as Vec2;
            service.draw(coordinates, expected);
            expect(lineToSpy).toHaveBeenCalledWith(expected.x, expected.y);
        });

        it('should call moveTo if the active coordinates are not default', () => {
            const coordinates = { x: 1, y: 1 } as Vec2;
            const expected = { x: 2, y: 2 } as Vec2;
            service.isInCanvas = false;
            service.draw(coordinates, expected);
            expect(moveToSpy).toHaveBeenCalledWith(expected.x, expected.y);
        });

        it('should call moveTo if the active coordinates are not default', () => {
            const coordinates = { x: 1, y: 1 } as Vec2;
            const expected = { x: 2, y: 2 } as Vec2;
            service.isInCanvas = false;
            service.draw(coordinates, expected);
            expect(service.isInCanvas).toBeTrue();
        });
    });

    describe('drawRect', () => {
        it('should call beginPath', () => {
            service.drawRect({ x: 1, y: 1 } as Vec2, 1, 1);
            expect(beginPathSpy).toHaveBeenCalledTimes(1);
        });

        it('should call rect', () => {
            const expected = { x: 1, y: 1 } as Vec2;
            service.drawRect(expected, 1, 1);
            expect(rectSpy).toHaveBeenCalledOnceWith(expected.x, expected.y, 1, 1);
        });

        it('should call fill', () => {
            service.drawRect({ x: 1, y: 1 } as Vec2, 1, 1);
            expect(fillSpy).toHaveBeenCalledTimes(1);
        });

        it('should call stroke', () => {
            service.drawRect({ x: 1, y: 1 } as Vec2, 1, 1);
            expect(strokeSpy).toHaveBeenCalledTimes(1);
        });
    });
});
