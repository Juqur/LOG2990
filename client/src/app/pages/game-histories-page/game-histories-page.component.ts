import { Component, OnInit } from '@angular/core';
import { CommunicationService } from '@app/services/communication/communication.service';

@Component({
    selector: 'app-game-histories-page',
    templateUrl: './game-histories-page.component.html',
    styleUrls: ['./game-histories-page.component.scss'],
})
export class GameHistoriesPageComponent implements OnInit {
    constructor(private communicationService: CommunicationService) {}

    ngOnInit(): void {
      this.communicationService.
    }
}
