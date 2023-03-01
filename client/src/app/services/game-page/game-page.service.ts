import { Injectable } from '@angular/core';
import { DialogData, PopUpServiceService } from '@app/services/pop-up-service.service';
import { Constants } from '@common/constants';
import { AudioService } from '@app/services/audio.service';
import { Gateways, SocketHandler } from '@app/services/socket-handler.service';

@Injectable({
    providedIn: 'root',
})
export class GamePageService {
    private winGameDialogData: DialogData = {
        textToSend: 'Vous avez gagné!',
        closeButtonMessage: 'Retour au menu de sélection',
    };
    private closePath: string = '/selection';
    private numberOfDifference: number = 0;
    private differencesFound: number = 0;
    constructor(private socketHandler: SocketHandler, private popUpService: PopUpServiceService, private audioService: AudioService) {}

    onInit(levelId: number): void {
        if (!this.socketHandler.isSocketAlive(Gateways.Game)) {
            this.socketHandler.connect(Gateways.Game);
            this.socketHandler.send(Gateways.Game, 'onJoinMultiplayerGame', levelId);
            this.socketHandler.on(Gateways.Game, 'onProcessedClick', (data) => {
                console.log('onProcessedClick', data);
                const differenceArray = data as number[];
                if (differenceArray.length > 0) {
                    this.differencesFound++;
                    return true;
                }
                if (differenceArray.length === Constants.minusOne) {
                    this.popUpService.openDialog(this.winGameDialogData, this.closePath);
                    this.audioService.playSound('./assets/audio/Bing_Chilling_vine_boom.mp3');
                }
                return false;
            });
        }
    }
    sendClick(gameId: string, position: number): void {
        this.socketHandler.send(Gateways.Game, 'onClick', { gameId, position });
    }
}
