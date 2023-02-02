import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AudioService } from '@app/services/audio.service';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent implements OnInit, OnDestroy {
    @ViewChild('screen', { static: true }) screen: ElementRef;
    @ViewChild('container', { static: true }) container: ElementRef;
    scale: number = 1;
    icon: string = 'volume_off';

    constructor(private router: Router, private audioService: AudioService) {}

    ngOnInit(): void {
        this.audioService.soundtrack = this.audioService.create('./assets/audio/soundtrack.mp3');
        this.audioService.soundtrack.loop = true;
        this.audioService.soundtrack.muted = true;
        this.audioService.play(this.audioService.soundtrack);
        this.resizeContainer();
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
        const credits = document.getElementById('credits');
        if (!credits) {
            return;
        }
        credits.style.display = credits.style.display === 'block' ? 'none' : 'block';
    }

    /**
     * Resizes the container and its components to fit the screen.
     */
    resizeContainer() {
        const screenWidth = this.screen.nativeElement.offsetWidth;
        const screenHeight = this.screen.nativeElement.offsetHeight;
        const containerWidth = this.container.nativeElement.offsetWidth;
        const containerHeight = this.container.nativeElement.offsetHeight;
        this.scale = Math.min(screenWidth / containerWidth, screenHeight / containerHeight);
    }
}
