import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, fakeAsync, TestBed, waitForAsync } from '@angular/core/testing';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { DrawService } from '@app/services/draw/draw.service';
import { Constants } from '@common/constants';
import { environment } from 'src/environments/environment';
import SpyObj = jasmine.SpyObj;

describe('PlayAreaComponent', () => {
    let drawServiceSpy: SpyObj<DrawService>;
    let component: PlayAreaComponent;
    let fixture: ComponentFixture<PlayAreaComponent>;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawService', ['drawError', 'drawSuccess', 'drawPlayArea']);
    });

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [PlayAreaComponent],
            imports: [HttpClientTestingModule],
        })
            .overrideProvider(DrawService, { useValue: drawServiceSpy })
            .compileComponents();
    }));

    beforeEach(() => {
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

    it('buttonDetect should modify the buttonPressed variable', () => {
        const expectedKey = 'a';
        const buttonEvent = {
            key: expectedKey,
        } as KeyboardEvent;
        component.buttonDetect(buttonEvent);
        expect(component.buttonPressed).toEqual(expectedKey);
    });

    it('getCanvas should return the canvas element', () => {
        const canvas = component.getCanvas();
        expect(canvas).toEqual(component.canvas);
    });

    it('drawPlayArea should call context.drawImage', fakeAsync(() => {
        const drawImageSpy = spyOn(CanvasRenderingContext2D.prototype, 'drawImage');
        component.drawPlayArea(environment.serverUrl + 'original/1.bmp');
        component.currentImage.dispatchEvent(new Event('load'));

        expect(drawImageSpy).toHaveBeenCalledTimes(1);
    }));

    it('drawPlayArea should call the difference canvas when isDifferenceCanvas is true', fakeAsync(() => {
        const drawImageSpy = spyOn(CanvasRenderingContext2D.prototype, 'drawImage');
        component.isDifferenceCanvas = true;
        component.drawPlayArea(environment.serverUrl + 'originals/1.bmp');
        component.currentImage.dispatchEvent(new Event('load'));

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
        expect(component['tempCanvas'].width).toEqual(component.canvas.nativeElement.width);
        expect(component['tempCanvas'].height).toEqual(component.canvas.nativeElement.height);
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

    it('getFlashingCopy should call drawImage', () => {
        const drawImageSpy = spyOn(CanvasRenderingContext2D.prototype, 'drawImage');
        component.getFlashingCopy();
        expect(drawImageSpy).toHaveBeenCalledTimes(2);
    });

    it('setContext should clearRect and drawImage', () => {
        const clearRectSpy = spyOn(CanvasRenderingContext2D.prototype, 'clearRect');
        const drawImageSpy = spyOn(CanvasRenderingContext2D.prototype, 'drawImage');
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d') as CanvasRenderingContext2D;
        component.setContext(context);
        expect(clearRectSpy).toHaveBeenCalledTimes(1);
        expect(drawImageSpy).toHaveBeenCalledTimes(1);
    });

    it('getCanvasRenderingContext2D should return the context of the canvas', () => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d') as CanvasRenderingContext2D;
        component.canvas.nativeElement = canvas;
        const context2 = component.getCanvasRenderingContext2D();
        expect(context).toEqual(context2);
    });
});
