import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent implements OnInit {
    icon: string = 'volume_up';
    isCreditsClosed: boolean = true;
    audio: HTMLAudioElement = new Audio('./assets/audio/click.mp3');
    constructor(private router: Router) {}

    ngOnInit(): void {
        this.audio.load();
    }

    startGameOnClick() {
        this.router.navigate(['/game']);
    }

    volumeOnClick() {
        this.audio.play();
        this.icon = this.icon === 'volume_up' ? 'volume_off' : 'volume_up';
    }

    creditsOnClick() {
        this.audio.play();
        const credits = document.getElementById('credits');
        if (!credits) {
            return;
        }
        credits.style.display = credits.style.display === 'block' ? 'none' : 'block';
    }

    // playAudio() {
    //     const audio = new Audio();
    //     audio.src = './assets/audio/click.mp3';
    //     audio.load();
    //     audio.play();
    // }
}
