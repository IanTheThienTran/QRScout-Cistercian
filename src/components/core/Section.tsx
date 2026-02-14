import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"

type SectionProps = {
  children?: React.ReactNode
  title?: string
}

export function Section(props: SectionProps) {
  return (
    <Card>
      <CardHeader className="pb-2 bg-[hsl(var(--section))] text-[hsl(var(--section-foreground))]">
        {props.title && (
          <CardTitle className="font-rhr-ns">
            {props.title}
          </CardTitle>
        )}
      </CardHeader>

      <CardContent className="p-2 pt-0 text-foreground">
        <div className="flex flex-col gap-4">
          {props.children}
        </div>
      </CardContent>
    </Card>
  )
}