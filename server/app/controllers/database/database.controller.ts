import { GameConstants } from '@app/model/schema/game-constants.schema';
import { MongodbService } from '@app/services/mongodb/mongodb.service';
import { Body, Controller, Get, HttpCode, Patch } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';

enum HttpCodes {
    OK = 200,
    CREATED = 201,
}

@Controller('database')
export class DatabaseController {
    constructor(private mongodbService: MongodbService) {}

    /**
     * Gets the game constants.
     *
     * @returns The game constants
     */
    @ApiOkResponse({
        description: 'Returns data for a level',
    })
    @Get('/constants')
    @HttpCode(HttpCodes.OK)
    async getGameConstants(): Promise<GameConstants> {
        // eslint-disable-next-line no-console
        console.log('Called get in server');
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
    async setNewGameConstants(@Body() gameConstants: GameConstants): Promise<void> {
        const newConstants = gameConstants as GameConstants;
        // eslint-disable-next-line no-console
        console.log(newConstants);
        // eslint-disable-next-line no-console
        console.log('called setNewGameConstants in server');
        await this.mongodbService.setNewGameConstants(newConstants);
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
        // eslint-disable-next-line no-console
        console.log('somehow called resetGameConstants');
        await this.mongodbService.resetGameConstants();
    }
}
