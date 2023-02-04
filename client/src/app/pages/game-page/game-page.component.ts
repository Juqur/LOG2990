import { Component } from '@angular/core';
import { MouseService } from '@app/services/mouse.service';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent {
    constructor(private service: MouseService) {}

    getDifferenceCounter(): number {
        return this.service.differenceCounter;
    }
}
