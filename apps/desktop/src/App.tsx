import { Routes, Route } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { Soundboard } from "./pages/Soundboard";

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/*" element={<Soundboard />} />
      </Route>
    </Routes>
  );
}
