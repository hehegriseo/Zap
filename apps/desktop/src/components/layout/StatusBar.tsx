/** Status bar at the bottom of the application window. */
export function StatusBar() {
  return (
    <footer className="flex h-8 items-center border-t px-4 text-xs text-muted-foreground">
      <span>Zap v0.1.0</span>
      <span className="mx-2">|</span>
      <span>No sounds loaded</span>
    </footer>
  );
}
