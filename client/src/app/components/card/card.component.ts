import { Component, OnInit } from '@angular/core';
import { levels } from '../../levels';

@Component({
    selector: 'app-card',
    templateUrl: './card.component.html',
    styleUrls: ['./card.component.scss'],
})
export class CardComponent implements OnInit {

    levels = levels;
    constructor() {}

    ngOnInit(): void {}
}
