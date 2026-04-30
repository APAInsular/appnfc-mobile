export const ChipSpecs = {
    MifareUltralightEV1_128B: {
        id: 1,

        memory: {
            total: 128,
        },

        system: {
            offset: 0,
            length: 16,
        },

        user: {
            offset: 16,
            length: 112,
        },
    },
    DesfireEV3_4K: {
        id: 2,
        memory: { total: 4096 },
        system: { offset: 0, length: 0 },
        user: { offset: 0, length: 4096 },
    },
} as const;
