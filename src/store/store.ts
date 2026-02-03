import { create } from 'zustand';
import configJson from '../../config/config.json'; // make sure this path exists

// Types
export interface Field {
  title: string;
  type:
  | 'number'
  | 'boolean'
  | 'text'
  | 'select'
  | 'counter'
  | 'range'
  | 'timer'
  | 'multi-select'
  | 'image';

  required: boolean;
  code: string;
  formResetBehavior: 'reset' | 'preserve' | 'increment';
  defaultValue?: any;
  description?: string;
  choices?: Record<string, string>;
  min?: number;
  max?: number;
  step?: number;
}

export interface Section {
  name: string;
  fields: Field[];
}

export interface FormData {
  title: string;
  page_title: string;
  defaultTheme: 'dark' | 'light' | 'system';
  delimiter: string;
  teamNumber: number;
  floatingField: {
    show: boolean;
    codeValue: string;
  };
  theme: {
    light: Record<string, string>;
    dark: Record<string, string>;
  };
  sections: Section[];
}

export interface QRScoutState {
  formData: FormData;
  fieldValues: { code: string; value: any }[];
  config?: any;  
  loadConfig: () => void;
}
export type Result =
  | { success: true }
  | { success: false; error: { message: string } };
export const isError = (r: Result): r is { success: false; error: { message: string } } =>
  r.success === false;

// --- TEMP BUILD SHIMS (make TS + build pass) ---

export const inputSelector =
  <T = any,>(section: string, code: string) =>
  (state: QRScoutState) => {
    // find the field definition in the config
    const sec = state.formData.sections.find(s => s.name === section);
    const field = sec?.fields.find(f => f.code === code);
    return field as unknown as T;
  };


export const updateValue = (code: string, value: any) => {
  useQRScoutState.setState(state => {
    const existing = state.fieldValues.find(f => f.code === code);
    if (existing) existing.value = value;
    else state.fieldValues.push({ code, value });
    return { fieldValues: [...state.fieldValues] };
  });
};


export const getFieldValue = (_section?: string, _code?: string) => undefined;

export const resetFields = () => {};

export const setConfig = (_cfgText: string): Result => {
  // TEMP: accept anything so build passes
  // Later: JSON.parse + validate + set state
  return { success: true };
};


// Config helpers expected by ConfigEditor.tsx
export const getConfig = () => undefined;
export type FetchConfigResult =
  | { success: true }
  | { success: false; error: { message: string } };

export const fetchConfigFromURL = async (_url: string): Promise<Result> => {
  // TEMP: not implemented yet, but returns correct shape
  return { success: false, error: { message: 'Not implemented yet' } };
};
export const resetToDefaultConfig = () => {};
export const useQRScoutState = create<QRScoutState>((set) => ({
  formData: configJson as unknown as FormData,
  fieldValues: [],
  config: configJson,
  loadConfig: () => {
    set({ formData: configJson as unknown as FormData, config: configJson });
  },
}));




