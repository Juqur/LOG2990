import { Component, OnInit } from '@angular/core';
import { Event, NavigationEnd, Router } from '@angular/router';
import { Constants } from '@common/constants';
import { Gateways, SocketHandler } from 'src/app/services/socket-handler.service';

@Component({
    selector: 'app-game-timer',
    templateUrl: './game-timer.component.html',
    styleUrls: ['./game-timer.component.scss'],
})
export class GameTimerComponent implements OnInit {
    gameTime: number = 0;
    gameTimeFormatted: string;

    constructor(private socketHandler: SocketHandler, private router: Router) {}

    setTimer(value: number) {
        this.gameTime = value;
        this.formatTime();
    }

    formatTime() {
        const minutes: number = Math.floor(this.gameTime / Constants.secondsPerMinute);
        const seconds: number = this.gameTime - minutes * Constants.secondsPerMinute;

        const minutesString: string = minutes < Constants.ten ? '0' + minutes : minutes.toString();
        const secondsString: string = seconds < Constants.ten ? '0' + seconds : seconds.toString();
        this.gameTimeFormatted = 'Time: ' + minutesString + ':' + secondsString;
    }

    ngOnInit(): void {
        this.router.events.subscribe((event: Event) => {
            if (event instanceof NavigationEnd) {
                this.socketHandler.disconnect(Gateways.Timer);
            }
        });
        this.setTimer(0);
        if (!this.socketHandler.isSocketAlive(Gateways.Timer)) {
            this.socketHandler.connect(Gateways.Timer);
            this.socketHandler.send(Gateways.Timer, 'soloClassic');
            this.socketHandler.on(
                'timer',
                (data: unknown) => {
                    this.setTimer(data as number);
                },
                Gateways.Timer,
            );
        }
    }
}
