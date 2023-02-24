import { FileSystemStoredFile } from 'nestjs-form-data';
export interface Level {
    id: number;
    name: string;
    playerSolo: string[];
    timeSolo: number[];
    playerMulti: string[];
    timeMulti: number[];
    isEasy: boolean;
    nbDifferences: number;
}

export interface LevelData {
    name: string;
    imageOriginal: FileSystemStoredFile;
    imageDiff: FileSystemStoredFile;
    isEasy: string;
    clusters: number[][];
    nbDifferences: number;
}
