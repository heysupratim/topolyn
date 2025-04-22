import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Server, Plus, X } from "lucide-react";
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
  const { updateItem, items, addItemLink, removeItemLink } = useInventory();
  const [formData, setFormData] = useState<InventoryItem>({ ...item });
  const [isUpdating, setIsUpdating] = useState(false);
  const [linkedItems, setLinkedItems] = useState<string[]>([]);
  const [initialLinkedItems, setInitialLinkedItems] = useState<string[]>([]);

  // Get icon component for a given type
  const getIconForType = (type: string) => {
    const itemType = itemTypes.find((t) => t.value === type);
    if (itemType && itemType.icon) {
      const Icon = itemType.icon;
      return <Icon className="h-4 w-4" />;
    }
    return <Server className="h-4 w-4" />; // Default icon
  };

  // Initialize linked items from the current item
  useEffect(() => {
    if (item && item.linkedToItems) {
      const linkedIds = item.linkedToItems.map((linkedItem) => linkedItem.id);
      setLinkedItems(linkedIds);
      setInitialLinkedItems(linkedIds);
    }
  }, [item]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, type: value }));
  };

  const handleAddLink = () => {
    setLinkedItems([...linkedItems, ""]);
  };

  const handleLinkChange = (index: number, value: string) => {
    const newLinkedItems = [...linkedItems];
    newLinkedItems[index] = value;
    setLinkedItems(newLinkedItems);
  };

  const handleRemoveLink = (index: number) => {
    const newLinkedItems = [...linkedItems];
    newLinkedItems.splice(index, 1);
    setLinkedItems(newLinkedItems);
  };

  const handleSave = async () => {
    try {
      setIsUpdating(true);

      // First update the item details
      await updateItem(formData);

      // Process item links
      const itemsToAdd = linkedItems.filter(
        (id) => id && !initialLinkedItems.includes(id),
      );
      const itemsToRemove = initialLinkedItems.filter(
        (id) => !linkedItems.includes(id),
      );

      // Add new links
      for (const linkedItemId of itemsToAdd) {
        if (linkedItemId) {
          await addItemLink(formData.id, linkedItemId);
        }
      }

      // Remove deleted links
      for (const linkedItemId of itemsToRemove) {
        await removeItemLink(formData.id, linkedItemId);
      }

      onOpenChange(false);
      toast.success("Item updated successfully");
    } catch (error) {
      console.error("Failed to update item:", error);
      toast.error("Failed to update item");
    } finally {
      setIsUpdating(false);
    }
  };

  // Check if the current item is a router or switch
  const isNetworkDevice =
    formData.type === "Router" || formData.type === "Switch";

  // Filter out the current item from available items to link
  const availableItems = items.filter((i) => i.id !== formData.id);

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange} direction="right">
      <DrawerContent
        className="bg-card flex h-full flex-col px-1 py-8 data-[vaul-drawer-direction=right]:sm:max-w-sm"
        data-vaul-no-drag
      >
        <div className="mx-auto w-full flex-1 overflow-y-auto">
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

              {/* Link Nodes Section - Only show for Router and Switch types */}
              {isNetworkDevice && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Linked Nodes</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddLink}
                      className="flex items-center gap-1"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add Link</span>
                    </Button>
                  </div>

                  {linkedItems.length === 0 ? (
                    <div className="text-muted-foreground py-2 text-sm">
                      No links added. Click "Add Link" to connect this device to
                      other items.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {linkedItems.map((linkedItemId, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Select
                            value={linkedItemId}
                            onValueChange={(value) =>
                              handleLinkChange(index, value)
                            }
                          >
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="Select an item to link" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableItems.map((item) => (
                                <SelectItem key={item.id} value={item.id}>
                                  <div className="flex items-center gap-2">
                                    {getIconForType(item.type)}
                                    <span>{item.name}</span>
                                    <span className="text-muted-foreground text-xs">
                                      ({item.type})
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveLink(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

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
