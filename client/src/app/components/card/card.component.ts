import { Component, Input, OnInit } from '@angular/core';
import { Level } from '@app/levels';

@Component({
    selector: 'app-card',
    templateUrl: './card.component.html',
    styleUrls: ['./card.component.scss'],
})
export class CardComponent implements OnInit {
    @Input() level: Level = {
        id: -1,
        image: 'no image',
        name: 'no name',
        playerSolo: ['player 1', 'player 2', 'player 3'],
        timeSolo: [-1, -1, -1],
        playerMulti: ['player 1', 'player 2', 'player 3'],
        timeMulti: [-1, -1, -1],
        isEasy: true,
        route: 'no route'};

    difficulty: string;

    /**
     * Display the difficulty of the level
     *
     * @returns the difficulty of the level
     */

    displayDifficulty(): string {
        if (this.level.isEasy === true) {
            return 'Easy';
        } else {
            return 'Hard';
        }
    }

    displayDifficultyIcon(isEasy:boolean): string {
        if (isEasy === true) {
            return "../../../assets/images/easy.png";
        } else {
            return "../../../assets/images/hard.png";
        }
    }

    ngOnInit(): void {
        this.difficulty = this.displayDifficulty();
    }
}
