import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { PlusCircle } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import AddItemDialog from "./AddItemDialog";
import { useInventory } from "@/context/InventoryContext";

export function AppHeader() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { refreshInventory } = useInventory();

  const handleItemAdded = () => {
    // Use the context's refresh function instead of dispatching an event
    refreshInventory();
  };

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b py-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">Inventory</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button
            title="Quick Create"
            variant="default"
            onClick={() => setIsDialogOpen(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
          >
            <PlusCircle />
            <span>Add Item</span>
          </Button>
        </div>
      </div>
      <AddItemDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onItemAdded={handleItemAdded}
      />
    </header>
  );
}
