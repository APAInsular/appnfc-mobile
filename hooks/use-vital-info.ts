import {
    FILE_EN_CIE11,
    FILE_EN_ISBT128,
    FILE_EN_SNOMEDCT,
    FILE_ES_CIE11,
    FILE_ES_ISBT128,
    FILE_ES_SNOMEDCT,
    readMedicalFile,
    saveMedicalFile,
} from "@/constants/files";
import { MedicalRecord, MedicalVitalsBundle } from "@/constants/types";
import { useEffect, useMemo, useState } from "react";

// Bundled assets que simulan la descarga remota
const ASSETS = {
    en: {
        cie11: require("@/assets/info/CIE11.EN.txt"),
        isbt128: require("@/assets/info/ISBT128.EN.txt"),
        snomedct: require("@/assets/info/SNOMEDCT.EN.txt"),
    },
    es: {
        cie11: require("@/assets/info/CIE11.ES.txt"),
        isbt128: require("@/assets/info/ISBT128.ES.txt"),
        snomedct: require("@/assets/info/SNOMEDCT.ES.txt"),
    },
};

/**
 * Parses a medical flat-file database into structured records.
 *
 * @param content - Raw file content with the following format:
 *   - Line 1: `LANG|STANDARD` metadata header (e.g., `es-ES|ISBT128`)
 *   - Line 2+: `CODE;DESCRIPTION` semicolon-separated values (e.g., `95;A Rh Positivo`)
 *
 * @returns Ordered array of {@link MedicalRecord} objects.
 *
 * @example
 * const records = parseMedicalFlatFile("es-ES|ISBT128\n95;A Rh Positivo");
 */
function parseMedicalFile(content: string): MedicalRecord[] {
    const lines = content.split("\n");
    if (lines.length < 2) return [];

    const [lang, estandar] = lines[0].trim().split("|") as [
        MedicalRecord["lang"],
        MedicalRecord["estandar"],
    ];

    const records: MedicalRecord[] = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const [code, description] = line.split(";");
        records.push({ code, description, lang, estandar, index: i - 1 });
    }

    return records;
}

async function readAsset(asset: number): Promise<string> {
    const { Asset } = await import("expo-asset");
    const [loaded] = await Asset.loadAsync(asset);
    const response = await fetch(loaded.uri);
    return response.text();
}

export default function useVitalInfo() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<MedicalVitalsBundle | null>(null);

    useEffect(() => {
        const checkRemoteUpdate = async () => {
            try {
                const needsUpdate = await checkIfServerHasNewVersion();
                if (needsUpdate) {
                    await fetchData();
                } else {
                    const local = await loadLocalFiles();
                    setData(local);
                }
            } catch (e) {
                setError("Error synchronizing data: " + String(e));
            }
        };

        checkRemoteUpdate();
    }, []);

    const cached = useMemo(() => data, [data]);

    const loadLocalFiles = async (): Promise<MedicalVitalsBundle> => {
        const [enCie11, enIsbt128, enSnomedct, esCie11, esIsbt128, esSnomedct] =
            await Promise.all([
                readMedicalFile(FILE_EN_CIE11),
                readMedicalFile(FILE_EN_ISBT128),
                readMedicalFile(FILE_EN_SNOMEDCT),
                readMedicalFile(FILE_ES_CIE11),
                readMedicalFile(FILE_ES_ISBT128),
                readMedicalFile(FILE_ES_SNOMEDCT),
            ]);

        return {
            en: {
                cie11: parseMedicalFile(enCie11 ?? ""),
                isbt128: parseMedicalFile(enIsbt128 ?? ""),
                snomedct: parseMedicalFile(enSnomedct ?? ""),
            },
            es: {
                cie11: parseMedicalFile(esCie11 ?? ""),
                isbt128: parseMedicalFile(esIsbt128 ?? ""),
                snomedct: parseMedicalFile(esSnomedct ?? ""),
            },
        };
    };

    const updateLocalFiles = async (): Promise<void> => {
        const [enCie11, enIsbt128, enSnomedct, esCie11, esIsbt128, esSnomedct] =
            await Promise.all([
                readAsset(ASSETS.en.cie11),
                readAsset(ASSETS.en.isbt128),
                readAsset(ASSETS.en.snomedct),
                readAsset(ASSETS.es.cie11),
                readAsset(ASSETS.es.isbt128),
                readAsset(ASSETS.es.snomedct),
            ]);

        await Promise.all([
            saveMedicalFile(FILE_EN_CIE11, enCie11),
            saveMedicalFile(FILE_EN_ISBT128, enIsbt128),
            saveMedicalFile(FILE_EN_SNOMEDCT, enSnomedct),
            saveMedicalFile(FILE_ES_CIE11, esCie11),
            saveMedicalFile(FILE_ES_ISBT128, esIsbt128),
            saveMedicalFile(FILE_ES_SNOMEDCT, esSnomedct),
        ]);
    };

    const fetchData = async (): Promise<void> => {
        setLoading(true);
        try {
            await updateLocalFiles();
            setData(await loadLocalFiles());
        } catch (e) {
            setError(String(e));
        } finally {
            setLoading(false);
        }
    };

    return { data: cached, loading, error, reload: fetchData };
}

async function checkIfServerHasNewVersion(): Promise<boolean> {
    // TODO: implementar ETag o Last-Modified
    return true; // Fuerza descarga desde assets en cada arranque mientras tanto
}
