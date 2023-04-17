import { FileSystemStoredFile } from 'nestjs-form-data';
export interface LevelData {
    name: string;
    imageOriginal: FileSystemStoredFile;
    imageDiff: FileSystemStoredFile;
    isEasy: string;
    clusters: number[][];
    nbDifferences: number;
}
