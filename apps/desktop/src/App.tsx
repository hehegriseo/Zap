import { Routes, Route } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { Dashboard } from "./pages/Dashboard";
import { Library } from "./pages/Library";
import { Devices } from "./pages/Devices";
import { Settings } from "./pages/Settings";
import { Logs } from "./pages/Logs";
import { About } from "./pages/About";

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/library" element={<Library />} />
        <Route path="/devices" element={<Devices />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/logs" element={<Logs />} />
        <Route path="/about" element={<About />} />
      </Route>
    </Routes>
  );
}
