import { Component, Input, OnInit } from '@angular/core';
import { Level } from '../../levels';

@Component({
    selector: 'app-card',
    templateUrl: './card.component.html',
    styleUrls: ['./card.component.scss'],
})
export class CardComponent implements OnInit {
    // constructor() {}
    @Input() level: Level | undefined;

    ngOnInit(): void {}
}
