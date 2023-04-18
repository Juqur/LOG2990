import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument, model } from 'mongoose';

export type GameConstantsDocument = HydratedDocument<GameConstants>;

@Schema()
export class GameConstants {
    @ApiProperty({
        description: 'The initial time all games in limited time start with.',
    })
    @Prop({ required: true })
    initialTime: number;

    @ApiProperty({
        description: 'The penalty in time for using a hint',
    })
    @Prop({ required: true })
    timePenaltyHint: number;

    @ApiProperty({
        description: 'The time we gain for finding a difference',
    })
    @Prop({ required: true })
    timeGainedDifference: number;
}

export const gameConstantsSchema = SchemaFactory.createForClass(GameConstants);
export const gameConstantsModel = model<GameConstants>('GameConstants', gameConstantsSchema);
