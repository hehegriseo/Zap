import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/** Devices page — audio device configuration and virtual mic status. */
export function Devices() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Devices</h1>
      <Card>
        <CardHeader>
          <CardTitle>Audio Devices</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Device management will be implemented in Sprint 3. Configure output
            devices, input devices, and the virtual microphone.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
