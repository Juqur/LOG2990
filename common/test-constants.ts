export namespace TestConstants {
    // Difference Detector Tests
    export const OFF_BOUNDS_PIXELS = [-1, -Infinity, 2, 3, 0.3, NaN, Infinity];
    export const PIXELS_TO_ADD_RADIUS = [4, 8];
    export const NB_VALID_PIXELS = 600;
    export const NB_TOTAL_PIXELS = 1024;
    export const DATA_LENGTH = 4;
    export const PIXEL_TO_FIND_ADJACENT = 4;
    export const ADJACENT_PIXELS_TEST1 = [0, 8, 2560, 2564, 2568];
    export const ADJACENT_PIXELS_TEST2 = [2556, 2560];
    export const CHUNK_OF_PIXELS = [0, 4, 8, 12, 2564, 2568, 2572, 2576];
    export const LIST_OF_DIFFERENCES = [8, 12, 2568, 2572, 2576, 12000, 12004, 12880, 29392];
    export const EXPECTED_DIFFERENCES = 4;

    // Timer Tests
    export const ninetySecondsTimer: number = 90;
    export const tenSecondsTimer: number = 10;
    export const OneHourTimer: number = 3600;

    // Image Service Tests
    export const EXPECTED_DIFFERENCE_ARRAY = [1, 4, 7, 9, 11];
    export const FOUND_DIFFERENCES_TEST = [0, 1, 2];
    export const CLUSTERS_TEST1 = [
        [0, 4, 8, 12, 640, 644],
        [364, 368, 372],
        [2564, 2568, 2572, 2576],
    ];
    export const MOCK_LEVELS = [
        {
            id: 1,
            name: '',
            playerMulti: [],
            playerSolo: [],
            timeMulti: [],
            timeSolo: [],
            isEasy: false,
            nbDifferences: 0,
        },
        {
            id: 2,
            name: '',
            playerMulti: [],
            playerSolo: [],
            timeMulti: [],
            timeSolo: [],
            isEasy: true,
            nbDifferences: 0,
        },
        {
            id: 3,
            name: '',
            playerMulti: [],
            playerSolo: [],
            timeMulti: [],
            timeSolo: [],
            isEasy: false,
            nbDifferences: 0,
        },
    ];
    export const MOCK_LEVEL_DATA_1 = {
        name: '',
        imageOriginal: { path: '' },
        imageDiff: { path: '' },
        isEasy: 'true',
        clusters: CLUSTERS_TEST1,
        nbDifferences: 3,
    };

    // Level Service constants
    export const TIME_CONSTANTS_SOLO = { sixty: 60, sixty_five: 65, seventy: 70 };
    export const TIME_CONSTANTS_MULTI = { eighty: 80, eighty_three: 83, ninety: 90 };

    // Mongodb service constants
    export const TIME_ARRAY_SOLO_DATA_BASE = [60, 70, 80];
    export const TIME_ARRAY_MULTI_DATA_BASE = [100, 120, 140];
    export const PLAYER_ARRAY_SOLO_DATA_BASE = ['Shakespear', 'Molière', 'Victor Hugo'];
    export const PLAYER_ARRAY_MULTI_DATA_BASE = ['Cirano', 'Monte Cristo', 'Merlin'];
    export const HARD_LEVEL_NB_DIFFERENCES = 7;
    export const NOT_NEW_BEST_TIME = 1000;
    export const NEW_BEST_TIME = 6;
    export const INVALID_PAGE_NUMBER = -10;
}
