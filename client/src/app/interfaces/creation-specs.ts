import { LevelDifferences } from '@app/interfaces/level-differences';

export interface CreationSpecs {
    defaultImageFile: File;
    diffImageFile: File;
    radius: number;
    nbDifferences: number;
    differences: LevelDifferences | undefined;
    defaultBgCanvasContext: CanvasRenderingContext2D | null;
    diffBgCanvasContext: CanvasRenderingContext2D | null;
}
