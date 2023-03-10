import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ChatMessageComponent } from '@app/components/chat-message/chat-message.component';
import { CounterComponent } from '@app/components/counter/counter.component';
import { GameChatComponent } from '@app/components/game-chat/game-chat.component';
import { GameTimerComponent } from '@app/components/game-timer/game-timer.component';
import { MessageBoxComponent } from '@app/components/message-box/message-box.component';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { ScaleContainerComponent } from '@app/components/scale-container/scale-container.component';
import { AppMaterialModule } from '@app/modules/material.module';
import { AudioService } from '@app/services/audioService/audio.service';
import { DrawService } from '@app/services/drawService/draw.service';
import { MouseService } from '@app/services/mouse.service';
import { Constants } from '@common/constants';
import { GamePageComponent } from './game-page.component';
import SpyObj = jasmine.SpyObj;

describe('GamePageComponent', () => {
    let component: GamePageComponent;
    let fixture: ComponentFixture<GamePageComponent>;
    let mouseServiceSpy: SpyObj<MouseService>;
    let playAreaComponentSpy: SpyObj<PlayAreaComponent>;
    // let audioServiceSpy: SpyObj<AudioService>;
    let drawServiceSpy: SpyObj<DrawService>;

    const mouseEvent = {
        offsetX: 100,
        offsetY: 200,
        button: 0,
    } as MouseEvent;

    beforeEach(async () => {
        mouseServiceSpy = jasmine.createSpyObj('MouseService', ['mouseHitDetect', 'getCanClick', 'getX', 'getY', 'changeClickState', 'resetCounter']);
        playAreaComponentSpy = jasmine.createSpyObj('PlayAreaComponent', ['getCanvas', 'drawPlayArea', 'flashArea', 'timeout']);
        drawServiceSpy = jasmine.createSpyObj('DrawService', ['drawError']);

        await TestBed.configureTestingModule({
            declarations: [
                GamePageComponent,
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
                { provide: MouseService, useValue: mouseServiceSpy },
                { provide: PlayAreaComponent, useValue: playAreaComponentSpy },
                { provide: DrawService, useValue: drawServiceSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(GamePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('if its navigationstart, should call resetCounter', () => {
        fixture.detectChanges();

        expect(mouseServiceSpy.resetCounter).toHaveBeenCalledTimes(1);
    });

    it('should call handleAreaFoundInOriginal if difference is found in original', fakeAsync(() => {
        mouseServiceSpy.getCanClick.and.returnValue(true);
        mouseServiceSpy.mouseHitDetect.and.returnValue(Promise.resolve([1]));
        const spy = spyOn(component, 'handleAreaFoundInOriginal');
        component.clickedOnOriginal(mouseEvent);
        tick();
        expect(spy).toHaveBeenCalledTimes(1);
    }));

    it('should call handleAreaNotFoundInOriginal if difference is not found in original', fakeAsync(() => {
        mouseServiceSpy.getCanClick.and.returnValue(true);
        mouseServiceSpy.mouseHitDetect.and.returnValue(Promise.resolve([]));
        const spy = spyOn(component, 'handleAreaNotFoundInOriginal');
        component.clickedOnOriginal(mouseEvent);
        tick();
        expect(spy).toHaveBeenCalledTimes(1);
    }));

    it('should call handleAreaFoundInDiff if difference is found in diff', fakeAsync(() => {
        mouseServiceSpy.getCanClick.and.returnValue(true);
        mouseServiceSpy.mouseHitDetect.and.returnValue(Promise.resolve([1]));
        const spy = spyOn(component, 'handleAreaFoundInDiff');
        component.clickedOnDiff(mouseEvent);
        tick();
        expect(spy).toHaveBeenCalledTimes(1);
    }));

    it('should call handleAreaFoundInDiff if difference is not found in diff', fakeAsync(() => {
        mouseServiceSpy.getCanClick.and.returnValue(true);
        mouseServiceSpy.mouseHitDetect.and.returnValue(Promise.resolve([]));
        const spy = spyOn(component, 'handleAreaNotFoundInDiff');
        component.clickedOnDiff(mouseEvent);
        tick();
        expect(spy).toHaveBeenCalledTimes(1);
    }));

    it('handleAreaFoundInDiff should call multiple functions', () => {
        const result = [1, 2, 3];
        const spyFlashAreaOriginal = spyOn(component.originalPlayArea, 'flashArea');
        const spyFlashAreaDiff = spyOn(component.diffPlayArea, 'flashArea');
        const audioServiceSpy = spyOn(AudioService, 'quickPlay');
        component.handleAreaFoundInDiff(result);
        expect(audioServiceSpy).toHaveBeenCalledOnceWith('./assets/audio/success.mp3');
        expect(component.imagesData).toEqual(result);
        expect(mouseServiceSpy.changeClickState).toHaveBeenCalledTimes(1);
        expect(spyFlashAreaOriginal).toHaveBeenCalledTimes(1);
        expect(spyFlashAreaDiff).toHaveBeenCalledTimes(1);
    });

    it('handleAreaFoundInOriginal should call multiple functions', () => {
        const result = [1, 2, 3];
        const spyFlashAreaOriginal = spyOn(component.originalPlayArea, 'flashArea');
        const spyFlashAreaDiff = spyOn(component.diffPlayArea, 'flashArea');
        const spyResetCanvas = spyOn(component, 'resetCanvas');
        const audioServiceSpy = spyOn(AudioService, 'quickPlay');
        component.handleAreaFoundInOriginal(result);
        expect(component.imagesData).toEqual(result);
        expect(audioServiceSpy).toHaveBeenCalledOnceWith('./assets/audio/success.mp3');
        expect(mouseServiceSpy.changeClickState).toHaveBeenCalledTimes(1);
        expect(spyFlashAreaOriginal).toHaveBeenCalledTimes(1);
        expect(spyFlashAreaDiff).toHaveBeenCalledTimes(1);
        expect(spyResetCanvas).toHaveBeenCalledTimes(1);
    });

    it('handleAreaNotFoundInOriginal should call multiple functions', fakeAsync(() => {
        const audioServiceSpy = spyOn(AudioService, 'quickPlay');
        const originalPlayAreaSpy = spyOn(component.originalPlayArea, 'drawPlayArea');
        component.handleAreaNotFoundInOriginal();
        expect(audioServiceSpy).toHaveBeenCalledOnceWith('./assets/audio/failed.mp3');
        expect(mouseServiceSpy.changeClickState).toHaveBeenCalled();
        tick(Constants.millisecondsInOneSecond);
        expect(originalPlayAreaSpy).toHaveBeenCalledTimes(1);
        expect(mouseServiceSpy.changeClickState).toHaveBeenCalled();
    }));

    it('handleAreaNotFoundInDiff should call multiple functions', fakeAsync(() => {
        const spyResetCanvas = spyOn(component, 'resetCanvas');
        const audioServiceSpy = spyOn(AudioService, 'quickPlay');
        component.handleAreaNotFoundInDiff();
        expect(audioServiceSpy).toHaveBeenCalledOnceWith('./assets/audio/failed.mp3');
        expect(mouseServiceSpy.changeClickState).toHaveBeenCalledTimes(1);
        tick(Constants.millisecondsInOneSecond);
        expect(spyResetCanvas).toHaveBeenCalledTimes(1);
    }));

    it('handleAreaNotFoundInDiff should call multiple functions', fakeAsync(() => {
        const spyResetCanvas = spyOn(component, 'resetCanvas');

        component.handleAreaNotFoundInDiff();

        expect(spyResetCanvas).toHaveBeenCalledTimes(1);
        tick(Constants.millisecondsInOneSecond);
        expect(mouseServiceSpy.changeClickState).toHaveBeenCalledTimes(1);
    }));

    it('pick should get the color of the canvas', () => {
        const rgb = component.pick(1, 1);
        expect(rgb).toEqual('rgba(0, 0, 0, 0)');
    });

    it('resetCanvas should refresh the area and copy a part of the original canvas', fakeAsync(() => {
        const spyTempDiffDrawPlayArea = spyOn(component.tempDiffPlayArea, 'drawPlayArea');
        const spyOriginalDrawPlayArea = spyOn(component.originalPlayArea, 'drawPlayArea');
        const copyAreaSpy = spyOn(component, 'copyArea');
        component.resetCanvas();
        tick(Constants.millisecondsInOneSecond);
        expect(spyTempDiffDrawPlayArea).toHaveBeenCalledTimes(1);
        expect(spyOriginalDrawPlayArea).toHaveBeenCalledTimes(1);
        expect(mouseServiceSpy.changeClickState).toHaveBeenCalledTimes(1);
        tick(0);
        expect(copyAreaSpy).toHaveBeenCalledTimes(1);
    }));
});
