import { useMedicalStore } from '@/constants/app.store';
import useVitalInfo from '@/hooks/use-vital-info';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const TEAL = '#3D9A96';
const TEAL_DARK = '#2C7A76';
const BG = '#F0F2F1';
const INPUT_BG = '#F5F6F6';
const BORDER = '#E2E6E5';
const TEXT = '#1A2421';
const MUTED = '#7A8F8D';


export default function LoginScreen() {
  // ? Load stuff while user signin
  const { data: vitalInfo, loading: loadingVitalInfo } = useVitalInfo();
  const { setVitalInfo, hasBeenRead } = useMedicalStore();

  useEffect(() => {
    if (!loadingVitalInfo && vitalInfo && !hasBeenRead) {
      setVitalInfo(vitalInfo);
    }
  }, [vitalInfo, loadingVitalInfo, hasBeenRead]);

  // ? Login screen
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [pressing, setPressing] = useState(false);

  const buttonScale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    setPressing(true);
    Animated.spring(buttonScale, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const onPressOut = () => {
    setPressing(false);
    Animated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handleConfirmar = () => {
    router.push('/vital_info_screen');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.container}>
          <View style={styles.card}>
            <View style={styles.logoContainer}>
              <Image
                source={require('@/assets/images/logo.png')}
                style={styles.logo}
                contentFit="contain"
              />
            </View>

            <Text style={styles.subtitle}>Iniciar sesión</Text>

            <View style={styles.form}>
              <View style={[
                styles.inputWrapper,
                focusedField === 'usuario' && styles.inputWrapperFocused,
              ]}>
                <Text style={styles.inputLabel}>Usuario</Text>
                <TextInput
                  style={styles.input}
                  placeholder="ej: x23xz6"
                  placeholderTextColor={MUTED}
                  value={usuario}
                  onChangeText={setUsuario}
                  autoCapitalize="none"
                  autoCorrect={false}
                  onFocus={() => setFocusedField('usuario')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>


              <View style={[
                styles.inputWrapper,
                focusedField === 'contrasena' && styles.inputWrapperFocused,
              ]}>
                <Text style={styles.inputLabel}>Contraseña</Text>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={MUTED}
                  value={contrasena}
                  onChangeText={setContrasena}
                  secureTextEntry
                  autoCapitalize="none"
                  onFocus={() => setFocusedField('contrasena')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>

              <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                <View style={styles.securityNote}>
                  <Text style={styles.securityText}>
                    La sesión se cerrará automáticamente según el horario de la clínica seleccionada.
                  </Text>
                </View>
                <Pressable
                  style={[styles.button, pressing && styles.buttonActive]}
                  onPress={handleConfirmar}
                  onPressIn={onPressIn}
                  onPressOut={onPressOut}
                >
                  <Text style={styles.buttonText}>Confirmar</Text>
                </Pressable>
              </Animated.View>

            </View>
          </View>

          <Text style={styles.footer}>Q-Vida v1.0.0</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    paddingHorizontal: 8,
    paddingVertical: 36,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 200,
    height: 72,
  },
  subtitle: {
    fontSize: 13,
    color: MUTED,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 24,
    fontWeight: '500',
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
  input: {
    fontSize: 15,
    color: TEXT,
    padding: 0,
  },
  button: {
    height: 52,
    backgroundColor: TEAL,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  buttonActive: {
    backgroundColor: TEAL_DARK,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  forgotText: {
    textAlign: 'center',
    color: TEAL,
    fontSize: 13,
    fontWeight: '500',
  },
  footer: {
    marginTop: 32,
    color: MUTED,
    fontSize: 12,
    letterSpacing: 0.4,
  },
  securityNote: {
  flexDirection: 'row',
  alignItems: 'flex-start',
  backgroundColor: '#EEF7F6',
  borderRadius: 8,
  paddingHorizontal: 12,
  paddingVertical: 10,
  gap: 8,
},
securityIcon: {
  fontSize: 13,
  marginTop: 1,
},
securityText: {
  flex: 1,
  fontSize: 12,
  color: MUTED,
  lineHeight: 18,
},
});