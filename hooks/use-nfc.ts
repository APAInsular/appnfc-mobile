import { useEffect, useState } from "react";
import NfcManager, { Ndef, NfcTech, TagEvent } from "react-native-nfc-manager";

export default function useNFC() {
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        NfcManager.start();
    }, []);

    const readNFC = async (): Promise<TagEvent | null> => {
        setLoading(true);
        try {
            // register for the NFC tag with NDEF in it
            await NfcManager.requestTechnology(NfcTech.Ndef);

            // the resolved tag object will contain `ndefMessage` property
            const tag = await NfcManager.getTag();
            console.warn("Tag found", tag);
            setSuccess(true);
            return tag;
        } catch (ex) {
            setError(String(ex));
            console.error("Oops!", ex);
            return null;
        } finally {
            // stop the nfc scanning
            NfcManager.cancelTechnologyRequest();
            setLoading(false);
        }
    };

    const writeNFC = async (data: string): Promise<void> => {
        setLoading(true);
        try {
            const bytes = Ndef.encodeMessage([Ndef.textRecord(data)]);

            try {
                console.warn("Writing...");
                await NfcManager.requestTechnology(NfcTech.Ndef);
                if (bytes) await NfcManager.ndefHandler.writeNdefMessage(bytes);
            } catch (error) {
                console.error(error);
                console.warn(
                    "Formatting... Move the device away and then place it back down.",
                );
                await NfcManager.cancelTechnologyRequest();
                await NfcManager.requestTechnology(NfcTech.NdefFormatable);
                if (bytes)
                    await NfcManager.ndefFormatableHandlerAndroid.formatNdef(
                        bytes,
                    );
            } finally {
                console.warn("Formatted..");
            }

            setSuccess(true);
        } catch (ex) {
            setError(String(ex));
        } finally {
            NfcManager.cancelTechnologyRequest();
            setLoading(false);
        }
    };

    const writeMifareUltraLight = async (data: string): Promise<void> => {
        setLoading(true);
        try {
            const bytes = Ndef.encodeMessage([Ndef.textRecord(data)]);
            if (!bytes) throw new Error("encode failed");

            try {
                await NfcManager.requestTechnology(NfcTech.Ndef);
                await NfcManager.ndefHandler.writeNdefMessage(bytes);
                console.warn("Written as Ndef");
            } catch {
                await NfcManager.cancelTechnologyRequest();
                await NfcManager.requestTechnology(NfcTech.MifareUltralight);

                for (let i = 0; i < bytes.length; i += 4) {
                    const padded = new Uint8Array(4);
                    padded.set(bytes.slice(i, i + 4));
                    await NfcManager.mifareUltralightHandlerAndroid.mifareUltralightWritePage(
                        4 + Math.floor(i / 4),
                        Array.from(padded),
                    );
                }

                console.warn("Written as MifareUltralight");
            }

            setSuccess(true);
        } catch (ex) {
            setError(String(ex));
            console.error(ex);
        } finally {
            NfcManager.cancelTechnologyRequest();
            setLoading(false);
        }
    };

    const readMifareUltraLight = async (): Promise<string | null> => {
        setLoading(true);
        let result: string | null = null;
        try {
            await NfcManager.requestTechnology(NfcTech.MifareUltralight);

            const bytes: number[] = [];
            for (let i = 6; i <= 28; i += 4) {
                try {
                    const pages =
                        await NfcManager.mifareUltralightHandlerAndroid.mifareUltralightReadPages(
                            i,
                        );
                    bytes.push(...Array.from(pages));
                } catch (e) {
                    console.log("Fin de memoria alcanzado en bloque " + i);
                    break;
                }
            }

            const dataLimpia = String.fromCharCode(...bytes).split("\0")[0];

            console.log("Tu CSV Real:", dataLimpia);

            // Ahora recuperas los campos:
            const campos = dataLimpia.split(",");
            console.log("ID:", campos[0]);
            console.log("Nombre:", campos[1]);
        } catch (ex) {
            setError(String(ex));
            console.error(ex);
        } finally {
            NfcManager.cancelTechnologyRequest();
            setLoading(false);
        }
        return result;
    };

    return {
        loading,
        error,
        success,
        readNFC,
        writeNFC,
        writeMifareUltraLight,
        readMifareUltraLight,
    };
}
