import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Vec2 } from '@app/interfaces/vec2';
import { DrawService } from '@app/services/drawService/draw.service';

describe('DrawService', () => {
    let service: DrawService;
    let ctxStub: CanvasRenderingContext2D;

    const CANVAS_WIDTH = 640;
    const CANVAS_HEIGHT = 480;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(DrawService);
        ctxStub = CanvasTestHelper.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT).getContext('2d', {
            willReadFrequently: true,
        }) as CanvasRenderingContext2D;
        service.context = ctxStub;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('width should return the width of the grid canvas', () => {
        expect(service.width).toEqual(CANVAS_WIDTH);
    });

    it('height should return the height of the grid canvas', () => {
        expect(service.height).toEqual(CANVAS_HEIGHT);
    });

    it('drawError should have red text', () => {
        service.drawError({ x: 1, y: 1 } as Vec2);
        expect(service.context.fillStyle.toString()).toEqual('#ff0000');
    });
});
