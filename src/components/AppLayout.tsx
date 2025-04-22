import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Outlet } from "react-router-dom";
import { AnimatedRoutes } from "@/components/AnimatedRoutes";

export function AppLayout() {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <AppHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div
              id="content-area"
              className="flex flex-1 flex-col overflow-hidden"
            >
              <AnimatedRoutes>
                <Outlet />
              </AnimatedRoutes>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
