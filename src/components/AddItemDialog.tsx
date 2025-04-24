"use client";

import type React from "react";
import { useRef, useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
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
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/Utils";
import { inventoryApi } from "@/lib/Api";
import { toast } from "sonner";
import { itemTypes } from "@/lib/ItemTypes";

interface AddItemDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onItemAdded?: () => void;
  preselectedType?: string | null;
  hideIpField?: boolean;
  isIspEntrypoint?: boolean;
}

export default function AddItemDialog({
  isOpen,
  onOpenChange,
  onItemAdded,
  preselectedType = null,
  hideIpField = false,
  isIspEntrypoint = false,
}: AddItemDialogProps) {
  const [itemName, setItemName] = useState("");
  const [itemType, setItemType] = useState("");
  const [ipAddress, setIpAddress] = useState("");
  const [openCombobox, setOpenCombobox] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Form error states
  const [errors, setErrors] = useState({
    itemName: "",
    itemType: "",
    ipAddress: "",
  });

  // Set preselected type when dialog opens
  useEffect(() => {
    if (isOpen && preselectedType) {
      setItemType(preselectedType);
    }
  }, [isOpen, preselectedType]);

  const validateForm = () => {
    const newErrors = {
      itemName: !itemName ? "Item name is required" : "",
      itemType: !itemType ? "Item type is required" : "",
      ipAddress: "", // IP address is no longer required
    };

    setErrors(newErrors);

    // Return true if no errors (all required fields filled)
    return !Object.values(newErrors).some((error) => error);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      await inventoryApi.createItem({
        name: itemName,
        type: itemType,
        ipAddress: ipAddress,
      });

      // Show success message
      toast.success("Item added successfully");

      // Reset form and close dialog
      setItemName("");
      setItemType("");
      setIpAddress("");
      setErrors({
        itemName: "",
        itemType: "",
        ipAddress: "",
      });
      onOpenChange(false);

      // Notify parent component that an item was added
      if (onItemAdded) {
        onItemAdded();
      }
    } catch (error) {
      console.error("Failed to add item:", error);
      toast.error("Failed to add item. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Custom icon style for line style
  const iconStyle = {
    className: "h-4 w-4 text-foreground",
  };

  // Filter item types based on search query
  const filteredItemTypes = itemTypes
    .filter((type) =>
      type.label.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .filter((type) => isIspEntrypoint || type.value !== "ISP");

  // Get the selected item type object
  const selectedType = itemTypes.find((type) => type.value === itemType);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card text-card-foreground overflow-hidden rounded-xl border p-0 shadow sm:max-w-[425px]">
        <DialogHeader className="bg-background px-6 pt-10 pb-6">
          <DialogTitle>{isIspEntrypoint ? "Add ISP" : "Add Item"}</DialogTitle>
          <DialogDescription>
            {isIspEntrypoint
              ? "Add the entrypoint to your network"
              : "Add a new device or service to your homelab visualization."}
          </DialogDescription>
        </DialogHeader>
        <Separator />
        <div className="px-6 py-4">
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-2">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="itemName" className="text-right">
                  Item Name
                </Label>
                <div className="col-span-3 space-y-1">
                  <Input
                    id="itemName"
                    value={itemName}
                    onChange={(e) => {
                      setItemName(e.target.value);
                      if (e.target.value) {
                        setErrors((prev) => ({ ...prev, itemName: "" }));
                      }
                    }}
                    className={cn(
                      errors.itemName &&
                        "border-destructive focus-visible:ring-destructive",
                    )}
                    required
                  />
                  {errors.itemName && (
                    <p className="text-destructive text-sm">
                      {errors.itemName}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="itemType" className="text-right">
                  Item Type
                </Label>
                <div className="col-span-3 space-y-1">
                  <Popover
                    open={openCombobox}
                    onOpenChange={preselectedType ? undefined : setOpenCombobox}
                    modal
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        ref={triggerRef}
                        role="combobox"
                        aria-expanded={openCombobox}
                        className={cn(
                          "bg-card w-full justify-between",
                          errors.itemType &&
                            "border-destructive focus-visible:ring-destructive text-destructive",
                          preselectedType && "pointer-events-none opacity-80",
                        )}
                        onClick={() => {
                          if (errors.itemType) {
                            setErrors((prev) => ({ ...prev, itemType: "" }));
                          }
                        }}
                        disabled={!!preselectedType}
                      >
                        {selectedType ? (
                          <div className="flex items-center">
                            {selectedType.icon && (
                              <selectedType.icon className="text-foreground mr-2 h-4 w-4" />
                            )}
                            {selectedType.label}
                          </div>
                        ) : (
                          "Select type"
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
                          placeholder="Search item type..."
                          className="h-9"
                          value={searchQuery}
                          onValueChange={setSearchQuery}
                        />
                        <CommandList className="max-h-[300px] w-full overflow-y-auto scroll-auto">
                          <CommandEmpty>No item type found.</CommandEmpty>
                          <CommandGroup>
                            {filteredItemTypes.map((type) => (
                              <CommandItem
                                key={type.value}
                                value={type.value}
                                onSelect={(currentValue) => {
                                  setItemType(currentValue);
                                  setOpenCombobox(false);
                                  setSearchQuery("");
                                  setErrors((prev) => ({
                                    ...prev,
                                    itemType: "",
                                  }));
                                }}
                                className="flex items-center"
                              >
                                {type.icon && (
                                  <type.icon {...iconStyle} className="mr-2" />
                                )}
                                {type.label}
                                <Check
                                  className={cn(
                                    "ml-auto h-4 w-4",
                                    itemType === type.value
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
                  {errors.itemType && (
                    <p className="text-destructive text-sm">
                      {errors.itemType}
                    </p>
                  )}
                </div>
              </div>
              {!hideIpField && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="ipAddress" className="text-right">
                    IP Address
                  </Label>
                  <div className="col-span-3 space-y-1">
                    <Input
                      id="ipAddress"
                      value={ipAddress}
                      onChange={(e) => {
                        setIpAddress(e.target.value);
                        if (e.target.value) {
                          setErrors((prev) => ({ ...prev, ipAddress: "" }));
                        }
                      }}
                      className={cn(
                        errors.ipAddress &&
                          "border-destructive focus-visible:ring-destructive",
                      )}
                    />
                    {errors.ipAddress && (
                      <p className="text-destructive text-sm">
                        {errors.ipAddress}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add"}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
