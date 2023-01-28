import { Component, Input, OnInit } from '@angular/core';
import { Level } from '@app/levels';
import { Constants } from '@common/constants';

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
        timeSolo: [Constants.minusOne, Constants.minusOne, Constants.minusOne],
        playerMulti: ['player 1', 'player 2', 'player 3'],
        timeMulti: [Constants.minusOne, Constants.minusOne, Constants.minusOne],
        isEasy: true,
        route: 'no route',
    };

    @Input() index: number = Constants.minusOne;
    temp: string;
    slides: string[] = [];
    i = 0;

    ngOnInit(): void {
        this.populateSlides();
    }

    /**
     * format the time
     *
     * @param time
     * @returns the time formatted
     */
    formatTime(time: number): string {
        const minutes: number = Math.floor(time / Constants.secondsPerMinute);
        const seconds: number = time - minutes * Constants.secondsPerMinute;

        const minutesString: string = minutes < Constants.ten ? '0' + minutes : minutes.toString();
        const secondsString: string = seconds < Constants.ten ? '0' + seconds : seconds.toString();
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
        <td class="name-column"><b>SOLO</b></td>
        <td class="time-column"><b>Time</b></td>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td width="70%" class="name-column">${this.level.playerSolo[0]}</td>
        <td width="30%" class="time-column">${this.formatTime(this.level.timeSolo[0])}</td>
      </tr>
      <tr>
        <td width="70%" class="name-column">${this.level.playerSolo[1]}</td>
        <td width="30%" class="time-column">${this.formatTime(this.level.timeSolo[1])}</td>
      </tr>
      <tr>
        <td width="70%" class="nameColumn">${this.level.playerSolo[2]}</td>
        <td width="30%" class="time-column">${this.formatTime(this.level.timeSolo[2])}</td>
      </tr>
    </tbody>
    </table>`;

        this.slides.push(this.temp);

        this.temp = `
    <table width="100%">
    <thead>
      <tr>
        <td><b>1v1</b></td>
        <td><b>Time</b></td>
      </tr>
    </thead>
    <tbody>
        <tr>
            <td width="70%" class="name-column">${this.level.playerMulti[0]}</td>
            <td width="30%" class="time-column">${this.formatTime(this.level.timeMulti[0])}</td>
        </tr>
        <tr>
            <td width="70%" class="name-column">${this.level.playerMulti[1]}</td>
            <td width="30%" class="time-column">${this.formatTime(this.level.timeMulti[1])}</td>
        </tr>
        <tr>
            <td width="70%" class="nameColumn">${this.level.playerMulti[2]}</td>
            <td width="30%" class="time-column">${this.formatTime(this.level.timeMulti[2])}</td>
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
