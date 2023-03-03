export namespace TestConstants {
    // Difference Detector Tests
    export const OFF_BOUNDS_PIXELS = [-1, -Infinity, 2, 3, 0.3, NaN, Infinity];
    export const PIXELS_TO_ADD_RADIUS = [4, 8];
    export const NB_VALID_PIXELS = 600;
    export const NB_TOTAL_PIXELS = 1024;
    export const DATA_LENGTH = 4;
    export const PIXEL_TO_FIND_ADJACENT = 4;
    export const ADJACENT_PIXELS = [0, 8, 2560, 2564];
    export const CHUNK_OF_PIXELS = [0, 4, 8, 12, 2564, 2568, 2572, 2576];
    export const LIST_OF_DIFFERENCES = [8, 12, 2568, 2572, 2576, 12000, 12004, 12880, 29392];
    export const EXPECTED_DIFFERENCES = 4;

    // Image Service Tests
    export const EXPECTED_DIFFERENCE_ARRAY = [1, 4, 7, 9, 11];
    export const FOUND_DIFFERENCES_TEST = [0, 1, 2];

    // Level Service constants
    export const TIME_CONSTANTS_SOLO = { sixty: 60, sixty_five: 65, seventy: 70 };
    export const TIME_CONSTANTS_MULTI = { eighty: 80, eighty_three: 83, ninety: 90 };
}
