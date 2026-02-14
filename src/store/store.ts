import { produce } from 'immer';
import { cloneDeep } from 'lodash';
import configJson from '../../config/config.json'; // keep YOUR config path
import {
  ActionTrackerInputData,
  Config,
  configSchema,
  InputBase,
} from '../components/inputs/BaseInputProps';
import { MatchData } from '../types/matchData';
import { createStore } from './createStore';

export type Result<T = void> =
  | { success: true; data?: T }
  | { success: false; error: Error };

export const isError = (
  r: Result<any>,
): r is { success: false; error: Error } => r.success === false;

/**
 * Safe default config (deep clone so we don't mutate imported JSON)
 */
function getDefaultConfig(): Config {
  return cloneDeep(configJson) as Config;
}

/**
 * Generates field values for a config, including dynamic fields for action-tracker inputs.
 */
function generateFieldValues(config: Config): { code: string; value: any }[] {
  const fieldValues: { code: string; value: any }[] = [];

  for (const section of config.sections) {
    for (const field of section.fields) {
      if (field.type === 'action-tracker') {
        const actionField = field as ActionTrackerInputData;
        for (const action of actionField.actions) {
          fieldValues.push({
            code: `${field.code}_${action.code}_count`,
            value: 0,
          });
          fieldValues.push({
            code: `${field.code}_${action.code}_times`,
            value: '',
          });
        }
      } else {
        fieldValues.push({
          code: field.code,
          value: field.defaultValue,
        });
      }
    }
  }

  return fieldValues;
}

export interface QRScoutState {
  formData: Config;
  fieldValues: { code: string; value: any }[];
  showQR: boolean;
  matchData?: MatchData[];

  // ✅ app.tsx expects these:
  config: Config;
  loadConfig: () => void;
}

const initialConfig = getDefaultConfig();

const initialState: QRScoutState = {
  formData: initialConfig,
  config: initialConfig,
  fieldValues: generateFieldValues(initialConfig),
  showQR: false,
  matchData: undefined,
  loadConfig: () => {}, // will be overwritten right after store creation
};

// ✅ createStore needs a name (your error said so)
export const useQRScoutState = createStore(initialState, 'qrscout');

// ✅ now define loadConfig in the real store
useQRScoutState.setState(state => ({
  ...state,
  loadConfig: () => {
    const cfg = getDefaultConfig();
    setFormData(cfg);
    useQRScoutState.setState({ config: cfg });
  },
}));

/**
 * Read a field value by code
 */
export function getFieldValue(code: string) {
  return useQRScoutState
    .getState()
    .fieldValues.find(f => f.code === code)?.value;
}

/**
 * Update a field value by code (your inputs call this)
 */
export function updateValue(code: string, value: any) {
  useQRScoutState.setState(
    produce((state: QRScoutState) => {
      const existing = state.fieldValues.find(f => f.code === code);
      if (existing) existing.value = value;
      else state.fieldValues.push({ code, value });
    }),
  );
}

/**
 * Used by inputs to get their config data
 */
export function inputSelector<T extends InputBase>(
  section: string,
  code: string,
): (state: QRScoutState) => T | undefined {
  return (state: QRScoutState) => {
    const field = state.formData.sections
      .find(s => s.name === section)
      ?.fields.find(f => f.code === code);

    return (field as T) ?? undefined;
  };
}

/**
 * Reset events used by your components
 */
export function resetFields() {
  window.dispatchEvent(new CustomEvent('resetFields', { detail: 'reset' }));
}

export function forceResetFields() {
  window.dispatchEvent(
    new CustomEvent('forceResetFields', { detail: 'forceReset' }),
  );
}

/**
 * Replace the form config + regenerate field values
 */
export function setFormData(config: Config) {
  const oldState = useQRScoutState.getState();
  forceResetFields();
  const newFieldValues = generateFieldValues(config);

  useQRScoutState.setState({
    ...oldState,
    fieldValues: newFieldValues,
    formData: config,
  });
}

/**
 * ConfigEditor uses this
 */
export function getConfig() {
  return useQRScoutState.getState().formData;
}

/**
 * Parse + validate config JSON, then apply
 */
export function setConfig(configText: string): Result<void> {
  let jsonData: any;
  try {
    jsonData = JSON.parse(configText);
  } catch (e: any) {
    return {
      success: false,
      error: e instanceof Error ? e : new Error(String(e)),
    };
  }

  const parsed = configSchema.safeParse(jsonData);
  if (!parsed.success) {
    return { success: false, error: new Error(parsed.error.message) };
  }

  setFormData(parsed.data);
  return { success: true };
}

/**
 * Load config from URL (ConfigEditor uses this)
 */
export async function fetchConfigFromURL(url: string): Promise<Result<void>> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch config from URL: ${response.status} ${response.statusText}`,
      );
    }
    const configText = await response.text();
    return setConfig(configText);
  } catch (error: any) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

/**
 * Reset config to default JSON
 */
export function resetToDefaultConfig(): Result<void> {
  const cfg = getDefaultConfig();
  setFormData(cfg);
  useQRScoutState.setState({ config: cfg });
  return { success: true };
}

export function setMatchData(matchData: MatchData[]) {
  useQRScoutState.setState({ matchData });
}