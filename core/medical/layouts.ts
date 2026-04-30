import { ValidChipIds } from "../chip";

import { LayoutEntry, ValuesFromLayout } from "../chip/types";

export enum LayoutVersion {
    V0_0 = 0,
    V0_1 = 1,
    // V1 = 1. Reserved for first production use.
}

// * Mifare Ultralight EV1

export const LAYOUT_V0_0 = {
    chipId: 1,
    version: LayoutVersion.V0_0,
    slots: {
        type: { start: 0, length: 1 },
        version: { start: 1, length: 1 },
        phones: { start: 2, length: 16 },
        isbt128: { start: 18, length: 1 },
        cie11: { start: 19, length: 7 },
        snomedct: { start: 26, length: 7 },
        other: { start: 33, length: 7 },
    },
} as const satisfies LayoutEntry<ValidChipIds, LayoutVersion>;

export type LayoutV0_0Values = ValuesFromLayout<typeof LAYOUT_V0_0>;

// * Desfire EV3 4k

export const LAYOUT_V0_1 = {
    chipId: 2,
    version: LayoutVersion.V0_1,
    slots: {
        type: { start: 0, length: 1 },
        version: { start: 1, length: 1 },
        uuid: { start: 2, length: 16 },
        phones: { start: 18, length: 16 },
        name: { start: 34, length: 27 },
        snomedect: { start: 61, length: 7 },
    },
} as const satisfies LayoutEntry<ValidChipIds, LayoutVersion>;

export type LayoutV0_1Values = ValuesFromLayout<typeof LAYOUT_V0_1>;
