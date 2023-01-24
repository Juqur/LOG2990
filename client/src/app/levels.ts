export interface Level {
    id: number;
    image: string;
    name: string;
    player: string[];
    time: string[];
    difficulty: string;
}

export const levels = [
    {
        id: 1,
        image: 'assets/images/spinningSkull.gif',
        name: ':skull:',
        player: ['Guylaine Tremblay', 'Gaston G. Marcotte', 'Gontrand Gone'],
        time: ['1:00', '1:05', '1:09'],
        difficulty: 'assets/images/easy.png',
    },
    {
        id: 2,
        image: 'assets/images/bing-chilling.png',
        name: '现在我有冰淇淋',
        player: ['Guylaine Tremblay', 'Gaston G. Marcotte', 'Gontrand Gone'],
        time: ['1:00', '1:05', '1:09'],
        difficulty: 'assets/images/hard.png',
    },
    {
        id: 3,
        image: 'assets/images/flibustier.png',
        name: 'Le flibuster mysogine',
        player: ['Guylaine Tremblay', 'Gaston G. Marcotte', 'Gontrand Gone'],
        time: ['1:00', '1:05', '1:09'],
        difficulty: 'assets/images/easy.png',
    },

    {
        id: 4,
        image: 'assets/images/figma.png',
        name: 'Figma rouleau de printemps',
        player: ['Guylaine Tremblay', 'Gaston G. Marcotte', 'Gontrand Gone'],
        time: ['1:00', '1:05', '1:09'],
        difficulty: 'assets/images/easy.png',
    },

    {
        id: 5,
        image: 'assets/images/kekqing.png',
        name: 'Yuheng of Liyue Qixing',
        player: ['Guylaine Tremblay', 'Gaston G. Marcotte', 'Gontrand Gone'],
        time: ['1:00', '1:05', '1:09'],
        difficulty: 'assets/images/easy.png',
    },
];

/*
  Copyright Google LLC. All Rights Reserved.
  Use of this source code is governed by an MIT-style license that
  can be found in the LICENSE file at https://angular.io/license
  */
