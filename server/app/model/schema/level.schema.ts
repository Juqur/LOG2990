import { Level, Score } from '@common/level';
import { model, Schema } from 'mongoose';

const scoreSchema = new Schema<Score>({
    name: { type: String, required: true },
    time: { type: String, required: true },
});

const levelSchema = new Schema<Level>({
    id: { type: Number, required: true },
    name: { type: String, required: true },
    scoreSolo: [scoreSchema],
    scoreMulti: [scoreSchema],
    isEasy: { type: Boolean, required: true },
    nbDifferences: { type: Number, required: true },
    canJoin: { type: Boolean, default: false },
});

export const levelModel = model<Level>('Level', levelSchema);
