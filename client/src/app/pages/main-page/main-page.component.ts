import { Component, OnDestroy, OnInit } from '@angular/core';
import { AudioService } from '@app/services/audio/audio.service';
import { MainPageService } from '@app/services/main-page/main-page.service';

/**
 * This component represents the main page, it is the first page that displays
 * when the website is opened.
 *
 * @author Junaid Qureshi & Pierre Tran
 * @class MainPageComponent
 */
@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss', '../pages.scss'],
})
export class MainPageComponent implements OnInit, OnDestroy {
    private iconValue: string = 'volume_off';
    private canShowCredits: boolean = true;
    private audioServiceSoundtrack = new AudioService();

    constructor(private mainPageService: MainPageService) {}

    /**
     * Getter for the icon value.
     */
    get icon(): string {
        return this.iconValue;
    }

    /**
     * Getter for the canShowCredits attribute.
     */
    get showCredits(): boolean {
        return this.canShowCredits;
    }

    get amountOfLevels(): number {
        return this.mainPageService.amountOfLevels;
    }

    /**
     * Initializes the audio playing on the main page. It sets it on loop and muted as
     * a default parameter.
     */
    ngOnInit(): void {
        this.audioServiceSoundtrack.create('./assets/audio/soundtrack.mp3');
        this.audioServiceSoundtrack.loop();
        this.audioServiceSoundtrack.mute();
        this.audioServiceSoundtrack.play();
        this.mainPageService.connectToSocket();
    }

    /**
     * Method used when the page is terminated, it resets the audio to it's base state.
     */
    ngOnDestroy(): void {
        this.audioServiceSoundtrack.reset();
    }

    /**
     * Redirects to a specific page.
     *
     * @param path The path to redirect to.
     */
    navigateTo(path: string): void {
        this.mainPageService.navigateTo(path);
    }

    /**
     * Handles the click on the volume button.
     */
    volumeOnClick(): void {
        AudioService.quickPlay('./assets/audio/click.mp3');
        this.audioServiceSoundtrack.mute();
        this.iconValue = this.icon === 'volume_up' ? 'volume_off' : 'volume_up';
    }

    /**
     * Handles the click on the credits button.
     */
    creditsOnClick(): void {
        AudioService.quickPlay('./assets/audio/click.mp3');
        this.canShowCredits = !this.showCredits;
    }

    /**
     * This method should be called when the user clicks on the limited time game mode button.
     * It starts the preparation for a timed timed game.
     */
    onLimitedTimeClick(): void {
        this.mainPageService.chooseName();
    }
}
