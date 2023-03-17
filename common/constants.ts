export namespace Constants {
    // Global constants
    export const minusOne: number = -1;
    export const ten: number = 10;
    export const twenty: number = 20;
    export const thirty: number = 30;
    export const forty: number = 40;
    export const fifty: number = 50;
    export const sixty: number = 60;
    export const seventy: number = 70;
    export const eighty: number = 80;
    export const ninety: number = 90;
    export const hundred: number = 100;
    export const thousand: number = 1000;

    // Global time constants
    export const secondsPerMinute: number = 60;

    // Page display
    export const levelsPerPage: number = 4;

    // Caroussel

    // Level mock values
    export const timeSolo: number[] = [60, 65, 70];
    export const timeMulti: number[] = [80, 83, 90];
    export const testXposition: number = 96;
    export const testYposition: number = 74;

    // Game timer
    export const millisecondsInOneSecond: number = 1000;
    export const millisecondsInThirtySeconds: number = 30000;
    export const twoMinutesTimer: number = 120;
    export const tenMinutesTimer: number = 600;
    export const eightMinutesWait: number = 480000;

    // Chat message
    export const maxNameLength: number = 11;
    export const maxNameLengthShown: number = 8;
    export const maxMessageLength: number = 100;

    // Difference Detector
    export const EXPECTED_WIDTH = 640;
    export const EXPECTED_HEIGHT = 480;
    export const MIN_DIFFICULTY_RATIO = 0.15;
    export const MIN_DIFFERENCES = 7;
    export const FULL_ALPHA = 255;
    export const MAX_DIFFERENCES_LIMIT = 9;
    export const MIN_DIFFERENCES_LIMIT = 3;

    // Detection of difference constants
    export const PIXEL_SIZE: number = 4;

    // Canvas for game
    export const DEFAULT_WIDTH = 640;
    export const DEFAULT_HEIGHT = 480;

    // Radius values and Creation Component constants
    export const RADIUS_DEFAULT = 3;
    export const RADIUS_TABLE: number[] = [0, 3, 9, 15];
    export const SLIDER_DEFAULT = 1;
    export const INIT_DIFF_NB = 0;
    export const BMP_BPP_POS = 28;
    export const BMP_BPP = 24;
    export const BLACK = '#000000';
    export const MAX_GAME_NAME_LENGTH = 10;

    // Game constants
    export const INIT_COUNTDOWN_TIME = 30;
    export const INIT_HINTS_NB = 3;
    export const HINT_PENALTY = 5;
    export const COUNTDOWN_TIME_WIN = 5;
    export const DEFAULTTESTNUMBER = 7;

    // Card Component
    export const MAX_NAME_LENGTH = 300;

    // Undo/Redo Service
    export const EMPTYSTACK = -1;
    export const DEFAULT_LEVEL = {
        id: 0,
        name: 'no name',
        playerSolo: ['player 1', 'player 2', 'player 3'],
        timeSolo: [-1, -1, -1],
        playerMulti: ['player 1', 'player 2', 'player 3'],
        timeMulti: [-1, -1, -1],
        isEasy: true,
        nbDifferences: 7,
    };
}

export enum MouseButton {
    Left = 0,
    Middle = 1,
    Right = 2,
    Back = 3,
    Forward = 4,
}
