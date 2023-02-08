import { Component } from '@angular/core';
import { MouseService } from '@app/services/mouse.service';

@Component({
    selector: 'app-counter',
    templateUrl: './counter.component.html',
    styleUrls: ['./counter.component.scss'],
})
export class CounterComponent {
    constructor(private mouseService: MouseService) {}

    /**
     * Returns the value of the counter from the mouseService.
     *
     * @returns the value of the counter.
     */
    get mouseCount() {
        return this.mouseService.getDifferenceCounter();
    }
}
