import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Level } from '@app/levels';
import { CommunicationService } from '@app/services/communication.service';
import { Constants } from '@common/constants';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
    providers: [CommunicationService],
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
    diffImgSrc = '..';
    defaultArea: boolean = true;
    diffArea: boolean = true;
    closePath: string = '/selection';
    gameId: string | undefined;

    constructor(private route: ActivatedRoute, private communicationService: CommunicationService) {}
    async ngOnInit(): Promise<void> {
        this.route.params.subscribe((params) => {
            // recoit le bon id!!
            this.levelId = params.id;
        });
        this.route.queryParams.subscribe((params) => {
            this.playerName = params['playerName'];
        });

        this.communicationService.postNewGame('/game', this.playerName, String(this.levelId)).subscribe((gameId) => {
            this.gameId = gameId;
        });

        this.defaultImgSrc = 'http://localhost:3000/originals/' + this.levelId + '.bmp';
        this.diffImgSrc = 'http://localhost:3000/modifiees/' + this.levelId + '.bmp';
    }
}
