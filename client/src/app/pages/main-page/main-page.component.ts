import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent implements OnDestroy {
    icon: string = 'volume_up';
    isCreditsClosed: boolean = true;
    audio: HTMLAudioElement;
    component: { muted: boolean; };
    constructor(private router: Router) {
        this.audio = new Audio();
        this.audio.src = './assets/audio/soundtrack.mp3';
        this.audio.addEventListener('loadeddata', () => {
            this.audio.play();
        });
    }
    ngOnDestroy() {
        this.audio.pause();
    }

    startGameOnClick() {
        this.router.navigate(['/game']);
    }

    volumeOnClick() {
        this.playAudio();
        this.audio.muted = !this.audio.muted;
        this.icon = this.icon === 'volume_up' ? 'volume_off' : 'volume_up';
    }

    creditsOnClick() {
        this.playAudio();
        const credits = document.getElementById('credits');
        if (!credits) {
            return;
        }
        credits.style.display = credits.style.display === 'block' ? 'none' : 'block';
    }

    playAudio() {
        const audio = new Audio('./assets/audio/click.mp3');
        audio.load();
        if (audio.paused) {
            audio.play();
        }
    }
}
