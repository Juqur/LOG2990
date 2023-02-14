import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Level } from '@app/levels';
import { CommunicationService } from '@app/services/communication.service';
import { Constants } from '@common/constants';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent implements OnInit {
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
    closePath: string = '/selection';

    constructor(private route: ActivatedRoute, private communicationService: CommunicationService) {}
    ngOnInit(): void {
        this.route.params.subscribe((params) => {
            // recoit le bon id!!
            this.levelId = params.id;
        });

        this.communicationService.getLevel('/image/', this.levelId).subscribe((value) => {
            this.currentLevel = value;
        });
    }
}
