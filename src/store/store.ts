import { produce } from 'immer';
import { cloneDeep } from 'lodash';
import configJson from '../../config/config.json'; // <-- YOUR config path
import {
  ActionTrackerInputData,
  Config,
  configSchema,
  InputBase,
} from '../components/inputs/BaseInputProps';
import { MatchData } from '../types/matchData';
import { Result as UpstreamResult } from '../types/result';
import { createStore } from './createStore';

export type Result<T = void> =
  | { success: true; data?: T }
  | { success: false; error: Error };

// If upstream already has a Result type you want to keep using,
// you can switch all Result<T> uses to UpstreamResult<T> and delete our Result above.
// For now, this matches the shape your ConfigEditor expects: result.success + result.error.message

export const isError = (r: Result<any>): r is { success: false; error: Error } =>
  r.success === false;

/**
 * Safe default config (deep clone so we don't mutate imported JSON)
 */
function getDefaultConfig(): Config {
  // If your configJson is missing required fields per configSchema,
  // fix the JSON rather than loosening types.
  return cloneDeep(configJson) as Config;
}

/**
 * Generates field values for a config, including dynamic fields for action-tracker inputs.
 * For action-tracker, creates _count and _times fields for each action.
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
}

const initialConfig = getDefaultConfig();

const initialState: QRScoutState = {
  formData: initialConfig,
  fieldValues: generateFieldValues(initialConfig),
  showQR: false,
};

export const useQRScoutState = createStore(initialState);

/**
 * Read a field value by code
 */
export function getFieldValue(code: string) {
  return useQRScoutState.getState().fieldValues.find(f => f.code === code)?.value;
}

/**
 * Update a field value by code (your inputs call this)
 */
export function updateValue(code: string, value: any) {
  useQRScoutState.setState(
    produce((state: QRScoutState) => {
      const existing = state.fieldValues.find(f => f.code === code);
      if (existing) {
        existing.value = value;
      } else {
        state.fieldValues.push({ code, value });
      }
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
 * ConfigEditor expects: { success: true } OR { success:false, error: Error }
 */
export function setConfig(configText: string): Result<void> {
  let jsonData: any;
  try {
    jsonData = JSON.parse(configText);
  } catch (e: any) {
    return { success: false, error: e instanceof Error ? e : new Error(String(e)) };
  }

  const parsed = configSchema.safeParse(jsonData);
  if (!parsed.success) {
    // parsed.error is a ZodError; wrap to ensure .message exists
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
      throw new Error(`Failed to fetch config from URL: ${response.status} ${response.statusText}`);
    }
    const configText = await response.text();
    return setConfig(configText);
  } catch (error: any) {
    return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
  }
}

/**
 * Reset config to default JSON
 */
export function resetToDefaultConfig(): Result<void> {
  setFormData(getDefaultConfig());
  return { success: true };
}

export function setMatchData(matchData: MatchData[]) {
  useQRScoutState.setState({ matchData });
}
