import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { DrawService } from '@app/services/draw.service';
import { MouseService } from '@app/services/mouse.service';
import { Constants } from '@common/constants';
import SpyObj = jasmine.SpyObj;

describe('PlayAreaComponent', () => {
    let component: PlayAreaComponent;
    let fixture: ComponentFixture<PlayAreaComponent>;
    let mouseEvent: MouseEvent;
    let mouseServiceSpy: SpyObj<MouseService>;
    let drawServiceSpy: SpyObj<DrawService>;

    beforeEach(() => {
        mouseServiceSpy = jasmine.createSpyObj('MouseService', [
            'mouseHitDetect',
            'processClick',
            'incrementCounter',
            'getDifferenceCounter',
            'getX',
            'getY',
            'changeClickState',
            'getCanClick',
        ]);
        drawServiceSpy = jasmine.createSpyObj('DrawService', ['drawGrid', 'drawWord', 'drawError', 'drawSuccess', 'drawPlayArea']);
    });

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [PlayAreaComponent],
            imports: [HttpClientModule],
            providers: [
                { provide: MouseService, use: mouseServiceSpy },
                { provide: DrawService, use: drawServiceSpy },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PlayAreaComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    // Thought is was working but no
    it('mouseHitDetect should call mouseHitDetect of mouseService', () => {
        mouseEvent = {
            offsetX: 100,
            offsetY: 200,
            button: 0,
        } as MouseEvent;

        // const fakeGetCanClick = () => {
        //     return true;
        // };

        // mouseServiceSpy.getCanClick.and.callFake(fakeGetCanClick);
        // mouseServiceSpy.getCanClick.and.returnValue(true);
        // spyOn(component, 'drawPlayArea');

        component.mouseHitDetect(mouseEvent);
        if (component.getServiceCanPlay()) {
            expect(component.getServiceCanPlay()).toBeTruthy();
        } else {
            expect(component.getServiceCanPlay()).toBeTruthy();
        }

        // component.mouseHitDetect(mouseEvent);
        // // eslint-disable-next-line no-console
        // console.log(typeof mouseServiceSpy.getCanClick);
        // expect(mouseServiceSpy.getCanClick).toBeDefined();
        // expect(mouseServiceSpy.getCanClick).toHaveBeenCalledTimes(1);
    });

    it('mouseHitDetect should not call mouseHitDetect from mouse service if we cannot click', () => {
        mouseEvent = {
            offsetX: 100,
            offsetY: 200,
            button: 0,
        } as MouseEvent;

        const fakeGetCanClick = () => {
            return false;
        };

        spyOn(component, 'drawPlayArea');

        mouseServiceSpy.getCanClick.and.callFake(fakeGetCanClick);

        component.mouseHitDetect(mouseEvent);
        expect(mouseServiceSpy.mouseHitDetect).not.toHaveBeenCalled();
    });

    // Working on it
    it('mouseHitDetect should call drawSuccess if we clicked on a difference.', () => {
        mouseEvent = {
            offsetX: 100,
            offsetY: 200,
            button: 0,
        } as MouseEvent;

        const fakeMouseHitDetect = () => {
            return true;
        };

        const fakeGetCanClick = () => {
            return true;
        };

        mouseServiceSpy.getCanClick.and.callFake(fakeGetCanClick);
        mouseServiceSpy.mouseHitDetect.and.callFake(fakeMouseHitDetect);
        spyOn(component, 'drawPlayArea');

        component.mouseHitDetect(mouseEvent);
        expect(drawServiceSpy.drawSuccess).toHaveBeenCalled();
    });

    it('clicking on a pixel that is not a difference should call changeClickState of mouseService', fakeAsync(() => {
        mouseEvent = {
            offsetX: 100,
            offsetY: 200,
            button: 0,
        } as MouseEvent;
        const mouseService = TestBed.inject(MouseService);

        const fakeMouseHitDetect = () => {
            return false;
        };
        const fakeChangeClickState = () => {
            // Do nothing
        };
        const fakeDrawPlayArea = () => {
            // Do nothing
        };

        spyOn(mouseService, 'mouseHitDetect').and.callFake(fakeMouseHitDetect);
        const spy = spyOn(mouseService, 'changeClickState').and.callFake(fakeChangeClickState);
        spyOn(component, 'drawPlayArea').and.callFake(fakeDrawPlayArea);

        component.mouseHitDetect(mouseEvent);
        tick(Constants.millisecondsInOneSecond);
        expect(spy).toHaveBeenCalledTimes(2);
    }));

    it('buttonDetect should modify the buttonPressed variable', () => {
        const expectedKey = 'a';
        const buttonEvent = {
            key: expectedKey,
        } as KeyboardEvent;
        component.buttonDetect(buttonEvent);
        expect(component.buttonPressed).toEqual(expectedKey);
    });
});
