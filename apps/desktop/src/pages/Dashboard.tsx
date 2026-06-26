import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ping } from "@/lib/tauri";
import { useState } from "react";

/** Dashboard page — quick access, recently played, favorites. */
export function Dashboard() {
  const [pong, setPong] = useState<string | null>(null);

  const handlePing = async () => {
    const response = await ping();
    setPong(response);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>IPC Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Click to test the Rust backend communication path.
            </p>
            <Button onClick={handlePing}>Ping Rust</Button>
            {pong && (
              <p className="text-sm font-mono text-green-500">{pong}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Quick Play</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No sounds in library yet. Import sounds to get started.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Device Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Virtual microphone status will appear here.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
