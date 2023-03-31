import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument, model } from 'mongoose';

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
    playerSolo: string[];

    @ApiProperty()
    @Prop()
    timeSolo: number[];

    @ApiProperty()
    @Prop()
    playerMulti: string[];

    @ApiProperty()
    @Prop()
    timeMulti: number[];

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
