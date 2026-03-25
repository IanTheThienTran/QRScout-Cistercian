import { useMemo } from 'react';
import { getFieldValue, updateValue, useQRScoutState } from '../../store/store';
import { Section } from '../core/Section';
import ConfigurableInput from '../inputs/ConfigurableInput';
import InputCard from '../inputs/InputCard';

type FormSectionProps = {
  name: string;
};

type Hotspot = {
  key: string;
  value: string;
  left: string;
  top: string;
};

export default function FormSection(props: FormSectionProps) {
  const formData = useQRScoutState(state => state.formData);

  const section = useMemo(
    () => formData.sections.find(s => s.name === props.name),
    [formData, props.name],
  );

  const inputs = useMemo(() => section?.fields ?? [], [section]);

  const startPosValue = useQRScoutState(() => getFieldValue('startPos') ?? '');

  const handleSelect = (value: string) => {
    updateValue('startPos', value);
  };

  const hotspots: Hotspot[] = [
    { key: 'R1', value: 'R1', left: '32.5%', top: '12%' },
    { key: 'R2', value: 'R2', left: '28%', top: '20%' },
    { key: 'R3', value: 'R3', left: '28%', top: '35%' },
    { key: 'R4', value: 'R4', left: '28%', top: '51%' },
    { key: 'R5', value: 'R5', left: '28%', top: '63%' },
    { key: 'R6', value: 'R6', left: '28%', top: '75%' },
    { key: 'R7', value: 'R7', left: '32.5%', top: '88%' },

    { key: 'B7', value: 'B7', left: '64%', top: '12%' },
    { key: 'B6', value: 'B6', left: '68.5%', top: '20%' },
    { key: 'B5', value: 'B5', left: '68.5%', top: '35%' },
    { key: 'B4', value: 'B4', left: '68.5%', top: '51%' },
    { key: 'B3', value: 'B3', left: '68.5%', top: '63%' },
    { key: 'B2', value: 'B2', left: '68.5%', top: '75%' },
    { key: 'B1', value: 'B1', left: '64%', top: '88%' },
  ];

  return (
    <Section title={props.name}>
      {inputs.map(input => {
        const currentValue = getFieldValue(input.code);
        const hasValue =
          currentValue !== undefined &&
          currentValue !== null &&
          currentValue !== '';

        if (input.code === 'startPos') {
          return (
            <InputCard
              key={input.code}
              title={input.title}
              description={input.description}
              required={Boolean(input.required)}
              hasValue={hasValue}
            >
              <div className="mb-2">
                <div className="relative w-full overflow-hidden rounded-md border">
                  <img
                    src="field.png"
                    alt="Starting Position Field"
                    className="w-full select-none"
                    draggable={false}
                  />

                  {hotspots.map(spot => {
                    const selected = startPosValue === spot.value;

                    return (
                      <button
                        key={spot.key}
                        type="button"
                        onClick={() => handleSelect(spot.value)}
                        title={spot.key}
                       className={`absolute rounded-full transition ${
  selected
    ? 'border-2 border-green-500 bg-green-500/50'
    : spot.key.startsWith('R')
      ? 'border-2 border-red-500 bg-red-500/20 hover:bg-red-500/40'
      : 'border-2 border-blue-500 bg-blue-500/20 hover:bg-blue-500/40'
}`}
                        style={{
                          left: spot.left,
                          top: spot.top,
                          width: '6%',
                          height: '8%',
                          transform: 'translate(-50%, -50%)',
                        }}
                      />
                    );
                  })}
                </div>

                <div className="mt-2 text-sm">
                  Selected:
                  <span className="ml-1 font-semibold">
                    {startPosValue || 'None'}
                  </span>
                </div>
              </div>
            </InputCard>
          );
        }

        return (
          <InputCard
            key={input.code}
            title={input.title}
            description={input.description}
            required={Boolean(input.required)}
            hasValue={hasValue}
          >
            <ConfigurableInput
              section={props.name}
              code={input.code}
              type={input.type}
            />
          </InputCard>
        );
      })}
    </Section>
  );
}