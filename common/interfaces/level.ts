/**
 * Interface of the level's general information.
 */
export interface Level {
    id: number;
    name: string;
    playerSolo: string[];
    timeSolo: number[];
    playerMulti: string[];
    timeMulti: number[];
    isEasy: boolean;
    nbDifferences: number;
    canJoin?: boolean;
}
