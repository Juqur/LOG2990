import { MongodbService } from '@app/services/mongodb/mongodb.service';
import { GameConstants } from '@common/game-constants';
import { Body, Controller, Get, HttpCode, Patch } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';

enum HttpCodes {
    OK = 200,
    CREATED = 201,
}

/**
 * This controller provides the server API requests for the database controller requests that do not impact directly levels.
 *
 * @author Charles Degrandpré
 * @class DatabaseController
 */
@Controller('database')
export class DatabaseController {
    constructor(private mongodbService: MongodbService) {}

    /**
     * Gets the game constants.
     *
     * @returns The game constants.
     */
    @ApiOkResponse({
        description: 'Returns data for a level',
    })
    @Get('/constants')
    @HttpCode(HttpCodes.OK)
    async getGameConstants(): Promise<GameConstants> {
        return await this.mongodbService.getGameConstants();
    }

    /**
     * Sets the game constants we new values given as parameters.
     *
     * @param formData The new game constants.
     */
    @ApiOkResponse({
        description: 'Returns data for a level',
    })
    @Patch('/constants')
    @HttpCode(HttpCodes.OK)
    async setNewGameConstants(@Body('gameConstants') gameConstants: GameConstants): Promise<void> {
        await this.mongodbService.setNewGameConstants(gameConstants);
    }

    /**
     * Resets the game constants to their default values.
     */
    @ApiOkResponse({
        description: 'Returns data for a level',
    })
    @Patch('/constants/reset')
    @HttpCode(HttpCodes.CREATED)
    async resetGameConstants(): Promise<void> {
        await this.mongodbService.resetGameConstants();
    }
}
