import { LevelDifferences } from '@app/classes/difference';

export interface CreationSpecs {
    defaultImageFile: File;
    differenceImageFile: File;
    radius: number;
    nbDifferences: number;
    differences: LevelDifferences | undefined;
    defaultBgCanvasContext: CanvasRenderingContext2D | null;
    differenceBgCanvasContext: CanvasRenderingContext2D | null;
}
