import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/** Logs page — application log viewer. */
export function Logs() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Logs</h1>
      <Card>
        <CardHeader>
          <CardTitle>Log Viewer</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Log viewer will be implemented in Sprint 8. View, filter, and search
            application logs for debugging.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
