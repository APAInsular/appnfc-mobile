import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import useNFC from "@/hooks/use-nfc";
import { useState } from "react";
import { Button, StyleSheet, View } from "react-native";

const DATA = "a1b2c3d4,Juan GL,j.g@ej.com,612345678,Mad,28001,T,R,N,P,87"

export default function HomeScreen() {
  const { error, loading, readMifareUltraLight, writeMifareUltraLight } = useNFC();
  const [status, setStatus] = useState<"idle" | "reading" | "writing" | "done">("idle");
  const [result, setResult] = useState<object | null>(null);

  const handleRead = async () => {
    setStatus("reading");
    setResult(null);
    const text = await readMifareUltraLight();
    if (text) {
      setResult({ raw: text });

    }
    setStatus("done");
  };

  const handleWrite = async () => {
    setStatus("writing");
    setResult(null);
    await writeMifareUltraLight(JSON.stringify(DATA));
    setStatus("done");
  };

  const statusLabel: Record<typeof status, string> = {
    idle: "Acerca la tag y pulsa un botón",
    reading: "Leyendo tag...",
    writing: "Escribiendo tag...",
    done: "Completado",
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">NFC Test</ThemedText>

      <ThemedText style={styles.status}>{statusLabel[status]}</ThemedText>

      {error && <ThemedText style={styles.error}>{error}</ThemedText>}

      {result && (
        <ThemedText style={styles.result}>
          {JSON.stringify(result, null, 2)}
        </ThemedText>
      )}

      <View style={styles.buttons}>
        <Button title="Leer" onPress={handleRead} disabled={loading} />
        <Button title="Escribir" onPress={handleWrite} disabled={loading} />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  status: { marginVertical: 12, fontSize: 16 },
  error: { color: "red", marginBottom: 8 },
  result: { fontFamily: "monospace", fontSize: 12, marginVertical: 12 },
  buttons: { flexDirection: "row", gap: 16, marginTop: 16 },
});