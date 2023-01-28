import { Component, OnInit, Input } from '@angular/core';
import { Level } from '@app/levels';

@Component({
    selector: 'app-carousel',
    templateUrl: './carousel.component.html',
    styleUrls: ['./carousel.component.scss'],
})
export class CarouselComponent implements OnInit {
    @Input() level: Level = {
        id: -1,
        image: 'no image',
        name: 'no name',
        playerSolo: ['player 1', 'player 2', 'player 3'],
        timeSolo: [-1, -1, -1],
        playerMulti: ['player 1', 'player 2', 'player 3'],
        timeMulti: [-1, -1, -1],
        isEasy: true,
        route: 'no route',
    };

    @Input() index: number = -1;
    temp: string;
    slides: string[] = [];
    i = 0;
    selectedButton: string = 'solo';

    ngOnInit(): void {}

    /**
     * format the time
     *
     * @param time
     * @returns the time formatted
     */
    formatTime(time: number): string {
        const minutes: number = Math.floor(time / 60);
        const seconds: number = time - minutes * 60;

        const minutesString: string = minutes < 10 ? '0' + minutes : minutes.toString();
        const secondsString: string = seconds < 10 ? '0' + seconds : seconds.toString();
        return minutesString + ':' + secondsString;
    }

    changeButtonStyle(button: string) {
        if (button === 'solo') {
            this.selectedButton = 'solo';
        } else {
            this.selectedButton = 'multi';
        }
    }
}
