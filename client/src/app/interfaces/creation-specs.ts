import { LevelDifferences } from '@app/classes/difference';

export interface CreationSpecs {
    defaultImageFile: File;
    diffImageFile: File;
    radius: number;
    nbDifferences: number;
    differences: LevelDifferences | undefined;
    defaultCanvasCtx: CanvasRenderingContext2D | null;
    diffCanvasCtx: CanvasRenderingContext2D | null;
}
