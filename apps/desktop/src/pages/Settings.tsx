import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/** Settings page — application configuration. */
export function Settings() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Application Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Full settings UI will be implemented in Sprint 7. Configure audio,
            hotkeys, themes, and profiles.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
