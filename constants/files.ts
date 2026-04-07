import { File, Paths } from "expo-file-system";

const base = Paths.document.uri;

if (!base) {
    throw new Error("Unable to access the device document directory.");
}

export const FILE_ES_CIE11 = `${base}CIE11.ES.txt`;
export const FILE_ES_ISBT128 = `${base}ISBT128.ES.txt`;
export const FILE_ES_SNOMEDCT = `${base}SNOMEDCT.ES.txt`;

export const FILE_EN_CIE11 = `${base}CIE11.EN.txt`;
export const FILE_EN_ISBT128 = `${base}ISBT128.EN.txt`;
export const FILE_EN_SNOMEDCT = `${base}SNOMEDCT.EN.txt`;

export async function saveMedicalFile(
    path: string,
    content: string,
): Promise<void> {
    const file = new File(path);
    if (!file.exists) {
        file.create();
    }
    file.write(content);
}

export async function readMedicalFile(path: string): Promise<string | null> {
    const file = new File(path);
    if (!file.exists) {
        return null;
    }
    return file.textSync();
}
