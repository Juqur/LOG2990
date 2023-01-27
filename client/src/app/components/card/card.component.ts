import { Component, Input, OnInit } from '@angular/core';
import { Level } from '@app/levels';

@Component({
    selector: 'app-card',
    templateUrl: './card.component.html',
    styleUrls: ['./card.component.scss'],
})
export class CardComponent implements OnInit {
    @Input() level: Level;

    difficulty: string;

    /**
     * Display the difficulty of the level
     *
     * @returns the difficulty of the level
     */

    displayDifficulty(): string {
        try {
            if (this.level.isEasy === true) {
                return 'Easy';
            } else {
                return 'Hard';
            }
        } catch {
            return 'No difficulty';
        }
    }

    ngOnInit(): void {
        this.difficulty = this.displayDifficulty();
    }
}
