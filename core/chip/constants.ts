export const ChipSpecs = {
    MifareUltralightEV1_128B: {
        id: 1,
        userMemoryOffset: 16,
        totalMemory: 128,
        userMemoryLength: 112,
    },
} as const;

export const MEMORY_INDEX_OFFSET =
    ChipSpecs.MifareUltralightEV1_128B.userMemoryOffset;
