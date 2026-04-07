/**
 * A collection of medical data represented by a code and his meaning.
 * @param index in the file from where it is loaded.
 * @param lang of the description.
 * @param description meaning.
 * @param estandar code format.
 */
export interface MedicalRecord {
    index: number;
    code: string;
    lang: "en-US" | "es-ES";
    description: string;
    estandar: "ISBT128" | "CIE11" | "SNOMEDCT";
}

/**
 * Core bundle of medical records categorized by standard.
 * Each property acts as a data column for emergency consultation.
 */
export interface MedicalVitalsBundle {
    en: MedicalVitalsByStandard;
    es: MedicalVitalsByStandard;
}

/**
 * Medical records grouped by standard for a single language.
 */
export interface MedicalVitalsByStandard {
    isbt128: MedicalRecord[]; // Blood type and factors
    cie11: MedicalRecord[]; // Diseases and conditions
    snomedct: MedicalRecord[]; // Critical implants and alerts
}

/**
 * Finds a record based on the 'index' property value.
 * @param bundle The MedicalVitalsBundle
 * @param targetIndex The value of the .index field to look for
 */
export function findVitalByPropertyIndex(
    bundle: MedicalVitalsBundle,
    targetIndex: number,
): MedicalRecord | undefined {
    // Check both languages
    for (const lang of Object.keys(bundle) as Array<
        keyof MedicalVitalsBundle
    >) {
        const standards = bundle[lang];

        // Search through all standard arrays (isbt128, cie11, snomedct)
        const found = (Object.values(standards) as MedicalRecord[][])
            .flat()
            .find((record) => record.index === targetIndex);

        if (found) return found;
    }
    return undefined;
}
/**
 * Finds a record based on its position (slot) in the array.
 * @param bundle The MedicalVitalsBundle
 * @param lang 'en' or 'es'
 * @param standard The specific category
 * @param slot The array index (0, 1, 2...)
 */
export function findVitalByFileIndex(
    bundle: MedicalVitalsBundle,
    lang: keyof MedicalVitalsBundle,
    standard: keyof MedicalVitalsByStandard,
    slot: number,
): MedicalRecord | undefined {
    return bundle[lang][standard][slot];
}

// ---
export type MemSlot = {
    readonly start: number;
    readonly length: number;
};

export const ChipSpecs = {
    MifareUltralightEV1_128B: {
        id: 16,
        userMemoryOffset: 16,
        totalMemory: 128,
        userMemoryLength: 112,
    },
} as const;

export type ChipType = keyof typeof ChipSpecs;

export type ChipDetail = (typeof ChipSpecs)[ChipType];

export const MEMORY_INDEX_OFFSET =
    ChipSpecs.MifareUltralightEV1_128B.userMemoryOffset;

export type MemoryLayout = Record<string, MemSlot>;

export const MedicalLayout: MemoryLayout = {
    phones: { start: 0, length: 16 },
    isbt128: { start: 16, length: 1 },
    cie11: { start: 17, length: 7 },
    snomedct: { start: 24, length: 7 },
    other: { start: 31, length: 7 },
};

export const getEndByte = (slot: MemSlot): number => {
    return slot.start + slot.length - 1;
};

/**
 * @author Garkatron
 * @link https://github.com/Garkatron
 *
 * Epic class that I developed to carefully read/write memory from a NFC chip!
 *
 * 100% Overenginered!
 */
export class MemoryChip {
    private buffer: Uint8Array;
    private config: ChipDetail;
    private layout: MemoryLayout;

    private isLocked: boolean = false;

    public constructor(chip: ChipType, layout: MemoryLayout) {
        this.config = ChipSpecs[chip];
        this.buffer = new Uint8Array(this.config.totalMemory);
        this.layout = layout;
    }

    public static fromData(
        chip: ChipType,
        layout: MemoryLayout,
        data: Uint8Array,
    ): MemoryChip {
        const mem = new MemoryChip(chip, layout);

        mem.writeMap(data);

        return mem;
    }

    // Block Control

    public setLock(state: boolean) {
        this.isLocked = state;
        console.log(`Chip memory ${state ? "LOCKED" : "UNLOCKED"}`);
    }

    private checkLock() {
        if (this.isLocked) {
            throw new Error("Operation failed: Memory is currently locked.");
        }
    }

    // Write Methods

    public writeSlot(slot: MemSlot, data: Uint8Array) {
        this.checkLock();

        if (data.length > slot.length) {
            throw new Error(
                `Data (${data.length}b) exceeds slot capacity (${slot.length}b)`,
            );
        }

        if (getEndByte(slot) >= this.config.totalMemory) {
            throw new Error("Target slot out of bounds");
        }

        this.buffer.set(data, slot.start);
    }

    public writeMap(data: Uint8Array) {
        this.checkLock();

        for (const [field, slot] of Object.entries(this.layout)) {
            const chunk = data.slice(slot.start, slot.start + slot.length);
            if (chunk.length > 0) {
                this.writeSlot(slot, chunk);
            }
        }
    }

    // Read Methods

    public dump(): Uint8Array {
        return new Uint8Array(this.buffer);
    }

    public readSlot(slot: MemSlot): Uint8Array {
        if (slot.start + slot.length > this.buffer.length) {
            throw new Error("Slot out of bounds");
        }
        return this.buffer.slice(slot.start, slot.start + slot.length);
    }

    public readMap(): Record<string, Uint8Array> {
        const result: Record<string, Uint8Array> = {};
        for (const [field, slot] of Object.entries(this.layout)) {
            result[field] = this.readSlot(slot);
        }
        return result;
    }
}
