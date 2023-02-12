import { Constants } from '@common/constants';
export interface Level {
    imageOriginal: File;
    imageDiff: File;
    name: string;
    playerSolo: string[];
    timeSolo: number[];
    playerMulti: string[];
    timeMulti: number[];
    isEasy: boolean;
}

export const levels = [
    {
        id: 1,
        image: 'assets/images/spinningSkull.gif',
        name: ':skull:',
        playerSolo: ['Guylaine Tremblay', 'Gaston G. Marcotte', 'Gontrand Gone'],
        timeSolo: Constants.timeSolo,
        playerMulti: ['Glenn Gagnon', 'Herve Harvey', 'Yvons Payé'],
        timeMulti: Constants.timeMulti,
        isEasy: true,
        route: 'level1',
    },
    {
        id: 2,
        image: 'assets/images/bing-chilling.png',
        name: '现在我有冰淇淋',
        playerSolo: ['Guylaine Tremblay', 'Gaston G. Marcotte', 'Gontrand Gone'],
        timeSolo: Constants.timeSolo,
        playerMulti: ['Brother 郝', 'Hervé Harvey', 'Marcel Martel'],
        timeMulti: Constants.timeMulti,
        isEasy: false,
        route: 'game',
    },
    {
        id: 3,
        image: 'assets/images/flibustier.png',
        name: 'Le flibuster mysogine',
        playerSolo: ['Guylaine Tremblay', 'Gaston G. Marcotte', 'Gontrand Gone'],
        timeSolo: Constants.timeSolo,
        playerMulti: ['Eliza Vezina', 'Caillou Roche', 'Marcel Martel'],
        timeMulti: Constants.timeMulti,
        isEasy: true,
        route: 'game',
    },

    {
        id: 4,
        image: 'assets/images/figma.png',
        name: 'Figma rouleau de printemps',
        playerSolo: ['Guylaine Tremblay', 'Gaston G. Marcotte', 'Gontrand Gone'],
        timeSolo: Constants.timeSolo,
        playerMulti: ['Glenn Gagnon', 'Herve Harvey', 'Yvons Payé'],
        timeMulti: Constants.timeMulti,
        isEasy: true,
        route: 'game',
    },

    {
        id: 5,
        image: 'assets/images/kekqing.png',
        name: 'Yuheng of Liyue Qixing',
        playerSolo: ['Guylaine Tremblay', 'Gaston G. Marcotte', 'Gontrand Gone'],
        timeSolo: Constants.timeSolo,
        playerMulti: ['Glenn Gagnon', 'Herve Harvey', 'Yvons Payé'],
        timeMulti: Constants.timeMulti,
        isEasy: true,
        route: 'game',
    },
    {
        id: 6,
        image: 'assets/images/kekw.png',
        name: 'KEKW',
        playerSolo: ['Guylaine Tremblay', 'Gaston G. Marcotte', 'Gontrand Gone'],
        timeSolo: Constants.timeSolo,
        playerMulti: ['Glenn Gagnon', 'Herve Harvey', 'Yvons Payé'],
        timeMulti: Constants.timeMulti,
        isEasy: true,
        route: 'game',
    },
];
