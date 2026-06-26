import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/** Library page — browse and manage sound collections. */
export function Library() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Library</h1>
      <Card>
        <CardHeader>
          <CardTitle>Sound Library</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Sound library will be implemented in Sprint 4. Import folders of
            sounds, search, tag, and organize your collection.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
