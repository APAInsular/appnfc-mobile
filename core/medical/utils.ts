import {
    MedicalRecord,
    MedicalVitalsBundle,
    MedicalVitalsByStandard,
} from "./types";

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
