import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AudioService } from '@app/services/audio.service';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss', '../pages.scss'],
})
export class MainPageComponent implements OnInit, OnDestroy {
    icon: string = 'volume_off';
    showCredits: boolean = true;

    constructor(private router: Router, private audioService: AudioService) {}

    ngOnInit(): void {
        this.audioService.soundtrack = this.audioService.create('./assets/audio/soundtrack.mp3');
        this.audioService.soundtrack.loop = true;
        this.audioService.soundtrack.muted = true;
        this.audioService.play(this.audioService.soundtrack);
    }

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
