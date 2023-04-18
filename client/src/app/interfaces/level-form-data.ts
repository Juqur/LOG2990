/**
 * Interface of the level form when it is sent to the server.
 */
export interface LevelFormData {
    imageOriginal: File;
    imageDiff: File;
    name: string;
    isEasy: string;
    clusters: string;
    nbDifferences: string;
}
