import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { Server, Plus, X, Check, ChevronsUpDown } from "lucide-react";
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
  Command,
  CommandInput,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { cn } from "@/lib/Utils";

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
  const [openCombobox, setOpenCombobox] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);

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
    setOpenCombobox(null);
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
  // Also filter out items that are already selected
  const getAvailableItems = (currentIndex: number) => {
    return items
      .filter(
        (i) =>
          i.id !== formData.id &&
          !linkedItems.some(
            (linkId, idx) => linkId === i.id && idx !== currentIndex,
          ),
      )
      .filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.type.toLowerCase().includes(searchQuery.toLowerCase()),
      );
  };

  // Get item name by id
  const getItemNameById = (id: string) => {
    const item = items.find((i) => i.id === id);
    return item ? item.name : "Unknown item";
  };

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
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Linked Items</Label>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleAddLink}
                      className="flex items-center gap-1"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add</span>
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
                          <Popover
                            open={openCombobox === index}
                            onOpenChange={(open) => {
                              setOpenCombobox(open ? index : null);
                              setSearchQuery("");
                            }}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                ref={triggerRef}
                                role="combobox"
                                aria-expanded={openCombobox === index}
                                className="flex-1 justify-between bg-transparent"
                              >
                                {linkedItemId ? (
                                  <div className="flex items-center">
                                    {getIconForType(
                                      items.find((i) => i.id === linkedItemId)
                                        ?.type || "",
                                    )}
                                    <span className="ml-2">
                                      {getItemNameById(linkedItemId)}
                                    </span>
                                  </div>
                                ) : (
                                  "Select an item to link"
                                )}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="p-0"
                              align="start"
                              side="bottom"
                              sideOffset={4}
                              style={{
                                width: triggerRef.current?.offsetWidth
                                  ? `${triggerRef.current.offsetWidth}px`
                                  : "auto",
                              }}
                            >
                              <Command>
                                <CommandInput
                                  placeholder="Search items..."
                                  className="h-9"
                                  value={searchQuery}
                                  onValueChange={setSearchQuery}
                                />
                                <CommandList className="max-h-[300px] w-full overflow-y-auto scroll-auto">
                                  <CommandEmpty>
                                    No matching items found.
                                  </CommandEmpty>
                                  <CommandGroup>
                                    {getAvailableItems(index).map((item) => (
                                      <CommandItem
                                        key={item.id}
                                        value={item.id}
                                        onSelect={(currentValue) => {
                                          handleLinkChange(index, currentValue);
                                          setOpenCombobox(null);
                                          setSearchQuery("");
                                        }}
                                        className="flex items-center gap-2"
                                      >
                                        {getIconForType(item.type)}
                                        <div className="flex flex-col gap-1">
                                          <span className="">{item.name}</span>
                                          <span className="text-muted-foreground text-xs">
                                            ({item.type})
                                          </span>
                                        </div>
                                        <Check
                                          className={cn(
                                            "ml-auto h-4 w-4",
                                            linkedItemId === item.id
                                              ? "opacity-100"
                                              : "opacity-0",
                                          )}
                                        />
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
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
