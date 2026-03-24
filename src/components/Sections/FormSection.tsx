import { useQRScoutState, getFieldValue, updateValue } from '../../store/store';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

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

  const section = formData.sections.find(s => s.name === props.name);

  const hasStartPosField =
    section?.fields?.some(field => field.code === 'startPos') ?? false;

  const startPosValue = useQRScoutState(() => getFieldValue('startPos') ?? '');

  const handleSelect = (value: string) => {
    updateValue('startPos', value);
  };

  const hotspots: Hotspot[] = [
    { key: 'R1', value: 'R1', left: '28%', top: '8%' },
    { key: 'R2', value: 'R2', left: '24%', top: '18%' },
    { key: 'R3', value: 'R3', left: '24%', top: '30%' },
    { key: 'R4', value: 'R4', left: '24%', top: '42%' },
    { key: 'R5', value: 'R5', left: '24%', top: '54%' },
    { key: 'R6', value: 'R6', left: '24%', top: '66%' },
    { key: 'R7', value: 'R7', left: '28%', top: '78%' },

    { key: 'B7', value: 'B7', left: '64%', top: '8%' },
    { key: 'B6', value: 'B6', left: '68%', top: '18%' },
    { key: 'B5', value: 'B5', left: '68%', top: '30%' },
    { key: 'B4', value: 'B4', left: '68%', top: '42%' },
    { key: 'B3', value: 'B3', left: '68%', top: '54%' },
    { key: 'B2', value: 'B2', left: '68%', top: '66%' },
    { key: 'B1', value: 'B1', left: '64%', top: '78%' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{props.name}</CardTitle>
      </CardHeader>

      <CardContent className="p-2 pt-0">
        {hasStartPosField && (
          <div className="mb-3">
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
                        ? 'border-2 border-green-500 bg-green-500/40'
                        : 'border-2 border-transparent bg-transparent hover:border-white'
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
        )}

        <div className="flex flex-col gap-4">
          {/* your existing inputs render here */}
        </div>
      </CardContent>
    </Card>
  );
}