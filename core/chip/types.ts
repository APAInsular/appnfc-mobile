import { ChipSpecs } from "./constants";

/** A contiguous region of chip memory defined by its start address and length in bytes. */
export type MemSlot = {
    readonly start: number;
    readonly length: number;
};

/** Union of all valid chip names as defined in ChipSpecs. */
export type ChipType = keyof typeof ChipSpecs;

/** Resolved spec object for a given ChipType. */
export type ChipDetail = (typeof ChipSpecs)[ChipType];

/** Union of all valid chip ID values across every entry in ChipSpecs. */
export type ValidChipIds = (typeof ChipSpecs)[keyof typeof ChipSpecs]["id"];

/**
 * Derives a typed value map from a LayoutEntry.
 *
 * - `type` resolves to the chip ID literal.
 * - `version` resolves to the version literal.
 * - Slots with `length === 1` resolve to `number`.
 * - Slots with `length > 1` resolve to `Uint8Array`.
 */
export type ValuesFromLayout<L extends LayoutEntry<any, any>> = {
    [K in keyof L["slots"]]: K extends "type"
        ? L["chipId"]
        : K extends "version"
          ? L["version"]
          : L["slots"][K]["length"] extends 1
            ? number
            : Uint8Array;
};

/**
 * Describes the memory layout of a chip variant.
 *
 * @template TChipId  - The chip ID literal (must be a valid chip ID).
 * @template TVersion - The layout version literal.
 * @template TSlots   - Record of named memory slots.
 */
export type LayoutEntry<
    TChipId extends string | number,
    TVersion extends number,
    TSlots extends Record<string, MemSlot> = Record<string, MemSlot>,
> = {
    readonly chipId: TChipId;
    readonly version: TVersion;
    readonly slots: { readonly [K in keyof TSlots]: TSlots[K] };
};
