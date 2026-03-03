import { Copy, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useMemo } from 'react';
import { getFieldValue, useQRScoutState } from '../../store/store';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { PreviewText } from './PreviewText';

export interface QRModalProps {
  disabled?: boolean;
}

export function QRModal(props: QRModalProps) {
  const fieldValues = useQRScoutState(state => state.fieldValues);
  const formData = useQRScoutState(state => state.formData);

  // Format robot for title
  const robot = getFieldValue('robot') as any;

  const robotTitle =
    robot && typeof robot === 'object'
      ? `${robot.team ?? robot.teamNumber ?? ''}-${robot.robot ?? robot.position ?? ''}`
      : String(robot ?? '');

  const title = `${robotTitle} - M${getFieldValue('matchNumber')}`.toUpperCase();

  const qrCodeData = useMemo(() => {
    const encodeValue = (code: string, value: unknown) => {
      if (value == null) return '';

      // Special handling for robot object
      if (code === 'robot' && typeof value === 'object') {
        const r = value as any;
        const team = r.team ?? r.teamNumber ?? '';
        const pos = r.robot ?? r.position ?? r.station ?? '';
        return `${team}-${pos}`.replace(/^-|-$/g, '');
      }

      if (typeof value === 'object') {
        return JSON.stringify(value);
      }

      return String(value);
    };

    return fieldValues
      .map(f => encodeValue(f.code, f.value))
      .join(formData.delimiter);
  }, [fieldValues, formData.delimiter]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          disabled={props.disabled}
          className="bg-[hsl(var(--section))] text-[hsl(var(--section-foreground))] hover:opacity-90"
        >
          <QrCode className="size-5" />
          Commit
        </Button>
      </DialogTrigger>

      <DialogContent className="h-[95%] bg-[hsl(var(--section))] text-[hsl(var(--section-foreground))]">
        
        <DialogTitle className="text-3xl text-center font-rhr-ns tracking-wider">
          {title}
        </DialogTitle>

        <div className="flex flex-col items-center gap-6 overflow-y-scroll">
          
          <div className="bg-[hsl(var(--section))] p-4 rounded-md">
            <QRCodeSVG
              className="m-2 mt-4"
              size={256}
              value={qrCodeData}
              fgColor="black"
              bgColor="white"
            />
          </div>

          <PreviewText data={qrCodeData} />
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => navigator.clipboard.writeText(qrCodeData)}
            className="text-[hsl(var(--section-foreground))]"
          >
            <Copy className="size-4" /> Copy Data
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}
