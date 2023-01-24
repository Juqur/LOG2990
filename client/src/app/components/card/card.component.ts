import { Component, Input } from '@angular/core';
import { Level } from '../../levels';

@Component({
    selector: 'app-card',
    templateUrl: './card.component.html',
    styleUrls: ['./card.component.scss'],
})
export class CardComponent {
    @Input() level: Level | undefined;
}
