import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument } from 'mongoose';

export type LevelDocument = HydratedDocument<Score>;

@Schema()
export class Score {
    @ApiProperty()
    @Prop({ required: true })
    name: string;

    @ApiProperty()
    @Prop({ required: true })
    time: number;
}

export const scoreSchema = SchemaFactory.createForClass(Score);
