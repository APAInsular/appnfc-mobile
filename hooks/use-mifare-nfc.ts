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
        try {
            await NfcManager.requestTechnology(NfcTech.MifareUltralight);

            const bytes: number[] = [];
            for (let i = 4; i <= 28; i += 4) {
                try {
                    const pages =
                        await NfcManager.mifareUltralightHandlerAndroid.mifareUltralightReadPages(
                            i,
                        );
                    bytes.push(...Array.from(pages));
                } catch {
                    break;
                }
            }

            return new Uint8Array(bytes);
        } catch (ex) {
            setError(String(ex));
            return null;
        } finally {
            NfcManager.cancelTechnologyRequest();
            setLoading(false);
        }
    };

    return { ...state, write, read };
}
