import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { DialogData, PopUpService } from '@app/services/pop-up/pop-up.service';
import { SocketHandler } from '@app/services/socket-handler/socket-handler.service';
import { Dialogs } from '@common/dialogs';

@Injectable({
    providedIn: 'root',
})
export class MainPageService {
    constructor(private popUpService: PopUpService, private socketHandler: SocketHandler, private router: Router) {}

    navigateTo(route: string): void {
        this.router.navigate([route]);
    }

    startTimedGame() {
        this.popUpService.openDialog(Dialogs.inputNameDialogData);
        this.popUpService.dialogRef.afterClosed().subscribe((playerName) => {
            if (playerName) {
                this.chooseGameType(playerName);
            }
        });
    }

    connectToSocket() {
        if (!this.socketHandler.isSocketAlive('game')) {
            this.socketHandler.connect('game');
        }
    }

    private chooseGameType(playerName: string) {
        const dialogData: DialogData = {
            textToSend: 'Voulez-vous jouer avec un autre joueur?',
            isConfirmation: true,
            closeButtonMessage: '',
            mustProcess: false,
        };
        this.popUpService.openDialog(dialogData);
        this.popUpService.dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.socketHandler.send('game', 'createTimedGame', { multiplayer: true, playerName });
                this.router.navigate([`/game/${0}/`], {
                    queryParams: { playerName },
                });
            } else {
                this.socketHandler.send('game', 'createTimedGame', { multiplayer: false, playerName });
                this.router.navigate([`/game/${0}/`], {
                    queryParams: { playerName },
                });
            }
        });
    }
}
