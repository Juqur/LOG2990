import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, fakeAsync, TestBed, waitForAsync } from '@angular/core/testing';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { DrawService } from '@app/services/draw.service';
import { MouseService } from '@app/services/mouse.service';
import { Constants } from '@common/constants';
import SpyObj = jasmine.SpyObj;

describe('PlayAreaComponent', () => {
    let mouseServiceSpy: SpyObj<MouseService>;
    let drawServiceSpy: SpyObj<DrawService>;
    let component: PlayAreaComponent;
    let fixture: ComponentFixture<PlayAreaComponent>;

    beforeEach(() => {
        mouseServiceSpy = jasmine.createSpyObj('MouseService', ['mouseHitDetect', 'getCanClick', 'getX', 'getY', 'changeClickState']);
        drawServiceSpy = jasmine.createSpyObj('DrawService', ['drawError', 'drawSuccess', 'drawPlayArea']);
    });

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [PlayAreaComponent],
            imports: [HttpClientModule],
            providers: [{ provide: MouseService, useValue: mouseServiceSpy }],
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

    it('getCanvas should return the canvas element', () => {
        const canvas = component.getCanvas();
        expect(canvas).toEqual(component.canvas);
    });

    it('drawPlayArea should call context.drawImage', fakeAsync(() => {
        const drawImageSpy = spyOn(CanvasRenderingContext2D.prototype, 'drawImage');
        component.drawPlayArea('http://localhost:3000/originals/1.bmp');

        expect(drawImageSpy).toHaveBeenCalledTimes(1);
    }));

    it('should call fillRect', () => {
        const fillRectSpy = spyOn(CanvasRenderingContext2D.prototype, 'fillRect').and.callThrough();
        const area = [0, 1, 2, 3];
        component.flashArea(area);
        expect(fillRectSpy).toHaveBeenCalledTimes(area.length);
    });

    it('should not call fillRect if there is no canvas', () => {
        spyOn(component.canvas.nativeElement, 'getContext').and.returnValue(null);

        const fillRectSpy = spyOn(CanvasRenderingContext2D.prototype, 'fillRect').and.callThrough();
        const area = [0, 1, 2, 3];
        component.flashArea(area);
        expect(fillRectSpy).not.toHaveBeenCalled();
    });

    it('timeout should call setTimeout', () => {
        const timeoutSpy = spyOn(window, 'setTimeout');
        component.timeout(Constants.millisecondsInOneSecond);
        expect(timeoutSpy).toHaveBeenCalledTimes(1);
    });
});
