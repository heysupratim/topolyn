import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { InventoryTable } from "@/components/InventoryTable";
import { InventoryProvider } from "@/context/InventoryContext";
import { Toaster } from "@/components/ui/sonner";

export default function App() {
  return (
    <InventoryProvider>
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <AppHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div
                id="nodelist"
                className="flex flex-col gap-4 px-4 py-4 md:gap-6 md:py-6 lg:gap-2 lg:px-6"
              >
                <InventoryTable />
              </div>
            </div>
          </div>
        </SidebarInset>
        <Toaster position="bottom-right" />
      </SidebarProvider>
    </InventoryProvider>
  );
}
