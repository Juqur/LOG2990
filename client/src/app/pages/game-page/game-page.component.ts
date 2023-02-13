import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Level } from '@app/levels';
import { Constants } from '@common/constants';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent implements OnInit {
    playerName: string;
    levelId: number;
    currentLevel: Level; // doit recuperer du server
    isClassicGamemode: boolean = true;
    isMultiplayer: boolean = false;
    nbDiff: number = Constants.INIT_DIFF_NB; // Il faudrait avoir cette info dans le level
    hintPenalty = Constants.HINT_PENALTY;
    nbHints: number = Constants.INIT_HINTS_NB;
    imagesData: unknown[] = [];
    defaultImgSrc = '';
    diffImgSrc = '';
    defaultArea: boolean = true;
    diffArea: boolean = true;

    constructor(private route: ActivatedRoute) {}
    ngOnInit(): void {
        this.route.params.subscribe((params) => {
            // recoit le bon id!!
            this.levelId = params.id;
        });
        this.route.queryParams.subscribe((params) => {
            this.playerName = params['playerName'];
        });
    }
}
