import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/** About page — application information and credits. */
export function About() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">About</h1>
      <Card>
        <CardHeader>
          <CardTitle>Zap Soundboard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-muted-foreground">
            A modern, PipeWire-native, open-source soundboard for Linux.
          </p>
          <p className="text-sm text-muted-foreground">Version 0.1.0</p>
          <p className="text-sm text-muted-foreground">
            Licensed under the MIT License.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
