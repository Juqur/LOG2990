import { Constants } from '@common/constants';
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

export const levels = [
    {
        id: 1,
        name: ':skull:',
        playerSolo: ['Guylaine Tremblay', 'Gaston G. Marcotte', 'Gontrand Gone'],
        timeSolo: Constants.timeSolo,
        playerMulti: ['Glenn Gagnon', 'Herve Harvey', 'Yvons Payé'],
        timeMulti: Constants.timeMulti,
        isEasy: true,
    },
    {
        id: 2,
        name: '现在我有冰淇淋',
        playerSolo: ['Guylaine Tremblay', 'Gaston G. Marcotte', 'Gontrand Gone'],
        timeSolo: Constants.timeSolo,
        playerMulti: ['Brother 郝', 'Hervé Harvey', 'Marcel Martel'],
        timeMulti: Constants.timeMulti,
        isEasy: false,
    },
    {
        id: 3,
        name: 'Le flibuster mysogine',
        playerSolo: ['Guylaine Tremblay', 'Gaston G. Marcotte', 'Gontrand Gone'],
        timeSolo: Constants.timeSolo,
        playerMulti: ['Eliza Vezina', 'Caillou Roche', 'Marcel Martel'],
        timeMulti: Constants.timeMulti,
        isEasy: true,
    },
    {
        id: 4,
        name: 'Figma rouleau de printemps',
        playerSolo: ['Guylaine Tremblay', 'Gaston G. Marcotte', 'Gontrand Gone'],
        timeSolo: Constants.timeSolo,
        playerMulti: ['Glenn Gagnon', 'Herve Harvey', 'Yvons Payé'],
        timeMulti: Constants.timeMulti,
        isEasy: true,
    },
    {
        id: 5,
        name: 'Yuheng of Liyue Qixing',
        playerSolo: ['Guylaine Tremblay', 'Gaston G. Marcotte', 'Gontrand Gone'],
        timeSolo: Constants.timeSolo,
        playerMulti: ['Glenn Gagnon', 'Herve Harvey', 'Yvons Payé'],
        timeMulti: Constants.timeMulti,
        isEasy: true,
    },
    {
        id: 6,
        name: 'KEKW',
        playerSolo: ['Guylaine Tremblay', 'Gaston G. Marcotte', 'Gontrand Gone'],
        timeSolo: Constants.timeSolo,
        playerMulti: ['Glenn Gagnon', 'Herve Harvey', 'Yvons Payé'],
        timeMulti: Constants.timeMulti,
        isEasy: true,
    },
    {
        id: 7,
        name: '7-Rectangles',
        playerSolo: ['Guylaine Tremblay', 'Gaston G. Marcotte', 'Gontrand Gone'],
        timeSolo: Constants.timeSolo,
        playerMulti: ['Glenn Gagnon', 'Herve Harvey', 'Yvons Payé'],
        timeMulti: Constants.timeMulti,
        isEasy: true,
    },
];
