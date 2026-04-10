import { LayoutType, LayoutVersion } from "./layouts";

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

type MedicalLayoutTypeValue = (typeof LayoutType)[keyof typeof LayoutType];
type MedicalLayoutVersionValue =
    (typeof LayoutVersion)[keyof typeof LayoutVersion];
