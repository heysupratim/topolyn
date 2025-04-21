import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { InventoryTable } from "@/components/InventoryTable";
import { InventoryProvider } from "@/context/InventoryContext";

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
                className="flex flex-col gap-4 py-4 px-8 md:gap-6 md:py-6"
              >
                <InventoryTable />
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </InventoryProvider>
  );
}
