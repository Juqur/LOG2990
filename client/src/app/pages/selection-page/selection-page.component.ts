import { Component } from '@angular/core';
import { levels } from '@app/levels';

@Component({
    selector: 'app-selection-page',
    templateUrl: './selection-page.component.html',
    styleUrls: ['./selection-page.component.scss'],
})
export class SelectionPageComponent {
    levels = [...levels];
}
