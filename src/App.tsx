import { InventoryProvider } from "@/context/InventoryContext";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/ThemeProvider";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { InventoryView } from "@/components/InventoryView";
import { MapView } from "@/components/MapView";

export default function App() {
  return (
    <ThemeProvider>
      <InventoryProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Navigate to="/inventory" replace />} />
              <Route path="inventory" element={<InventoryView />} />
              <Route path="map" element={<MapView />} />
            </Route>
          </Routes>
          <Toaster position="bottom-center" />
        </BrowserRouter>
      </InventoryProvider>
    </ThemeProvider>
  );
}
