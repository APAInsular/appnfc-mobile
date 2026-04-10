import { ChipSpecs } from "./constants";
import {
    ChipDetail,
    ChipType,
    LayoutEntry,
    MemSlot,
    ValuesFromLayout,
} from "./types";

/**
 * @author Garkatron
 * @link https://github.com/Garkatron
 *
 * Epic class that I developed to carefully read/write memory from a NFC chip!
 *
 * 100% Overenginered!
 */
export class MemoryChip<L extends LayoutEntry<any, any>> {
    private layout: L;
    private buffer: Uint8Array;
    private config: ChipDetail;

    private isLocked: boolean = false;

    private constructor(chip: ChipType, layout: L) {
        this.config = ChipSpecs[chip];
        this.buffer = new Uint8Array(this.config.totalMemory);
        this.layout = layout;
    }

    public static fromValues<
        TChip extends ChipType,
        L extends LayoutEntry<(typeof ChipSpecs)[TChip]["id"], any>,
    >(chip: TChip, layout: L, values: ValuesFromLayout<L>): MemoryChip<L> {
        const mem = new MemoryChip(chip, layout);
        mem.writeMap(values);
        return mem;
    }

    public static fromData<
        TChip extends ChipType,
        L extends LayoutEntry<(typeof ChipSpecs)[TChip]["id"], any>,
    >(chip: TChip, layout: L, data: Uint8Array): MemoryChip<L> {
        const mem = new MemoryChip(chip, layout);
        mem.writeRaw(data);
        return mem;
    }

    private writeRaw(data: Uint8Array): void {
        for (const [, slot] of Object.entries(this.layout.slots)) {
            const chunk = data.slice(slot.start, slot.start + slot.length);
            if (chunk.length > 0) this.writeSlot(slot, chunk);
        }
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

    public writeMap(data: ValuesFromLayout<L>): void {
        this.checkLock();

        for (const [field, slot] of Object.entries(this.layout.slots)) {
            const value = (data as any)[field];
            const bytes =
                typeof value === "number"
                    ? new Uint8Array([value])
                    : (value as Uint8Array);
            this.writeSlot(slot, bytes);
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

    public readMap(): ValuesFromLayout<L> {
        const result = {} as ValuesFromLayout<L>;

        for (const [field, slot] of Object.entries(this.layout.slots)) {
            const raw = this.readSlot(slot);
            (result as any)[field] = slot.length === 1 ? raw[0] : raw;
        }

        return result;
    }
}

export const getEndByte = (slot: MemSlot): number => {
    return slot.start + slot.length - 1;
};
