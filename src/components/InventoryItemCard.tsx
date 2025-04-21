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

interface InventoryItemCardProps {
  item: InventoryItem;
}

export function InventoryItemCard({ item }: InventoryItemCardProps) {
  const { deleteItem } = useInventory();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Get icon component for a given type
  const getIconForType = (type: string) => {
    const itemType = itemTypes.find((t) => t.value === type);
    if (itemType && itemType.icon) {
      const Icon = itemType.icon;
      return <Icon className="h-6 w-6" />;
    }
    return <Server className="h-6 w-6" />; // Default icon
  };

  const openDeleteDialog = () => {
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteItem(item.id);
    } catch (error) {
      console.error("Failed to delete item:", error);
    } finally {
      setIsDeleting(false);
      setIsDialogOpen(false);
    }
  };

  return (
    <>
      <Card className="overflow-hidden hover:shadow-md transition-shadow p-0 min-w-xs">
        <CardContent className="px-4 py-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-lg truncate">{item.name}</h3>
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <span>{item.type}</span>
              </div>
              <div className="mt-2 text-sm">
                <div>{item.ipAddress || "No IP address"}</div>
                <div className="text-xs text-muted-foreground mt-2">
                  Added: {format(new Date(item.createdAt), "PPP")}
                </div>
              </div>
            </div>
            <div className="ml-4 p-2 bg-muted rounded-md">
              {getIconForType(item.type)}
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            <Button
              variant="secondary"
              size="sm"
              onClick={openDeleteDialog}
              className="flex items-center gap-1"
            >
              <Trash2 className="h-4 w-4" />
              Remove
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
    </>
  );
}
