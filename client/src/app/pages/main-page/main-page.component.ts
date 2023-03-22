import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AudioService } from '@app/services/audio/audio.service';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss', '../pages.scss'],
})
/**
 * This component represents the main page, it is the first page that displays
 * when the website is opened.
 *
 * @author Junaid Qureshi & Pierre Tran
 * @class MainPageComponent
 */
export class MainPageComponent implements OnInit, OnDestroy {
    private iconValue: string = 'volume_off';
    private canShowCredits: boolean = true;
    private audioServiceSoundtrack = new AudioService();

    constructor(private router: Router) {}

    /**
     * Getter for the icon value
     */
    get icon(): string {
        return this.iconValue;
    }

    /**
     * Getter for the canShowCredits attribute
     */
    get showCredits(): boolean {
        return this.canShowCredits;
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
    }

    /**
     * Method used when the page is terminated, it resets the audio to it's base state.
     */
    ngOnDestroy(): void {
        this.audioServiceSoundtrack.reset();
    }

    /**
     * Redirects to the selection page.
     */
    classicPageOnClick() {
        this.router.navigate(['/selection']);
    }

    /**
     * Redirects to the configuration page.
     */
    configPageOnClick() {
        this.router.navigate(['/config']);
    }

    /**
     * Handles the click on the volume button.
     */
    volumeOnClick() {
        AudioService.quickPlay('./assets/audio/click.mp3');
        this.audioServiceSoundtrack.mute();
        this.iconValue = this.icon === 'volume_up' ? 'volume_off' : 'volume_up';
    }

    /**
     * Handles the click on the credits button.
     */
    creditsOnClick() {
        AudioService.quickPlay('./assets/audio/click.mp3');
        this.canShowCredits = !this.showCredits;
    }
}
