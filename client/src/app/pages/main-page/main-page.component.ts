import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AudioService } from '@app/services/audio.service';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent implements OnInit, OnDestroy {
    icon: string = 'volume_off';

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

    classicPageOnClick() {
        this.router.navigate(['/selection']);
    }

    configPageOnClick() {
        this.router.navigate(['/config']);
    }

    volumeOnClick() {
        this.audioService.playSound('./assets/audio/click.mp3');
        this.audioService.mute();
        this.icon = this.icon === 'volume_up' ? 'volume_off' : 'volume_up';
    }

    creditsOnClick() {
        this.audioService.playSound('./assets/audio/click.mp3');
        const credits = document.getElementById('credits');
        if (!credits) {
            return;
        }
        credits.style.display = credits.style.display === 'block' ? 'none' : 'block';
    }
}
