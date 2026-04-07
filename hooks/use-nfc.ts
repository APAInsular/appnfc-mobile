import { useState } from "react";
import NfcManager from "react-native-nfc-manager";

export function useNFC() {
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    return { success, setSuccess, loading, setLoading, error, setError };
}

export function startNFC() {
    NfcManager.start();
}
