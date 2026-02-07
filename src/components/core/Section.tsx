import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

type SectionProps = {
  children?: React.ReactNode;
  title?: string;
};

export function Section(props: SectionProps) {
  return (
    <Card className="text-foreground">
      <CardHeader className="pb-2">
        {props.title && (
          <CardTitle className="font-rhr-ns text-foreground">
            {props.title}
          </CardTitle>
        )}
      </CardHeader>
      <CardContent className="p-2 pt-0">
        <div className="flex flex-col gap-4">{props.children}</div>
      </CardContent>
    </Card>
  );
}
