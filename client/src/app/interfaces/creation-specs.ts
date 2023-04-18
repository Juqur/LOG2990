import { LevelDifferences } from '@app/interfaces/level-differences';

export interface CreationSpecs {
    defaultImageFile: File;
    diffImageFile: File;
    radius: number;
    nbDifferences: number;
    differences: LevelDifferences | undefined;
    defaultBgCanvasCtx: CanvasRenderingContext2D | null;
    diffBgCanvasCtx: CanvasRenderingContext2D | null;
}
