import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument, model } from 'mongoose';
import { Score } from './score.schema';

export type LevelDocument = HydratedDocument<Level>;

@Schema()
export class Level {
    @ApiProperty()
    @Prop({ required: true })
    id: number;

    @ApiProperty()
    @Prop({ required: true })
    name: string;

    @ApiProperty()
    @Prop()
    scoreSolo: Score[];

    @ApiProperty()
    @Prop()
    scoreMulti: Score[];

    @ApiProperty()
    @Prop({ required: true })
    isEasy: boolean;

    @ApiProperty()
    @Prop({ required: true })
    nbDifferences: number;

    @ApiProperty()
    @Prop()
    canJoin: boolean;
}

export const levelSchema = SchemaFactory.createForClass(Level);
export const levelModel = model<Level>('Level', levelSchema);
