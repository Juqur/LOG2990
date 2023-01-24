import { Component } from '@angular/core';
@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
    icon: string = 'volume_up';
    isCreditsClosed: boolean = true;

    volumeOnClick() {
        this.playAudio();
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
        const audio = new Audio();
        audio.src = './assets/audio/click.mp3';
        audio.load();
        audio.play();
    }
}
