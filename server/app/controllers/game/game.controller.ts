import { GameStateService } from '@app/services/game/game.service';
import { ImageService } from '@app/services/image/image.service';
import { Body, Controller, Post } from '@nestjs/common';

@Controller('game')
export class GameController {
    constructor(private gameStateService: GameStateService, private imageService: ImageService) {}

    @Post()
    createNewGame(imageID: string) {
        const gameId = this.generateGameId();
        this.gameStateService.createGameState(gameId, { imageId: imageID, foundDifferences: [] });
        return gameId;
    }

    @Post('/difference')
    async findImageDifference(@Body() body: { gameId: string; position: number }) {
        const gameState = this.gameStateService.getGameState(body.gameId);
        const result = this.imageService.findDifference(gameState.imageId, body.position);
    }

    generateGameId(): string {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        return Math.random().toString(36).substring(2, 15);
    }
}
