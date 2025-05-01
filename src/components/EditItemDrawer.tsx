import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { Server, Plus, X, Check, ChevronsUpDown, Trash2 } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { itemTypes } from "@/lib/ItemTypes";
import { LINK_TYPES, NETWORK_DEVICE_TYPES } from "@/lib/LinkTypes";
import type { InventoryItem, ItemLink } from "@/context/InventoryContext";
import { useInventory } from "@/context/InventoryContext";
import { toast } from "sonner";
import { cn } from "@/lib/Utils";

interface EditItemDrawerProps {
  item: InventoryItem;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

// Interface for link state with both target and type
interface LinkState {
  targetItemId: string;
  linkType: string;
  port?: string; // Optional port field for the link
  linkId?: string; // Existing link ID, if available
}

export function EditItemDrawer({
  item,
  isOpen,
  onOpenChange,
}: EditItemDrawerProps) {
  const {
    updateItem,
    items,
    addItemLink,
    updateItemLink,
    removeItemLink,
    deleteItem,
    getItemLinks,
  } = useInventory();
  const [formData, setFormData] = useState<InventoryItem>({ ...item });
  const [isUpdating, setIsUpdating] = useState(false);
  const [itemLinks, setItemLinks] = useState<LinkState[]>([]);
  const [initialItemLinks, setInitialItemLinks] = useState<LinkState[]>([]);
  const [openCombobox, setOpenCombobox] = useState<number | null>(null);
  const [openLinkTypeSelect, setOpenLinkTypeSelect] = useState<number | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [linkTypeFilter, setLinkTypeFilter] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const linkTypeTriggerRef = useRef<HTMLButtonElement>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Get icon component for a given type
  const getIconForType = (type: string) => {
    const itemType = itemTypes.find((t) => t.value === type);
    if (itemType && itemType.icon) {
      const Icon = itemType.icon;
      return <Icon className="h-4 w-4" />;
    }
    return <Server className="h-4 w-4" />; // Default icon
  };

  // Update form data whenever the item changes
  useEffect(() => {
    if (item) {
      setFormData({ ...item });
    }
  }, [item]);

  // Initialize links from the current item
  useEffect(() => {
    if (item && item.outgoingLinks) {
      const links = item.outgoingLinks.map((link) => ({
        targetItemId: link.targetItemId,
        linkType: link.linkType,
        port: link.port,
        linkId: link.id,
      }));
      setItemLinks(links);
      setInitialItemLinks(links);
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
    setItemLinks([...itemLinks, { targetItemId: "", linkType: LINK_TYPES[0] }]);
  };

  const handleLinkTargetChange = (index: number, targetItemId: string) => {
    const newItemLinks = [...itemLinks];
    newItemLinks[index] = {
      ...newItemLinks[index],
      targetItemId,
    };
    setItemLinks(newItemLinks);
    setOpenCombobox(null);
  };

  const handleLinkTypeChange = (index: number, linkType: string) => {
    const newItemLinks = [...itemLinks];
    newItemLinks[index] = {
      ...newItemLinks[index],
      linkType,
    };
    setItemLinks(newItemLinks);
    setOpenLinkTypeSelect(null);
  };

  const handleRemoveLink = (index: number) => {
    const newItemLinks = [...itemLinks];
    newItemLinks.splice(index, 1);
    setItemLinks(newItemLinks);
  };

  const handleSave = async () => {
    try {
      setIsUpdating(true);

      // First update the item details
      await updateItem(formData);

      // Process link changes
      // Find links to add (new items)
      const linksToAdd = itemLinks.filter(
        (link) =>
          link.targetItemId &&
          !initialItemLinks.some(
            (initLink) => initLink.targetItemId === link.targetItemId,
          ),
      );

      // Find links to update (existing items with changed link type or port)
      const linksToUpdate = itemLinks.filter((link) => {
        const matchingInitialLink = initialItemLinks.find(
          (initLink) => initLink.targetItemId === link.targetItemId,
        );
        return (
          matchingInitialLink &&
          (matchingInitialLink.linkType !== link.linkType ||
            matchingInitialLink.port !== link.port) &&
          matchingInitialLink.linkId
        );
      });

      // Find links to remove (items no longer in the list)
      const linksToRemove = initialItemLinks.filter(
        (initLink) =>
          !itemLinks.some(
            (link) => link.targetItemId === initLink.targetItemId,
          ) && initLink.linkId,
      );

      // Add new links
      for (const link of linksToAdd) {
        if (link.targetItemId) {
          await addItemLink(
            formData.id,
            link.targetItemId,
            link.linkType,
            link.port,
          );
        }
      }

      // Update changed links
      for (const link of linksToUpdate) {
        const matchingInitialLink = initialItemLinks.find(
          (initLink) => initLink.targetItemId === link.targetItemId,
        );
        if (matchingInitialLink?.linkId) {
          await updateItemLink(
            formData.id,
            matchingInitialLink.linkId,
            link.linkType,
            link.port,
          );
        }
      }

      // Remove deleted links
      for (const link of linksToRemove) {
        if (link.linkId) {
          await removeItemLink(formData.id, link.linkId);
        }
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

  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      // First, get all links associated with this item
      const links = await getItemLinks(item.id);

      // Remove all links associated with this item
      if (links && links.length > 0) {
        const linkDeletionPromises = links.map(async (link: ItemLink) => {
          await removeItemLink(item.id, link.id);
        });

        // Wait for all link deletions to complete
        await Promise.all(linkDeletionPromises);
        toast.success(
          `Removed ${links.length} links associated with ${item.name}`,
        );
      }

      // Now delete the item itself
      await deleteItem(item.id);
      toast.success(`Successfully removed ${item.name}`);

      // Close both the dialog and the drawer
      setIsDeleteDialogOpen(false);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to delete item:", error);
      toast.error("Failed to delete item");
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter out the current item from available items to link
  // When item is ISP: only show network devices
  // Also filter out items that are already selected and ISP nodes
  // But allow previously linked items that have been removed to appear again
  const getAvailableItems = (currentIndex: number) => {
    return items
      .filter(
        (i) =>
          i.id !== formData.id &&
          i.type !== "ISP" && // Exclude ISP nodes
          !itemLinks.some(
            (link, idx) => link.targetItemId === i.id && idx !== currentIndex,
          ) &&
          // For ISP nodes, only show network devices
          (formData.type === "ISP"
            ? NETWORK_DEVICE_TYPES.includes(i.type)
            : true) &&
          // Only exclude items that have incoming links from OTHER items
          // Items with links from the current item should be available if they're not in the current itemLinks
          !(
            i.incomingLinks &&
            i.incomingLinks.some(
              (link) =>
                // If the link is NOT from the current item OR
                // if it IS from the current item but still present in itemLinks, filter it out
                link.sourceItemId !== formData.id ||
                (link.sourceItemId === formData.id &&
                  itemLinks.some(
                    (currentLink) => currentLink.targetItemId === i.id,
                  )),
            )
          ),
      )
      .filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.type.toLowerCase().includes(searchQuery.toLowerCase()),
      );
  };

  // Get filtered link types based on search
  const getFilteredLinkTypes = () => {
    return LINK_TYPES.filter((type) =>
      type.toLowerCase().includes(linkTypeFilter.toLowerCase()),
    );
  };

  // Get item name by id
  const getItemNameById = (id: string) => {
    const item = items.find((i) => i.id === id);
    return item ? item.name : "Unknown item";
  };

  return (
    <>
      <Drawer open={isOpen} onOpenChange={onOpenChange} direction="right">
        <DrawerContent
          className="bg-card flex h-full flex-col px-1 py-8 data-[vaul-drawer-direction=right]:sm:max-w-md"
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
                  <Select
                    value={formData.type}
                    onValueChange={handleTypeChange}
                    disabled={formData.type === "ISP"} // Disable select when type is ISP
                  >
                    <SelectTrigger
                      className={
                        formData.type === "ISP"
                          ? "cursor-not-allowed opacity-60"
                          : ""
                      }
                    >
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
                {/* Link Nodes Section - Show for all devices  */}
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

                  {itemLinks.length === 0 ? (
                    <div className="text-muted-foreground py-2 text-sm">
                      {formData.type === "ISP"
                        ? 'No links added. Click "Add Link" to connect this ISP node to another item.'
                        : 'No links added. Click "Add Link" to connect this device to other items.'}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {itemLinks.map((link, index) => (
                        <div key={index} className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <div className="flex flex-1 items-center gap-2">
                              {/* Item selection */}
                              <Popover
                                modal
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
                                    className="w-2/3 justify-between bg-transparent"
                                  >
                                    {link.targetItemId ? (
                                      <div className="flex w-full items-center overflow-hidden">
                                        {getIconForType(
                                          items.find(
                                            (i) => i.id === link.targetItemId,
                                          )?.type || "",
                                        )}
                                        <span className="ml-2 truncate overflow-hidden text-ellipsis whitespace-nowrap">
                                          {getItemNameById(link.targetItemId)}
                                        </span>
                                      </div>
                                    ) : (
                                      "Select an item to link"
                                    )}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 flex-none shrink-0 opacity-50" />
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
                                        {getAvailableItems(index).map(
                                          (item) => (
                                            <CommandItem
                                              key={item.id}
                                              value={item.id}
                                              onSelect={(currentValue) => {
                                                handleLinkTargetChange(
                                                  index,
                                                  currentValue,
                                                );
                                                setOpenCombobox(null);
                                                setSearchQuery("");
                                              }}
                                              className="flex items-center gap-2"
                                            >
                                              {getIconForType(item.type)}
                                              <div className="flex flex-col gap-1">
                                                <span className="">
                                                  {item.name}
                                                </span>
                                                <span className="text-muted-foreground text-xs">
                                                  ({item.type})
                                                </span>
                                              </div>
                                              <Check
                                                className={cn(
                                                  "ml-auto h-4 w-4",
                                                  link.targetItemId === item.id
                                                    ? "opacity-100"
                                                    : "opacity-0",
                                                )}
                                              />
                                            </CommandItem>
                                          ),
                                        )}
                                      </CommandGroup>
                                    </CommandList>
                                  </Command>
                                </PopoverContent>
                              </Popover>

                              {/* Link type selection */}
                              <Popover
                                modal
                                open={openLinkTypeSelect === index}
                                onOpenChange={(open) => {
                                  setOpenLinkTypeSelect(open ? index : null);
                                  setLinkTypeFilter("");
                                }}
                              >
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    ref={linkTypeTriggerRef}
                                    role="combobox"
                                    aria-expanded={openLinkTypeSelect === index}
                                    className="w-1/3 justify-between bg-transparent"
                                  >
                                    <span className="truncate overflow-hidden text-ellipsis whitespace-nowrap">
                                      {link.linkType || "Select type"}
                                    </span>
                                    <ChevronsUpDown className="ml-2 h-4 w-4 flex-none shrink-0 opacity-50" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="p-0"
                                  align="start"
                                  side="bottom"
                                  sideOffset={4}
                                  style={{
                                    width: linkTypeTriggerRef.current
                                      ?.offsetWidth
                                      ? `${linkTypeTriggerRef.current.offsetWidth}px`
                                      : "auto",
                                  }}
                                >
                                  <Command>
                                    <CommandInput
                                      placeholder="Link type"
                                      className="h-9"
                                      value={linkTypeFilter}
                                      onValueChange={setLinkTypeFilter}
                                    />
                                    <CommandList className="max-h-[200px] overflow-y-auto scroll-auto">
                                      <CommandEmpty>
                                        No matching link types found.
                                      </CommandEmpty>
                                      <CommandGroup>
                                        {getFilteredLinkTypes().map((type) => (
                                          <CommandItem
                                            key={type}
                                            value={type}
                                            onSelect={(currentValue) => {
                                              handleLinkTypeChange(
                                                index,
                                                currentValue,
                                              );
                                              setOpenLinkTypeSelect(null);
                                              setLinkTypeFilter("");
                                            }}
                                          >
                                            <span>{type}</span>
                                            <Check
                                              className={cn(
                                                "ml-auto h-4 w-4",
                                                link.linkType === type
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
                            </div>

                            {/* Remove link button */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="flex-none"
                              onClick={() => handleRemoveLink(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* Add port input field */}
                          <div className="mt-2 ml-0">
                            <Input
                              placeholder="Port (optional)"
                              value={link.port || ""}
                              onChange={(e) => {
                                const newItemLinks = [...itemLinks];
                                newItemLinks[index] = {
                                  ...newItemLinks[index],
                                  port: e.target.value,
                                };
                                setItemLinks(newItemLinks);
                              }}
                              className="h-8 text-sm"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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

          {/* Delete link positioned right above footer */}
          <div className="flex justify-center pb-2">
            <Button
              variant="link"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="text-destructive hover:text-destructive/80 flex items-center gap-1.5"
            >
              <Trash2 className="h-4 w-4" />
              Delete this item
            </Button>
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

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {item.name}? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
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
