import { create } from "zustand";
import { MedicalVitalsBundle } from "../constants/types";

interface MedicalState {
    vitalInfo: MedicalVitalsBundle | null;
    hasBeenRead: boolean;
    setVitalInfo: (data: any) => void;
}

export const useMedicalStore = create<MedicalState>((set) => ({
    vitalInfo: null,
    hasBeenRead: false,
    setVitalInfo: (data) =>
        set({
            vitalInfo: data,
            hasBeenRead: true,
        }),
}));
