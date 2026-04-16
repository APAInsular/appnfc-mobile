import { useEffect } from "react";
import NfcManager, {
    Ndef,
    NdefRecord,
    NfcTech,
    TagEvent,
} from "react-native-nfc-manager";
import { startNFC, useNFC } from "./use-nfc";

export type NFCReadResult = {
    tag: TagEvent;
    records: NdefRecord[];
    aar?: NdefRecord;
    payload?: NdefRecord;
    data?: Uint8Array | null;
};

const bytesToString = (bytes: number[]) => String.fromCharCode(...bytes);

export default function useNdefNFC() {
    const state = useNFC();
    const { setLoading, setError, setSuccess } = state;

    useEffect(() => {
        startNFC();
    }, []);

    const read = async (): Promise<NFCReadResult | null> => {
        setLoading(true);
        try {
            await NfcManager.requestTechnology(NfcTech.Ndef);
            const tag = await NfcManager.getTag();
            const records = tag?.ndefMessage ?? [];

            // DEBUG: See exactly what is inside every record

            // 1. Buscar el AAR (Record 0)
            const aar = records.find(
                (r) =>
                    r.tnf === Ndef.TNF_EXTERNAL_TYPE &&
                    bytesToString(r.type as number[]) === "android.com:pkg",
            );

            // 2. Buscar tu Data (Record 1)
            const payloadRecord = records.find(
                (r) =>
                    r.tnf === Ndef.TNF_MIME_MEDIA &&
                    bytesToString(r.type as number[]) ===
                        "application/octet-stream",
            );

            let data: Uint8Array | null = null;

            if (payloadRecord?.payload) {
                const raw = payloadRecord.payload as number[];
                if (Array.isArray(raw)) {
                    data = new Uint8Array(raw);
                }
            }
            setSuccess(true);
            return { tag: tag!, records, aar, payload: payloadRecord, data };
        } catch (ex) {
            setError(String(ex));
            return null;
        } finally {
            NfcManager.cancelTechnologyRequest();
            setLoading(false);
        }
    };
    const write = async (data: Uint8Array): Promise<void> => {
        setLoading(true);
        try {
            const bytes = Ndef.encodeMessage([
                Ndef.androidApplicationRecord("com.platitasoftware.qvida"),
                Ndef.record(
                    Ndef.TNF_MIME_MEDIA,
                    "application/octet-stream",
                    [],
                    Array.from(data),
                ),
            ]);

            console.log("NFC: Writing bytes: ", bytes);

            try {
                console.log("NFC: Writing NDEF");
                await NfcManager.requestTechnology(NfcTech.Ndef);

                if (bytes) {
                    await NfcManager.ndefHandler.writeNdefMessage(bytes);
                }
            } catch {
                console.log(
                    "NFC Write failed, trying to format, please try again...",
                );

                await NfcManager.cancelTechnologyRequest();

                await NfcManager.requestTechnology(NfcTech.NdefFormatable);

                if (bytes) {
                    await NfcManager.ndefFormatableHandlerAndroid.formatNdef(
                        bytes,
                    );
                }
                console.log("Finished formatting");
            } finally {
                console.log("Finished");
            }

            setSuccess(true);
        } catch (ex) {
            setError(String(ex));
        } finally {
            NfcManager.cancelTechnologyRequest();
            setLoading(false);
        }
    };

    return { ...state, read, write };
}
