import { GameStateService } from '@app/services/game/game.service';
import { ImageService } from '@app/services/image/image.service';
import { Body, Controller, Logger, Post } from '@nestjs/common';

@Controller('game')
export class GameController {
    constructor(private gameStateService: GameStateService, private imageService: ImageService, private logger: Logger) {}

    @Post()
    createNewGame(@Body() body: { imageId: string }) {
        const gameId = this.generateGameId();
        this.gameStateService.createGameState(gameId, { imageId: body.imageId, foundDifferences: [] });
        return JSON.stringify(gameId);
    }

    @Post('/difference')
    async findImageDifference(@Body() body: { gameId: string; position: number }) {
        this.logger.log(body.gameId);
        this.logger.log(body.position);
        const gameState = this.gameStateService.getGameState(body.gameId);
        this.logger.log(gameState);
        return await this.imageService.findDifference(gameState.imageId, gameState.foundDifferences, body.position);
    }

    generateGameId(): string {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        return Math.random().toString(36).substring(2, 15);
    }
}
