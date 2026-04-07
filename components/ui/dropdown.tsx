import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const TEAL = '#3D9A96';
const INPUT_BG = '#F5F6F6';
const BORDER = '#E2E6E5';
const TEXT = '#1A2421';
const MUTED = '#7A8F8D';

const OPCIONES = ['Opción 1', 'Opción 2', 'Opción 3'];

export function Dropdown({ label, opciones = OPCIONES }: { label: string; opciones?: string[] }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <View>
      <Pressable
        style={[styles.inputWrapper, open && styles.inputWrapperFocused]}
        onPress={() => setOpen(true)}
      >
        <Text style={styles.inputLabel}>{label}</Text>
        <View style={styles.row}>
          <Text style={[styles.value, !selected && styles.placeholder]}>
            {selected ?? 'Seleccionar'}
          </Text>
          <Text style={styles.chevron}>{open ? '▲' : '▼'}</Text>
        </View>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <View style={styles.menu}>
            <ScrollView bounces={false}>
              {opciones.map((op) => (
                <Pressable
                  key={op}
                  style={[styles.option, selected === op && styles.optionSelected]}
                  onPress={() => { setSelected(op); setOpen(false); }}
                >
                  <Text style={[styles.optionText, selected === op && styles.optionTextSelected]}>
                    {op}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  inputWrapper: {
    backgroundColor: INPUT_BG,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: BORDER,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
  },
  inputWrapperFocused: {
    borderColor: TEAL,
    backgroundColor: '#F0FAF9',
  },
  inputLabel: {
    fontSize: 11,
    color: MUTED,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  value: {
    fontSize: 15,
    color: TEXT,
  },
  placeholder: {
    color: MUTED,
  },
  chevron: {
    fontSize: 10,
    color: MUTED,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.15)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  menu: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    maxHeight: 280,
  },
  option: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  optionSelected: {
    backgroundColor: '#F0FAF9',
  },
  optionText: {
    fontSize: 15,
    color: TEXT,
  },
  optionTextSelected: {
    color: TEAL,
    fontWeight: '600',
  },
});