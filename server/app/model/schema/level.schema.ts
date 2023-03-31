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
// import { Prop } from '@nestjs/mongoose';
// import { HydratedDocument, model, Schema } from 'mongoose';

// export type LevelDocument = HydratedDocument<Level>;

// const scoreSchema = new Schema<Score>({
//     name: { type: String, required: true },
//     time: { type: Number, required: true },
// });

// @Schema()
// export class Level {
//     @Prop()
//     id: number;

//     @Prop()
//     name: string;

//     @Prop()
//     scoreSolo: [scoreSchema];
// }
// // export levelSchema = new Schema<Level>({
// //     id: { type: Number, required: true },
// //     name: { type: String, required: true },
// //     scoreSolo: { type: [scoreSchema], default: [] },
// //     scoreMulti: { type: [scoreSchema], default: [] },
// //     isEasy: { type: Boolean, required: true },
// //     nbDifferences: { type: Number, required: true },
// //     canJoin: { type: Boolean, default: false },
// // });

// export const levelModel = model<Level>('Level', Level);
// export const LevelSchema = SchemaFactory.createForClass(Level);

// // dunno what to do with this right now
