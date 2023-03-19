// import { Injectable } from '@angular/core';
// import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
// import { SocketHandler } from '@app/services/socket-handler.service';

// @Injectable({
//     providedIn: 'root',
// })
// export class CheatModeService {
//     private remainingDifferences: number[][];
//     private isInCheatMode: boolean = false;
//     private originalPlayArea: PlayAreaComponent;
//     private diffPlayArea: PlayAreaComponent;
//     // private levelId: number;

//     constructor(private socketService: SocketHandler) {}

//     /**
//      * This method checks if the KeyboardEvent we have received is associated with the t key (this means it doesn't work
//      * with a shift t or a T key pressed via the caps lock key) and then initiates the cheat mode.
//      *
//      * @param event the KeyboardEvent
//      */
//     keyDown(event: KeyboardEvent, levelId: number) {
//         // this.levelId = levelId;
//         if (event.key === 't') {
//             if (!this.isInCheatMode) {
//                 this.socketService.send('game', 'onCheatMode', levelId);
//                 this.isInCheatMode = !this.isInCheatMode;
//                 return;
//             }
//             this.isInCheatMode = !this.isInCheatMode;
//         }
//     }

//     startCheatMode(differences: number[][]) {
//         // Should make all differences flash 4 times per seconds.
//         // Should flash in both the different canvas and the original.
//         // When a difference is found it should no longer flash.
//         this.remainingDifferences = differences;
//     }

//     /**
//      * This methods sets and updates the play areas of the game page.
//      *
//      * @param originalPlayArea reference to the original play area
//      * @param diffPlayArea reference to the diff play area
//      */
//     setPlayArea(originalPlayArea: PlayAreaComponent, diffPlayArea: PlayAreaComponent): void {
//         this.originalPlayArea = originalPlayArea;
//         this.diffPlayArea = diffPlayArea;
//     }

//     /**
//      * Will be called when the user finds a difference in the difference canvas.
//      *
//      * @param result the current area found
//      */
//     //   private handleAreaFoundInDiff(result: number[]): void {
//     //     AudioService.quickPlay('./assets/audio/success.mp3');
//     //     this.imagesData.push(...result);
//     //     this.diffPlayArea.flashArea(result);
//     //     this.originalPlayArea.flashArea(result);
//     //     this.resetCanvas();
//     // }
//     /*
//     What has been changed:
//     { position: mousePosition, cheatMode: this.isInCheatMode } is not what the socket event 'game' + 'onClick' sends.
//     */
// }
