import { Button } from '@/components/ui/button';

export type CommitButtonProps = {
  onClick: () => void;
  disabled: boolean;
};

export function CommitButton(props: CommitButtonProps) {
  return (
    <Button
      onClick={props.onClick}
      disabled={props.disabled}
      className="bg-[hsl(var(--section))] text-[hsl(var(--section-foreground))] hover:opacity-90"
    >
      Commit
    </Button>
  );
}
