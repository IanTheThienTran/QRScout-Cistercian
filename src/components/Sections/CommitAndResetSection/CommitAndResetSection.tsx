import { QRModal } from '@/components/QR';
import { useMemo } from 'react';
import { getFieldValue, useQRScoutState } from '../../../store/store';
import { Section } from '../../core/Section';
import { ResetButton } from './ResetButton';

export function CommitAndResetSection() {
  const formData = useQRScoutState(state => state.formData);
  const fieldValues = useQRScoutState(state => state.fieldValues);
  useQRScoutState(state => state.fieldValues);

  const requiredFields = useMemo(() => {
    return formData.sections
      .map(s => s.fields)
      .flat()
      .filter(f => f.required)
      .map(f => f.code);
  }, [formData]);

  const missingRequiredFields = useMemo(() => {
    return fieldValues
      .filter(f => requiredFields.includes(f.code))
      .some(f => f.value === undefined || f.value === '' || f.value === null);
  }, [requiredFields, fieldValues]);

  const noShow = Boolean(getFieldValue('noShow'));

  const qrDisabled = missingRequiredFields && !noShow;

  return (
    <Section>
      <QRModal disabled={qrDisabled} />
      <ResetButton />
    </Section>
  );
}
