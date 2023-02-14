export interface Level {
    id: number;
    imageOriginal: string;
    imageDiff: string;
    name: string;
    playerSolo: string[];
    timeSolo: number[];
    playerMulti: string[];
    timeMulti: number[];
    isEasy: boolean;
}
