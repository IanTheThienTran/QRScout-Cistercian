import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ListRestart } from 'lucide-react';
import { resetFields } from '../../../store/store';
import { Modal } from '@/components/core/Modal';

export type ResetButtonProps = {
  disabled?: boolean;
};

export function ResetButton(props: ResetButtonProps) {
  const [showModal, setShowModal] = useState(false);

  const onConfirm = () => {
    resetFields();
    setShowModal(false);
  };

  const onCancel = () => {
    setShowModal(false);
  };

  return (
    <>
      <Button
        variant="default"
        onClick={() => setShowModal(true)}
        disabled={props.disabled}
        className="bg-[hsl(var(--section))] text-[hsl(var(--section-foreground))] hover:opacity-90"
      >
        <ListRestart className="h-5 w-5" />
        Reset Form
      </Button>

      <Modal show={showModal} onDismiss={onCancel}>
        <div className="p-4 bg-[hsl(var(--section))] text-[hsl(var(--section-foreground))] rounded-lg">
          <h2 className="font-semibold text-3xl text-[hsl(var(--section-foreground))] text-center font-rhr-ns tracking-wider">
            Confirm Reset
          </h2>

          <p className="mt-2 text-[hsl(var(--section-foreground))]">
            Are you sure you want to reset the form?
          </p>

          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={onCancel}
              className="w-full sm:w-auto border-[hsl(var(--section-foreground))] text-[hsl(var(--section-foreground))]"
            >
              No
            </Button>

            <Button
              onClick={onConfirm}
              className="w-full sm:w-auto bg-[hsl(var(--section))] text-[hsl(var(--section-foreground))] hover:opacity-90"
            >
              Yes
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

