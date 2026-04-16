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
} as const;
