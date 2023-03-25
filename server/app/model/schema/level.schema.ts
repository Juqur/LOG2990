import { Level, Score } from '@common/level';
import { model, Schema } from 'mongoose';

const scoreSchema = new Schema<Score>({
    name: { type: String, required: true },
    time: { type: Number, required: true },
});

export const levelSchema = new Schema<Level>({
    id: { type: Number, required: true },
    name: { type: String, required: true },
    scoreSolo: { type: [scoreSchema], default: [] },
    scoreMulti: { type: [scoreSchema], default: [] },
    isEasy: { type: Boolean, required: true },
    nbDifferences: { type: Number, required: true },
    canJoin: { type: Boolean, default: false },
});

export const levelModel = model<Level>('Level', levelSchema);
// dunno what to do with this right now
