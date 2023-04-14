/**
 * Interface of the level's differences and its canvas of differences.
 * Used mostly by the detection differences.
 */
export interface LevelDifferences {
    clusters: number[][];
    isHard: boolean;
    canvas: CanvasRenderingContext2D;
}
