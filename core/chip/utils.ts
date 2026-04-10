import { ChipSpecs } from "./constants";
import { ChipType, LayoutEntry, MemSlot, ValidChipIds } from "./types";

/**
 * Validates and returns a typed layout entry for the given chip.
 *
 * Performs three checks at definition time:
 * 1. The layout's `chipId` matches the spec ID for `chip`.
 * 2. No two slots overlap in address space.
 * 3. All slots fit within the chip's total memory.
 *
 * @param layout - The layout entry to validate.
 * @param chip   - The chip type key used to look up specs.
 * @returns The same layout entry, narrowed to its exact types.
 *
 * @throws If `chipId` does not match the spec.
 * @throws If any two slots overlap.
 * @throws If any slot exceeds the chip's memory boundary.
 *
 * @example
 * const layout = defineLayout({
 *     chipId: 0x01,
 *     version: 1,
 *     slots: {
 *         config: { start: 0, length: 4 },
 *         data:   { start: 4, length: 16 },
 *     },
 * }, "MyChip");
 */
export function defineLayout<
    TChipId extends ValidChipIds,
    TVersion extends number,
    TSlots extends Record<string, MemSlot>,
>(
    layout: LayoutEntry<TChipId, TVersion, TSlots>,
    chip: ChipType,
): LayoutEntry<TChipId, TVersion, TSlots> {
    validateChipId(layout.chipId, chip);
    validateSlots(layout.slots);
    validateBounds(layout.slots, ChipSpecs[chip].totalMemory);
    return layout;
}

/**
 * Ensures no two slots overlap in memory address space.
 *
 * @param slots - Named memory slots to check.
 * @throws If any pair of slots share at least one address.
 */
function validateSlots(slots: Record<string, MemSlot>): void {
    const ranges = Object.entries(slots).map(([field, slot]) => ({
        field,
        start: slot.start,
        end: slot.start + slot.length - 1,
    }));

    for (let i = 0; i < ranges.length; i++) {
        for (let j = i + 1; j < ranges.length; j++) {
            const a = ranges[i];
            const b = ranges[j];
            if (a.start <= b.end && b.start <= a.end) {
                throw new Error(
                    `Slot overlap: "${a.field}" [${a.start}-${a.end}] conflicts with "${b.field}" [${b.start}-${b.end}]`,
                );
            }
        }
    }
}

/**
 * Ensures all slots fall within the chip's addressable memory.
 *
 * @param slots       - Named memory slots to check.
 * @param totalMemory - Total addressable bytes for the chip.
 * @throws If any slot's end address exceeds `totalMemory`.
 */
function validateBounds(
    slots: Record<string, MemSlot>,
    totalMemory: number,
): void {
    for (const [field, slot] of Object.entries(slots)) {
        const end = slot.start + slot.length;
        if (end > totalMemory) {
            throw new Error(
                `Slot "${field}" [${slot.start}-${end - 1}] exceeds chip memory (${totalMemory}b)`,
            );
        }
    }
}

/**
 * Verifies that the layout's declared chip ID matches the spec for the given chip type.
 *
 * @param layoutChipId - The chip ID declared in the layout.
 * @param chip         - The chip type key to validate against.
 * @throws If the IDs do not match.
 */
function validateChipId(layoutChipId: string | number, chip: ChipType): void {
    if (layoutChipId !== ChipSpecs[chip].id) {
        throw new Error(
            `chipId mismatch: layout declares ${layoutChipId}, chip "${chip}" has id ${ChipSpecs[chip].id}`,
        );
    }
}
