import { MedicalVitalsBundle } from "@/core/medical";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface MedicalState {
    vitalInfo: MedicalVitalsBundle | null;
    hasBeenRead: boolean;
    setVitalInfo: (data: MedicalVitalsBundle) => void;
    reset: () => void;
}

export const useMedicalStore = create<MedicalState>()(
    persist(
        (set) => ({
            vitalInfo: null,
            hasBeenRead: false,

            setVitalInfo: (data) =>
                set({
                    vitalInfo: data,
                    hasBeenRead: true,
                }),

            reset: () =>
                set({
                    vitalInfo: null,
                    hasBeenRead: false,
                }),
        }),
        {
            name: "medical-store",
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                vitalInfo: state.vitalInfo,
                hasBeenRead: state.hasBeenRead,
            }),
        },
    ),
);
