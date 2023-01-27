import { Component, OnInit, Input } from '@angular/core';
import { Level } from '@app/levels';

@Component({
    selector: 'app-carousel',
    templateUrl: './carousel.component.html',
    styleUrls: ['./carousel.component.scss'],
})
export class CarouselComponent implements OnInit {
    @Input() level: Level;
    @Input() index: number;
    temp: string;
    slides: string[] = [];
    i = 0;

    ngOnInit(): void {
        this.populateSlides();
    }

    /**
     * Get the time of the level for the solo mode
     *
     * @param index
     * @returns the time of the level for the solo mode
     */
    getTimeSolo(index: number) {
        try {
            return this.formatTime(this.level.timeSolo[index]);
        } catch {
            return 'No time';
        }
    }

    /**
     * get the time of the level for the multi mode
     *
     * @param index
     * @returns the time of the level for the multi mode
     */
    getTimeMulti(index: number) {
        try {
            return this.formatTime(this.level.timeMulti[index]);
        } catch {
            return 'No time';
        }
    }

    /**
     * get the player of the level for the solo mode
     *
     * @param index
     * @returns the player of the level for the solo mode
     */
    getPlayerSolo(index: number) {
        try {
            return this.level.playerSolo[index];
        } catch {
            return 'No player';
        }
    }

    /**
     * get the player of the level for the multi mode
     *
     * @param index
     * @returns the player of the level for the multi mode
     */
    getPlayerMulti(index: number): string {
        try {
            return this.level.playerMulti[index];
        } catch {
            return 'No player';
        }
    }

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

    /**
     * populate the slides
     */
    populateSlides() {
        this.temp = `
    <table width="100%">
    <thead>
      <tr>
        <td class="name-column-header"><b>SOLO</b></th>
        <td class="time-column-header"><b>Time</b></th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td width="70%" class="name-column">${this.getPlayerSolo(0)}</td>
        <td width="30%" class="time-column">${this.getTimeSolo(0)}</td>
      </tr>
      <tr>
      <td width="70%" class="name-column">${this.getPlayerSolo(1)}</td>
      <td width="30%" class="time-column">${this.getTimeSolo(1)}</td>
      </tr>
      <tr>
      <td width="70%" class="nameColumn">${this.getPlayerSolo(2)}</td>
      <td width="30%" class="time-column">${this.getTimeSolo(2)}</td>
      </tr>
    </tbody>
    </table>`;

        this.slides.push(this.temp);

        this.temp = `
    <table width="100%">
    <thead>
      <tr>
      <td><b>1v1</b></th>
      <td><b>Time</b></th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td width="70%" class="name-column">${this.getPlayerMulti(0)}</td>
        <td width="30%" class="time-column">${this.getTimeMulti(0)}</td>
      </tr>
      <tr>
      <td width="70%" class="name-column">${this.getPlayerMulti(1)}</td>
      <td width="30%" class="time-column">${this.getTimeMulti(1)}</td>
      </tr>
      <tr>
      <td width="70%" class="name-column">${this.getPlayerMulti(2)}</td>
      <td width="30%" class="time-column">${this.getTimeMulti(2)}</td>
      </tr>
    </tbody>
    </table>`;

        this.slides.push(this.temp);
    }

    /**
     * get the slide
     *
     * @returns the slide
     */
    getSlide() {
        return this.slides[this.i];
    }

    /**
     * change the style of the solo button when selected
     *
     * @param index
     */
    changeSoloButtonStyle(index: number) {
        this.i = this.i === 0 ? 0 : this.i - 1;
        document.getElementsByClassName(index.toString())[0].classList.add('selected');
        document.getElementsByClassName((index + 1).toString())[0].classList.remove('selected');
    }

    /**
     * change the style of the multi button when selected
     *
     * @param index
     */
    changeMultiButtonStyle(index: number) {
        this.i = this.i === this.slides.length - 1 ? this.i : this.i + 1;
        document.getElementsByClassName(index.toString())[0].classList.add('selected');
        document.getElementsByClassName((index - 1).toString())[0].classList.remove('selected');
    }
}
