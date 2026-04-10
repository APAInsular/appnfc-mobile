import { ValidChipIds } from "../chip";

import { LayoutEntry, ValuesFromLayout } from "../chip/types";

export enum LayoutVersion {
    Medical = 1,
}

export const LAYOUT_V1 = {
    chipId: 1,
    version: LayoutVersion.Medical,
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

export type LayoutV1Values = ValuesFromLayout<typeof LAYOUT_V1>;
