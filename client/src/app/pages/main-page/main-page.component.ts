import { Component } from '@angular/core';
import { Router } from '@angular/router';
@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
    // TODO: Fix audio!! All commented out for now is audio related code.
    icon: string = 'volume_up';
    // audio: HTMLAudioElement;
    constructor(private router: Router) {
        // this.audio = new Audio();
        // this.audio.src = './assets/audio/soundtrack.mp3';
        // this.audio.setAttribute('autoplay', 'true');
        // this.audio.addEventListener('loadeddata', () => {
        //     this.audio.play();
        // });
    }

    startGameOnClick() {
        this.router.navigate(['/selection']);
    }

    configPageOnClick() {
        this.router.navigate(['/config']);
    }

    volumeOnClick() {
        // this.playAudio();
        //  this.audio.muted = !this.audio.muted;
        this.icon = this.icon === 'volume_up' ? 'volume_off' : 'volume_up';
    }

    creditsOnClick() {
        // this.playAudio();
        const credits = document.getElementById('credits');
        if (!credits) {
            return;
        }
        credits.style.display = credits.style.display === 'block' ? 'none' : 'block';
    }

    // playAudio() {
    //     const audio = new Audio('./assets/audio/click.mp3');
    //     audio.load();
    //     audio.setAttribute('autoplay', 'true');
    //     audio.play();
    // }
}
