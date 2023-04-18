import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { CanvasSharingService } from '@app/services/canvas-sharing/canvas-sharing.service';
import { DrawService } from '@app/services/draw/draw.service';
import { Constants } from '@common/constants';
import SpyObj = jasmine.SpyObj;

describe('PlayAreaComponent', () => {
    let component: PlayAreaComponent;
    let fixture: ComponentFixture<PlayAreaComponent>;

    let canvasSharingServiceSpy: SpyObj<CanvasSharingService>;
    let drawServiceSpy: SpyObj<DrawService>;

    beforeEach(async () => {
        drawServiceSpy = jasmine.createSpyObj('DrawService', ['drawError', 'drawSuccess', 'drawPlayArea']);
        canvasSharingServiceSpy = jasmine.createSpyObj('CanvasSharingService', ['getCanvas', 'setCanvas']);

        TestBed.configureTestingModule({
            declarations: [PlayAreaComponent],
            imports: [HttpClientModule],
            providers: [
                { provide: DrawService, useValue: drawServiceSpy },
                { provide: CanvasSharingService, useValue: canvasSharingServiceSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(PlayAreaComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('ngAfterViewInit should call drawPlayArea', () => {
        const spy = spyOn(component, 'drawPlayArea');
        component.ngAfterViewInit();
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('getCanvas should return the canvas element', () => {
        const canvas = component.getCanvas();
        expect(canvas).toEqual(component['canvas']);
    });

    it('drawPlayArea should call context.drawImage', fakeAsync(() => {
        const drawImageSpy = spyOn(CanvasRenderingContext2D.prototype, 'drawImage');
        component.drawPlayArea('');
        component['currentImage'].dispatchEvent(new Event('load'));

        expect(drawImageSpy).toHaveBeenCalledTimes(1);
    }));

    it('drawPlayArea should call the diff canvas when isDifferenceCanvas is true', fakeAsync(() => {
        const drawImageSpy = spyOn(CanvasRenderingContext2D.prototype, 'drawImage');
        component.isDifferenceCanvas = true;
        component.drawPlayArea('');
        component['currentImage'].dispatchEvent(new Event('load'));

        expect(drawImageSpy).toHaveBeenCalledTimes(1);
    }));

    it('flashArea should call fillRect', () => {
        const fillRectSpy = spyOn(CanvasRenderingContext2D.prototype, 'fillRect');
        spyOn(component, 'createTempCanvas').and.callFake(() => {
            component['tempCanvas'] = document.createElement('canvas');
        });
        const area = [0, 1, 2, 3];
        component.flashArea(area);
        expect(fillRectSpy).toHaveBeenCalledTimes(area.length);
    });

    it('flashArea should call deleteTempCanvas if tempCanvas is defined', () => {
        spyOn(CanvasRenderingContext2D.prototype, 'fillRect');
        spyOn(component, 'createTempCanvas');
        component['tempCanvas'] = document.createElement('canvas');
        const deleteTempCanvasSpy = spyOn(component, 'deleteTempCanvas').and.callThrough();
        const area = [0, 1, 2, 3];
        component.flashArea(area);
        expect(deleteTempCanvasSpy).toHaveBeenCalledTimes(1);
    });

    it('createTempCanvas should create a new canvas with the right properties', () => {
        component.createTempCanvas();
        expect(component['tempCanvas']).toBeDefined();
        expect(component['tempCanvas'].width).toEqual(component['canvas'].nativeElement.width);
        expect(component['tempCanvas'].height).toEqual(component['canvas'].nativeElement.height);
        expect(component['tempCanvas'].style.position).toEqual('absolute');
        expect(component['tempCanvas'].style.pointerEvents).toEqual('none');
    });

    it('deleteTempCanvas should delete tempCanvas if it is defined', () => {
        const removeSpy = spyOn(HTMLCanvasElement.prototype, 'remove');
        component['tempCanvas'] = document.createElement('canvas');
        component.deleteTempCanvas();
        expect(removeSpy).toHaveBeenCalledTimes(1);
    });

    it('timeout should call setTimeout', () => {
        const timeoutSpy = spyOn(window, 'setTimeout');
        component.timeout(Constants.millisecondsInOneSecond);
        expect(timeoutSpy).toHaveBeenCalledTimes(1);
    });

    it('should call drawPlayArea when the image changes', () => {
        const spy = spyOn(component, 'drawPlayArea');
        component.ngOnChanges();
        expect(spy).toHaveBeenCalledTimes(1);
    });
    it('showHintSection should call rect', () => {
        const rectSpy = spyOn(CanvasRenderingContext2D.prototype, 'rect');
        spyOn(component, 'createTempCanvas').and.callFake(() => {
            component['tempCanvas'] = document.createElement('canvas');
        });
        const quadrantsNumbers = { quadrant: 4, subQuadrant: 4 };
        const quadrants = [quadrantsNumbers.quadrant, quadrantsNumbers.subQuadrant];
        component.showHintSection(quadrants);
        expect(rectSpy).toHaveBeenCalledTimes(1);
    });

    it('showHintSection should call deleteTempCanvas if tempCanvas is defined', () => {
        spyOn(CanvasRenderingContext2D.prototype, 'rect');
        spyOn(component, 'createTempCanvas');
        component['tempCanvas'] = document.createElement('canvas');
        const deleteTempCanvasSpy = spyOn(component, 'deleteTempCanvas');
        const quadrants = [1];
        component.showHintSection(quadrants);
        expect(deleteTempCanvasSpy).toHaveBeenCalledTimes(1);
    });
});
