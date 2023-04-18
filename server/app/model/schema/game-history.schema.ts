import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument, model } from 'mongoose';

export type GameHistoryDocument = HydratedDocument<GameHistory>;

@Schema()
export class GameHistory {
    @ApiProperty({
        description: 'The date at which the game was started',
    })
    @Prop({ required: true })
    startDate: Date;

    @ApiProperty({
        description: 'The length of the game in seconds as a number',
    })
    @Prop({ required: true })
    lengthGame: number;

    @ApiProperty({
        description: 'Boolean identifying if we are in classic mode or limited time mode',
    })
    @Prop({ required: true })
    isClassic: boolean;

    @ApiProperty({
        description: 'The name of the first player',
    })
    @Prop({ required: true })
    firstPlayerName: string;

    @ApiProperty({
        description: 'The name of the second player, if it is undefined then we have a game in solo',
    })
    @Prop()
    secondPlayerName: string | undefined;

    @ApiProperty({
        description:
            'This parameter identifies if the player has abandoned, in the case of two players it checks if the second player has abandoned' +
            ' the game and in the case of single player it checks if the player has abandoned the game',
    })
    @Prop({ required: true })
    hasPlayerAbandoned: boolean;
}

export const gameHistorySchema = SchemaFactory.createForClass(GameHistory);
export const gameHistoryModel = model<GameHistory>('GameHistory', gameHistorySchema);
