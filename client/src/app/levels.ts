/*eslint no-magic-numbers: ["error", { "ignore": [1] }]*/

export interface Level {
    id: number;
    image: string;
    name: string;
    playerSolo: string[];
    timeSolo: number[];
    playerMulti: string[];
    timeMulti: number[];
    isEasy: boolean;
    route: string; // this attribute will have to be changed when we do server side
}

export const levels = [
    {
        id: 1,
        image: 'assets/images/spinningSkull.gif',
        name: ':skull:',
        playerSolo: ['Guylaine Tremblay', 'Gaston G. Marcotte', 'Gontrand Gone'],
        timeSolo: [60, 65, 70],
        playerMulti: ['Glenn Gagnon', 'Herve Harvey', 'Yvons Payé'],
        timeMulti: [80, 83, 90],
        isEasy: true,
        route: 'level1',
    },
    {
        id: 2,
        image: 'assets/images/bing-chilling.png',
        name: '现在我有冰淇淋',
        playerSolo: ['Guylaine Tremblay', 'Gaston G. Marcotte', 'Gontrand Gone'],
        timeSolo: [60, 65, 70],
        playerMulti: ['Brother 郝', 'Hervé Harvey', 'Marcel Martel'],
        timeMulti: [80, 83, 90],
        isEasy: false,
        route: 'game',
    },
    {
        id: 3,
        image: 'assets/images/flibustier.png',
        name: 'Le flibuster mysogine',
        playerSolo: ['Guylaine Tremblay', 'Gaston G. Marcotte', 'Gontrand Gone'],
        timeSolo: [60, 65, 70],
        playerMulti: ['Eliza Vezina', 'Caillou Roche', 'Marcel Martel'],
        timeMulti: [80, 83, 90],
        isEasy: true,
        route: 'game',
    },

    {
        id: 4,
        image: 'assets/images/figma.png',
        name: 'Figma rouleau de printemps',
        playerSolo: ['Guylaine Tremblay', 'Gaston G. Marcotte', 'Gontrand Gone'],
        timeSolo: [60, 65, 70],
        playerMulti: ['Glenn Gagnon', 'Herve Harvey', 'Yvons Payé'],
        timeMulti: [80, 83, 90],
        isEasy: true,
        route: 'game',
    },

    {
        id: 5,
        image: 'assets/images/kekqing.png',
        name: 'Yuheng of Liyue Qixing',
        playerSolo: ['Guylaine Tremblay', 'Gaston G. Marcotte', 'Gontrand Gone'],
        timeSolo: [60, 65, 70],
        playerMulti: ['Glenn Gagnon', 'Herve Harvey', 'Yvons Payé'],
        timeMulti: [80, 83, 90],
        isEasy: true,
        route: 'game',
    },
    {
        id: 6,
        image: 'assets/images/kekqing.png',
        name: 'KEKW',
        playerSolo: ['Guylaine Tremblay', 'Gaston G. Marcotte', 'Gontrand Gone'],
        timeSolo: [60, 65, 70],
        playerMulti: ['Glenn Gagnon', 'Herve Harvey', 'Yvons Payé'],
        timeMulti: [80, 83, 90],
        isEasy: true,
        route: 'game',
    },
];

/*
  Copyright Google LLC. All Rights Reserved.
  Use of this source code is governed by an MIT-style license that
  can be found in the LICENSE file at https://angular.io/license
  */
