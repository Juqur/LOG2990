import { LevelDifferences } from '@app/classes/difference';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';

export interface CreationSpecs {
    defaultImageFile: File | null;
    diffImageFile: File | null;
    radius: number;
    nbDifferences: number; // Could possibly drop depending on the LevelDifferences
    differences: LevelDifferences;
    defaultArea: PlayAreaComponent;
    diffArea: PlayAreaComponent;
    defaultCanvasCtx: CanvasRenderingContext2D;
    diffCanvasCtx: CanvasRenderingContext2D; // For all the one that seem to dupe, might need to check if they are really needed.
}
