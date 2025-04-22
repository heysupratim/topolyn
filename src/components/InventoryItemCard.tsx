import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { Server, Trash2 } from "lucide-react";
import { itemTypes } from "@/lib/ItemTypes";
import type { InventoryItem } from "@/context/InventoryContext";
import { useInventory } from "@/context/InventoryContext";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { EditItemDrawer } from "./EditItemDrawer";

interface InventoryItemCardProps {
  item: InventoryItem;
}

export function InventoryItemCard({ item }: InventoryItemCardProps) {
  const { deleteItem } = useInventory();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Get icon component for a given type
  const getIconForType = (type: string) => {
    const itemType = itemTypes.find((t) => t.value === type);
    if (itemType && itemType.icon) {
      const Icon = itemType.icon;
      return <Icon className="h-4 w-4" />;
    }
    return <Server className="h-4 w-4" />; // Default icon
  };

  const handleCardClick = () => {
    setIsDrawerOpen(true);
  };

  const openDeleteDialog = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteItem(item.id);
    } catch (error) {
      console.error("Failed to delete item:", error);
      toast.error("Failed to delete item");
    } finally {
      setIsDeleting(false);
      setIsDialogOpen(false);
    }
  };

  return (
    <>
      <Card
        className="min-w-xs cursor-pointer overflow-hidden p-0 transition-shadow hover:shadow-md"
        onClick={handleCardClick}
      >
        <CardContent className="px-4 py-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="truncate text-lg font-semibold">{item.name}</h3>
              <div className="text-muted-foreground mt-1 flex items-center text-sm">
                <span>{item.type}</span>
              </div>
              <div className="mt-2 text-sm">
                <div>{item.ipAddress || "No IP address"}</div>
                <div className="text-muted-foreground mt-2 text-xs">
                  Added: {format(new Date(item.createdAt), "PPP")}
                </div>
              </div>
            </div>
            <div className="bg-muted ml-4 rounded-md p-2">
              {getIconForType(item.type)}
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            <Button
              variant="secondary"
              size="sm"
              onClick={openDeleteDialog}
              className={`group flex items-center justify-center overflow-hidden pr-0! pl-2! ${isDialogOpen ? "expanded" : ""}`}
            >
              <Trash2 className="h-4 w-4" />
              <span
                className={`mr-1 overflow-hidden transition-all duration-300 ease-in-out ${isDialogOpen ? "max-w-xs" : "max-w-0 group-hover:mr-2 group-hover:max-w-xs"}`}
              >
                Remove
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {item.name}? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Removing..." : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <EditItemDrawer
        item={item}
        isOpen={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
      />
    </>
  );
}
