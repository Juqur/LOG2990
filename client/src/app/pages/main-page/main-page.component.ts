import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent implements OnInit, OnDestroy {
    icon: string = 'volume_up';
    isCreditsClosed: boolean = true;
    audio: HTMLAudioElement;
    constructor(private router: Router) {}

    ngOnInit(): void {
        this.audio = new Audio('./assets/audio/main.mp3');
        if (this.audio) {
            this.audio.loop = true;
            this.audio.load();
            this.audio.play();
        }
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
        audio.play();
    }
}
