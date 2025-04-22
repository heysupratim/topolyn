import { useState } from "react";
import { format } from "date-fns";
import { Server } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
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
import { itemTypes } from "@/lib/ItemTypes";
import type { InventoryItem } from "@/context/InventoryContext";
import { useInventory } from "@/context/InventoryContext";
import { toast } from "sonner";

interface EditItemDrawerProps {
  item: InventoryItem;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditItemDrawer({
  item,
  isOpen,
  onOpenChange,
}: EditItemDrawerProps) {
  const { updateItem } = useInventory();
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
      onOpenChange(false);
      toast.success("Item updated successfully");
    } catch (error) {
      console.error("Failed to update item:", error);
      toast.error("Failed to update item");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange} direction="right">
      <DrawerContent
        className="bg-card flex h-full max-w-md flex-col py-8"
        data-vaul-no-drag
      >
        <div className="mx-auto w-full max-w-sm flex-1 overflow-y-auto">
          <DrawerHeader>
            <DrawerTitle>Edit Item Details</DrawerTitle>
            <DrawerDescription>
              Make changes to the inventory item and save when done.
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4 pb-0">
            <div className="space-y-6">
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
                <Select value={formData.type} onValueChange={handleTypeChange}>
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
                </div>
              </div>
            </div>
          </div>
        </div>
        <DrawerFooter className="bg-card sticky bottom-0 mt-auto border-t">
          <Button onClick={handleSave} disabled={isUpdating}>
            {isUpdating ? "Saving..." : "Save changes"}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
