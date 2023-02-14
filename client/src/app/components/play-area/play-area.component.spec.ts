import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { DrawService } from '@app/services/draw.service';
import { MouseService } from '@app/services/mouse.service';
import SpyObj = jasmine.SpyObj;

describe('PlayAreaComponent', () => {
    let mouseServiceSpy: SpyObj<MouseService>;
    let drawServiceSpy: SpyObj<DrawService>;
    let component: PlayAreaComponent;
    let fixture: ComponentFixture<PlayAreaComponent>;
    // const mouseEvent = {
    //     offsetX: 100,
    //     offsetY: 200,
    //     button: 0,
    // } as MouseEvent;

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

    // it('mouseHitDetect should call mouseHitDetect of mouseService', () => {
    //     mouseServiceSpy.getCanClick.and.returnValue(true);
    //     spyOn(component, 'drawPlayArea');

    //     component.mouseHitDetect(mouseEvent, []);
    //     expect(mouseServiceSpy.mouseHitDetect).toHaveBeenCalledTimes(1);
    // });

    // it('mouseHitDetect should not call mouseHitDetect from mouse service if we cannot click', () => {
    //     spyOn(component, 'drawPlayArea');

    //     mouseServiceSpy.getCanClick.and.returnValue(false);

    //     component.mouseHitDetect(mouseEvent);
    //     expect(mouseServiceSpy.mouseHitDetect).not.toHaveBeenCalled();
    // });

    // it('mouseHitDetect should call drawSuccess if we clicked on a difference.', () => {
    //     mouseServiceSpy.getCanClick.and.returnValue(true);
    //     mouseServiceSpy.mouseHitDetect.and.returnValue(true);
    //     spyOn(component, 'drawPlayArea');

    //     component.mouseHitDetect(mouseEvent);
    //     expect(drawServiceSpy.drawSuccess).toHaveBeenCalledTimes(1);
    // });

    // it('mouseHitDetect should call drawError if we did not click on a difference', () => {
    //     mouseServiceSpy.getCanClick.and.returnValue(true);
    //     mouseServiceSpy.mouseHitDetect.and.returnValue(false);
    //     spyOn(component, 'drawPlayArea');

    //     component.mouseHitDetect(mouseEvent);
    //     expect(drawServiceSpy.drawError).toHaveBeenCalledTimes(1);
    // });

    // it('clicking on a pixel that is not a difference should call changeClickState of mouseService', fakeAsync(() => {
    //     mouseServiceSpy.getCanClick.and.returnValue(true);
    //     mouseServiceSpy.mouseHitDetect.and.returnValue(false);

    //     component.mouseHitDetect(mouseEvent);
    //     tick(Constants.millisecondsInOneSecond);
    //     expect(mouseServiceSpy.changeClickState).toHaveBeenCalledTimes(2);
    // }));

    // it('Clicking on a difference should call draw play area after a one second delay', fakeAsync(() => {
    //     mouseServiceSpy.getCanClick.and.returnValue(true);
    //     mouseServiceSpy.mouseHitDetect.and.returnValue(true);
    //     const spy = spyOn(component, 'drawPlayArea');

    //     component.mouseHitDetect(mouseEvent);
    //     expect(spy).not.toHaveBeenCalled();
    //     tick(Constants.millisecondsInOneSecond);
    //     expect(spy).toHaveBeenCalledTimes(1);
    // }));

    // it('Clicking on a pixel that is not a difference should call draw play area after a one second delay', fakeAsync(() => {
    //     mouseServiceSpy.getCanClick.and.returnValue(true);
    //     mouseServiceSpy.mouseHitDetect.and.returnValue(false);
    //     const spy = spyOn(component, 'drawPlayArea');

    //     component.mouseHitDetect(mouseEvent);
    //     expect(spy).not.toHaveBeenCalled();
    //     tick(Constants.millisecondsInOneSecond);
    //     expect(spy).toHaveBeenCalledTimes(1);
    // }));

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
});
