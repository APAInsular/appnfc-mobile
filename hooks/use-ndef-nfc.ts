import { useEffect } from "react";
import NfcManager, { Ndef, NfcTech, TagEvent } from "react-native-nfc-manager";
import { startNFC, useNFC } from "./use-nfc";

export default function useNdefNFC() {
    const state = useNFC();
    const { setLoading, setError, setSuccess } = state;

    useEffect(() => {
        startNFC();
    }, []);

    const readNFC = async (): Promise<TagEvent | null> => {
        setLoading(true);
        try {
            await NfcManager.requestTechnology(NfcTech.Ndef);
            const tag = await NfcManager.getTag();
            setSuccess(true);
            return tag;
        } catch (ex) {
            setError(String(ex));
            return null;
        } finally {
            NfcManager.cancelTechnologyRequest();
            setLoading(false);
        }
    };

    const writeNFC = async (data: string): Promise<void> => {
        setLoading(true);
        try {
            const bytes = Ndef.encodeMessage([Ndef.textRecord(data)]);

            try {
                await NfcManager.requestTechnology(NfcTech.Ndef);
                if (bytes) await NfcManager.ndefHandler.writeNdefMessage(bytes);
            } catch {
                await NfcManager.cancelTechnologyRequest();
                await NfcManager.requestTechnology(NfcTech.NdefFormatable);
                if (bytes)
                    await NfcManager.ndefFormatableHandlerAndroid.formatNdef(
                        bytes,
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

    return { ...state, readNFC, writeNFC };
}
