import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ChatMessageComponent } from '@app/components/chat-message/chat-message.component';
import { CounterComponent } from '@app/components/counter/counter.component';
import { GameChatComponent } from '@app/components/game-chat/game-chat.component';
import { GameTimerComponent } from '@app/components/game-timer/game-timer.component';
import { MessageBoxComponent } from '@app/components/message-box/message-box.component';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { ScaleContainerComponent } from '@app/components/scale-container/scale-container.component';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { AppMaterialModule } from '@app/modules/material.module';
// import { CommunicationService } from '@app/services/communication.service';
// import { DrawService } from '@app/services/draw.service';
import { MouseService } from '@app/services/mouse.service';
import { Subject } from 'rxjs';
import { GamePageComponent } from './game-page.component';
import SpyObj = jasmine.SpyObj;

describe('GamePageComponent', () => {
    let component: GamePageComponent;
    let fixture: ComponentFixture<GamePageComponent>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let subject: Subject<any>;
    let mouseServiceSpy: SpyObj<MouseService>;
    let playAreaComponentSpy: SpyObj<PlayAreaComponent>;

    const mouseEvent = {
        offsetX: 100,
        offsetY: 200,
        button: 0,
    } as MouseEvent;

    beforeEach(async () => {
        mouseServiceSpy = jasmine.createSpyObj('MouseService', ['mouseHitDetect', 'getCanClick', 'getX', 'getY', 'changeClickState']);
        playAreaComponentSpy = jasmine.createSpyObj('PlayAreaComponent', ['getCanvas', 'drawPlayArea', 'flashArea', 'timeout']);
        subject = new Subject();

        await TestBed.configureTestingModule({
            declarations: [
                GamePageComponent,
                SidebarComponent,
                PlayAreaComponent,
                GameTimerComponent,
                ScaleContainerComponent,
                GameChatComponent,
                CounterComponent,
                ChatMessageComponent,
                MessageBoxComponent,
            ],
            imports: [AppMaterialModule, HttpClientModule, RouterTestingModule],
            providers: [
                { provide: ActivatedRoute, useValue: { params: subject.asObservable(), queryParams: subject.asObservable() } },
                { provide: MouseService, useValue: mouseServiceSpy },
                { provide: PlayAreaComponent, useValue: playAreaComponentSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(GamePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    // it('ngOnInit should set the levelId', (done) => {
    //     const levelId = 1;
    //     subject.next(levelId);
    //     subject.subscribe((val) => {
    //         expect(val).toBe(levelId);
    //         done();
    //     });


    // });

    // it('ngOnInit should set the playerName', (done) => {
    //     const playerName = 'John Doe';
    //     subject.next(playerName);
    //     subject.subscribe((val) => {
    //         expect(val).toBe(playerName);
    //         done();
    //     });
    // });

    it('should call handleAreaFoundInOriginal if difference is found in original', fakeAsync(() => {
        mouseServiceSpy.getCanClick.and.returnValue(true);
        mouseServiceSpy.mouseHitDetect.and.returnValue(Promise.resolve([1]));
        let spy = spyOn(component, 'handleAreaFoundInOriginal');
        component.clickedOnOriginal(mouseEvent);
        tick();
        expect(spy).toHaveBeenCalledTimes(1);
    }));

    it('should call handleAreaNotFoundInOriginal if difference is not found in original', fakeAsync(() => {
        mouseServiceSpy.getCanClick.and.returnValue(true);
        mouseServiceSpy.mouseHitDetect.and.returnValue(Promise.resolve([]));
        let spy = spyOn(component, 'handleAreaNotFoundInOriginal');
        component.clickedOnOriginal(mouseEvent);
        tick();
        expect(spy).toHaveBeenCalledTimes(1);
    }));

    it('should call handleAreaFoundInDiff if difference is found in diff', fakeAsync(() => {
        mouseServiceSpy.getCanClick.and.returnValue(true);
        mouseServiceSpy.mouseHitDetect.and.returnValue(Promise.resolve([1]));
        let spy = spyOn(component, 'handleAreaFoundInDiff');
        component.clickedOnDiff(mouseEvent);
        tick();
        expect(spy).toHaveBeenCalledTimes(1);
    }));

    it('should call handleAreaFoundInDiff if difference is not found in diff', fakeAsync(() => {
        mouseServiceSpy.getCanClick.and.returnValue(true);
        mouseServiceSpy.mouseHitDetect.and.returnValue(Promise.resolve([]));
        let spy = spyOn(component, 'handleAreaNotFoundInDiff');
        component.clickedOnDiff(mouseEvent);
        tick();
        expect(spy).toHaveBeenCalledTimes(1);
    }));

    it('handleAreaFoundInDiff should call multiple functions', () => {
        const result = [1, 2, 3];
        const spyFlashAreaOriginal = spyOn(component.originalPlayArea, 'flashArea');
        const spyFlashAreaDiff = spyOn(component.diffPlayArea, 'flashArea');
        component.handleAreaFoundInDiff(result);
        expect(component.imagesData).toEqual(result);
        expect(component.foundADifference).toBe(true);
        expect(mouseServiceSpy.changeClickState).toHaveBeenCalledTimes(1);
        expect(spyFlashAreaOriginal).toHaveBeenCalledTimes(1);
        expect(spyFlashAreaDiff).toHaveBeenCalledTimes(1);
    });

    it('handleAreaFoundInOriginal should call multiple functions', () => {
        const result = [1, 2, 3];
        const spyFlashAreaOriginal = spyOn(component.originalPlayArea, 'flashArea');
        const spyFlashAreaDiff = spyOn(component.diffPlayArea, 'flashArea');
        component.handleAreaFoundInOriginal(result);
        expect(component.imagesData).toEqual(result);
        expect(component.foundADifference).toBe(true);
        expect(mouseServiceSpy.changeClickState).toHaveBeenCalledTimes(1);
        expect(spyFlashAreaOriginal).toHaveBeenCalledTimes(1);
        expect(spyFlashAreaDiff).toHaveBeenCalledTimes(1);
    });

    // it('handleAreaNotFoundInOriginal should call multiple functions', () => {
        
    // });

    // it('handleAreaNotFoundInDiff should call multiple functions', () => {
        
    // });

    // it('pick should get the color of the canvas', () => {
    //     const rgb = component.pick(1, 1);
    //     expect(rgb).toEqual('rgba(0, 0, 0, 0)');
    // });

    // it('copyArea should make a copy of a part of the originalArea', () => {
    //     component.copyArea([1]);
    // });

    // it('resetCanvas should refresh the area and copy a part of the original canvas', () => {
    //     component.resetCanvas();
    // });
});
