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
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface InventoryItemCardProps {
  item: InventoryItem;
}

export function InventoryItemCard({ item }: InventoryItemCardProps) {
  const { deleteItem, updateItem } = useInventory();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [formData, setFormData] = useState<InventoryItem>({ ...item });
  const [isUpdating, setIsUpdating] = useState(false);

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
    setFormData({ ...item });
  };

  const openDeleteDialog = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    setIsDialogOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, type: value }));
  };

  const handleSave = async () => {
    try {
      setIsUpdating(true);
      await updateItem(formData);
      setIsDrawerOpen(false);
      toast.success("Item updated successfully");
    } catch (error) {
      console.error("Failed to update item:", error);
      toast.error("Failed to update item");
    } finally {
      setIsUpdating(false);
    }
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

      <Drawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        direction="right"
      >
        <DrawerContent className="max-w-md">
          <div className="mx-auto w-full max-w-sm">
            <DrawerHeader>
              <DrawerTitle>Edit Item Details</DrawerTitle>
              <DrawerDescription>
                Make changes to the inventory item and save when done.
              </DrawerDescription>
            </DrawerHeader>
            <div className="p-4 pb-0">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={handleTypeChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a type" />
                    </SelectTrigger>
                    <SelectContent>
                      {itemTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            {getIconForType(type.value)}
                            <span>{type.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ipAddress">IP Address</Label>
                  <Input
                    id="ipAddress"
                    name="ipAddress"
                    value={formData.ipAddress || ""}
                    onChange={handleChange}
                    placeholder="IP Address"
                  />
                </div>

                <div className="mt-4 space-y-1">
                  <h4 className="text-muted-foreground text-sm font-medium">
                    Item Information
                  </h4>
                  <Separator />

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="font-medium">Created</div>
                    <div>{format(new Date(item.createdAt), "PPP")}</div>

                    <div className="font-medium">Updated</div>
                    <div>{format(new Date(item.updatedAt), "PPP")}</div>

                    <div className="font-medium">ID</div>
                    <div className="truncate">{item.id}</div>
                  </div>
                </div>
              </div>
            </div>
            <DrawerFooter className="pt-2">
              <Button onClick={handleSave} disabled={isUpdating}>
                {isUpdating ? "Saving..." : "Save changes"}
              </Button>
              <DrawerClose asChild>
                <Button variant="outline">Cancel</Button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
