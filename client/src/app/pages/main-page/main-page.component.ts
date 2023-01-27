import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AudioService } from '@app/services/audio.service';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
    icon: string = 'volume_up';

    constructor(private router: Router, private audioService: AudioService) {}

    startGameOnClick() {
        this.router.navigate(['/selection']);
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
