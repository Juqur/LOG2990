import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AudioService } from '@app/services/audioService/audio.service';

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
    icon: string = 'volume_off';
    showCredits: boolean = true;

    constructor(private router: Router, private audioService: AudioService) {}

    /**
     * Initializes the audio playing on the main page. It sets it on loop and muted as
     * a default parameter.
     */
    ngOnInit(): void {
        this.audioService.soundtrack = this.audioService.create('./assets/audio/soundtrack.mp3');
        this.audioService.soundtrack.loop = true;
        this.audioService.soundtrack.muted = true;
        this.audioService.play(this.audioService.soundtrack);
    }

    /**
     * Method used when the page is terminated, it resets the audio to it's base state.
     */
    ngOnDestroy(): void {
        this.audioService.soundtrack.load();
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
        this.audioService.playSound('./assets/audio/click.mp3');
        this.audioService.mute();
        this.icon = this.icon === 'volume_up' ? 'volume_off' : 'volume_up';
    }

    /**
     * Handles the click on the credits button.
     */
    creditsOnClick() {
        this.audioService.playSound('./assets/audio/click.mp3');
        this.showCredits = !this.showCredits;
    }
}
