import { useEffect } from "react";
import NfcManager, { NfcTech } from "react-native-nfc-manager";
import { startNFC, useNFC } from "./use-nfc";

export default function useMifareNFC() {
    const state = useNFC();
    const { setLoading, setError, setSuccess } = state;

    useEffect(() => {
        startNFC();
    }, []);

    const write = async (data: Uint8Array): Promise<void> => {
        setLoading(true);
        try {
            await NfcManager.requestTechnology(NfcTech.MifareUltralight);

            for (let i = 0; i < data.length; i += 4) {
                const padded = new Uint8Array(4);
                padded.set(data.slice(i, i + 4));
                await NfcManager.mifareUltralightHandlerAndroid.mifareUltralightWritePage(
                    4 + Math.floor(i / 4),
                    Array.from(padded),
                );
            }

            setSuccess(true);
        } catch (ex) {
            setError(String(ex));
        } finally {
            NfcManager.cancelTechnologyRequest();
            setLoading(false);
        }
    };

    const read = async (): Promise<Uint8Array | null> => {
        setLoading(true);
        console.log("[NFC] Iniciando lectura...");
        try {
            console.log("[NFC] Solicitando tecnología MifareUltralight...");
            await NfcManager.requestTechnology(NfcTech.MifareUltralight);
            console.log("[NFC] Tecnología concedida");

            const bytes: number[] = [];

            for (let page = 4; page < 44; page += 4) {
                console.log(`[NFC] Leyendo página ${page}...`);
                const pages =
                    await NfcManager.mifareUltralightHandlerAndroid.mifareUltralightReadPages(
                        page,
                    );
                console.log(`[NFC] Página ${page}:`, pages);

                if (pages && pages.length > 0) {
                    bytes.push(...Array.from(pages));
                } else {
                    console.log(`[NFC] Página ${page} vacía, parando`);
                    break;
                }
            }

            console.log(`[NFC] Total bytes: ${bytes.length}`, bytes);
            setSuccess(true);
            return new Uint8Array(bytes);
        } catch (ex) {
            console.error("[NFC] Error:", ex);
            setError(String(ex));
            return null;
        } finally {
            await NfcManager.cancelTechnologyRequest().catch((e) =>
                console.warn("[NFC] Cancel error:", e),
            );
            setLoading(false);
        }
    };
    return { ...state, write, read };
}
