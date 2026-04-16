import { useMedicalStore } from '@/constants/app.store';
import { MemoryChip } from '@/core/chip';
import { findVitalByFileIndex, LAYOUT_V1, LayoutV1Values, LayoutVersion, MedicalRecord } from '@/core/medical';
import useNdefNFC from '@/hooks/use-ndef-nfc';
import { Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';



const BG = '#FFFFFF';
const INPUT_BG = '#F9F9F9';
const BORDER = '#E5E5E5';
const MUTED = '#8E8E93';
const TEXT = '#1C1C1E';
const TEAL = '#1CA49C';
const TEAL_LIGHT = '#EEF7F6';

const bigIntTo8Bytes = (n: bigint): Uint8Array => {
  const buf = new Uint8Array(8);
  const view = new DataView(buf.buffer);
  view.setBigUint64(0, n, false); // false para Big-Endian (estándar en red/chips)
  return buf;
};


const bytesToBigInt = (bytes: Uint8Array): bigint => {
  let result = 0n;
  for (const b of bytes) {
    result = (result << 8n) + BigInt(b);
  }
  return result;
};

const bytesToNum = (bytes: Uint8Array): number => {
  return Array.from(bytes).reduce((acc, byte) => (acc << 8) + byte, 0);
};


const tel1Bytes = bigIntTo8Bytes(34600112233n);
const tel2Bytes = bigIntTo8Bytes(34644556677n);
const placeholderData: LayoutV1Values = {
  type: 1,
  version: LayoutVersion.Medical,
  phones: new Uint8Array([0, 0, 0, 0, 0, 0, 0, 7, 0, 0, 0, 0, 0, 0, 0, 9]),
  isbt128: 5,
  cie11: new Uint8Array([1, 2, 3, 0, 0, 0, 0]),
  snomedct: new Uint8Array([4, 6, 8, 10, 0, 0, 0]),
  other: new Uint8Array([1, 3, 5, 7, 9, 0, 0]),
};



export default function VitalInfoScreen() {
  const { vitalInfo } = useMedicalStore();

  const [CIE11, setCIE11] = useState<MedicalRecord[]>([]);
  const [SNOMEDCT, setSNOMEDCT] = useState<MedicalRecord[]>([]);
  const [ISBT128, setISBT128] = useState<MedicalRecord[]>([]);

  // const { loading, error, success, read, write } = useMifareNFC();
  const { loading, error, success, read, write } = useNdefNFC();
  useEffect(() => {

    const writeData = async () => {
      const mem = MemoryChip.fromValues(
        "MifareUltralightEV1_128B",
        LAYOUT_V1,
        placeholderData
      );

      const payload = mem.dump();

      try {
        await write(payload);
      } catch (e) {
        console.log("Retrying after format...");
        await write(payload);
      }
    };
    const readData = async () => {
      read().then((ndef_result) => {
        console.log("[PARSE] data recibida:", ndef_result);
        if (!ndef_result) {
          console.log("[PARSE] data es null, abortando");
          return;
        }

        const rawBytes = ndef_result.data!;
        console.log("[PARSE] rawBytes completo:", Array.from(rawBytes));



        console.log("[PARSE] alignedData:", Array.from(rawBytes));

        const mem = MemoryChip.fromData(
          "MifareUltralightEV1_128B",
          LAYOUT_V1,
          rawBytes
        );
        console.log("[PARSE] MemoryChip creado:", mem);


        try {
          mem.setLock(true);
          const map = mem.readMap();
          console.log(map);


          const newISBT: MedicalRecord[] = [];
          const newCIE11: MedicalRecord[] = [];
          const newSNOMED: MedicalRecord[] = [];

          if (map.isbt128 !== 0) {
            const v = findVitalByFileIndex(vitalInfo, 'en', 'isbt128', map.isbt128);
            if (v) newISBT.push(v);
          }

          map.cie11.forEach((id) => {
            if (id === 0) return;
            const v = findVitalByFileIndex(vitalInfo, 'en', 'cie11', id);
            if (v) newCIE11.push(v);
          });

          map.snomedct.forEach((id) => {
            if (id === 0) return;
            const v = findVitalByFileIndex(vitalInfo, 'en', 'snomedct', id);
            if (v) newSNOMED.push(v);
          });

          setISBT128(newISBT);
          setCIE11(newCIE11);
          setSNOMEDCT(newSNOMED);

        } catch (err) {
          console.error("Error procesando los u8:", err);
        } finally {
          mem.setLock(false);
        }
      });
    }


    //writeData()
    readData();

  }, []);

  const getRecordsByStandard = (standard: "ISBT128" | "CIE11" | "SNOMEDCT"): string[] => {
    const allRecords = [...CIE11, ...SNOMEDCT, ...ISBT128];

    const matches = allRecords
      .filter(r => r && r.estandar === standard);

    if (matches.length === 0) return ["Sin registros"];

    return matches.map(m => m.description);
  };

  const bloodRecords = getRecordsByStandard("ISBT128");
  const isPageLoading = loading;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>

          <View style={styles.logoContainer}>
            <View style={styles.avatarCircle}>
              <Feather name="user" size={40} color={TEAL} />
            </View>
            <Text style={styles.mainTitle}>Pepito Pérez</Text>
            <Text style={styles.subtitle}>Información Médica Vital</Text>
          </View>

          {isPageLoading && (
            <View style={styles.statusCenter}>
              <ActivityIndicator size="large" color={TEAL} />
              <Text style={styles.footer}>Leyendo tarjeta...</Text>
            </View>
          )}

          {/* ESTADO: ERROR */}
          {(error) && !isPageLoading && (
            <View style={styles.statusCenter}>
              <Feather name="alert-circle" size={48} color="#FF5252" />
              <Text style={[styles.mainTitle, { marginTop: 12 }]}>Error de lectura</Text>
              <Text style={styles.footer}>{error || "No se pudo obtener la información"}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={read}>
                <Text style={styles.buttonText}>Reintentar lectura</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ESTADO: ÉXITO / MOSTRAR DATOS */}
          {(success || vitalInfo) && !isPageLoading && (
            <View style={styles.card}>
              <View style={styles.form}>
                <View style={styles.bloodBanner}>
                  <Feather name="droplet" size={18} color="#FF5252" />
                  <Text style={styles.bloodText}>
                    SANGRE / FACTOR: <Text style={styles.bloodValueText}>
                      {getRecordsByStandard("ISBT128").join(', ')}
                    </Text>
                  </Text>
                </View>

                <InfoField
                  label="Enfermedades y Condiciones (CIE11)"
                  values={getRecordsByStandard("CIE11")}
                />

                <InfoField
                  label="Alertas e Implantes (SNOMEDCT)"
                  values={getRecordsByStandard("SNOMEDCT")}
                />
              </View>

              <View style={styles.divider} />
              <Text style={styles.sectionTitle}>Contactos de emergencia</Text>

              <View style={styles.form}>
                <ContactItem name="Juan Pérez" role="Padre" phone="+34 612 34 56 78" />
                <ContactItem name="María López" role="Hermana" phone="+34 698 76 54 32" />
              </View>
            </View>
          )}

          <Text style={styles.footer}>
            {isPageLoading ? "Procesando..." : "Q-Vida v1.0.0 • Sincronizado"}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
const InfoField = ({ label, values }: { label: string, values: string[] }) => (
  <View style={styles.inputWrapper}>
    <Text style={styles.inputLabel}>{label}</Text>
    <View style={styles.listContainer}>
      {values.map((item, index) => (
        <View
          key={`${label}-${index}`}
          style={[
            styles.badge,
            (item === "Sin registros" || item === "___") && {
              backgroundColor: 'transparent',
              borderColor: 'transparent',
              paddingHorizontal: 0
            }
          ]}
        >
          <Text style={[
            styles.inputValue,
            (item === "Sin registros" || item === "___") && { color: MUTED }
          ]}>
            {item}
          </Text>
        </View>
      ))}
    </View>
  </View>
);

// Sub-componente para los contactos
const ContactItem = ({ name, role, phone }: { name: string, role: string, phone: string }) => (
  <TouchableOpacity style={styles.contactCard}>
    <View style={{ flex: 1 }}>
      <Text style={styles.inputLabel}>{role}</Text>
      <Text style={styles.inputValue}>{name}</Text>
      <Text style={styles.contactPhone}>{phone}</Text>
    </View>
    <View style={styles.callButton}>
      <Feather name="phone" size={20} color="#FFF" />
    </View>
  </TouchableOpacity>
);


const styles = StyleSheet.create({
  statusCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: TEAL,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
  safeArea: {
    flex: 1,
    backgroundColor: BG,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: TEAL_LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: TEAL,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: TEXT,
  },
  subtitle: {
    fontSize: 12,
    color: MUTED,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 4,
    fontWeight: '500',
  },
  card: {
    width: '100%',
    paddingVertical: 10,
  },
  bloodBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    borderRadius: 10,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#FFE0E0',
    gap: 12,
  },
  bloodText: {
    fontSize: 11,
    fontWeight: '700',
    color: MUTED,
    letterSpacing: 0.6,
  },
  bloodValueText: {
    fontSize: 16,
    color: '#FF5252',
    fontWeight: '800',
  },
  form: {
    gap: 14,
  },
  inputWrapper: {
    backgroundColor: INPUT_BG,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: BORDER,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputLabel: {
    fontSize: 11,
    color: MUTED,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  listContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  badge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BORDER,
  },
  inputValue: {
    fontSize: 15,
    color: TEXT,
    fontWeight: '500',
  },
  divider: {
    height: 1.5,
    backgroundColor: BORDER,
    marginVertical: 24,
    width: '100%',
  },
  sectionTitle: {
    fontSize: 13,
    color: MUTED,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 16,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: INPUT_BG,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: BORDER,
    padding: 16,
    marginBottom: 10,
  },
  contactPhone: {
    fontSize: 14,
    color: TEAL,
    fontWeight: '700',
    marginTop: 2,
  },
  callButton: {
    width: 48,
    height: 48,
    borderRadius: 10, // Mantenemos el estilo cuadrado redondeado del login
    backgroundColor: TEAL,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    marginTop: 32,
    textAlign: 'center',
    color: MUTED,
    fontSize: 12,
    letterSpacing: 0.4,
    paddingBottom: 30,
  },
});