export namespace TestConstants {
    // Difference Detector Tests
    export const OFF_BOUNDS_PIXELS = [-1, -Infinity, NaN, Infinity];
    export const VALID_PIXELS = [1, 2, 3, 4, 5, 6];
    export const NB_VALID_PIXELS = 600;
    export const NB_TOTAL_PIXELS = 1024;
    export const DATA_LENGTH = 4;
    export const PIXEL_TO_FIND_ADJACENT = 4;
    export const ADJACENT_PIXELS = [0, 8, 2560, 2564];
    export const CHUNK_OF_PIXELS = [0, 4, 8, 12, 2564, 2568, 2572, 2576];
}
