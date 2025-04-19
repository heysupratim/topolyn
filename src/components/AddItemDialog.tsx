"use client";

import type React from "react";
import { useRef, useState } from "react";
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
import { cn } from "@/lib/utils";
import {
  IconRouter,
  IconShield,
  IconNetwork,
  IconWifi,
  IconCpu,
  IconDeviceLaptop,
  IconServer,
  IconServerBolt,
  IconCloud,
  IconCloudComputing,
} from "@tabler/icons-react";

interface AddItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Define item types with their labels and icons
const itemTypes = [
  { value: "router", label: "Router", icon: IconRouter },
  { value: "firewall", label: "Firewall", icon: IconShield },
  { value: "switch", label: "Switch", icon: IconNetwork },
  { value: "access-point", label: "Access Point", icon: IconWifi },
  {
    value: "single-board-computer",
    label: "Single Board Computer",
    icon: IconCpu,
  },
  { value: "mini-pc", label: "Mini PC", icon: IconDeviceLaptop },
  { value: "tower-server", label: "Tower Server", icon: IconServer },
  { value: "rack-server", label: "Rack Server", icon: IconServerBolt },
  { value: "vps", label: "VPS", icon: IconCloud },
  { value: "cloud-compute", label: "Cloud Compute", icon: IconCloudComputing },
];

export default function AddItemDialog({
  open,
  onOpenChange,
}: AddItemDialogProps) {
  const [itemName, setItemName] = useState("");
  const [itemType, setItemType] = useState("");
  const [ipAddress, setIpAddress] = useState("");
  const [openCombobox, setOpenCombobox] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log({ itemName, itemType, ipAddress });

    // Reset form and close dialog
    setItemName("");
    setItemType("");
    setIpAddress("");
    onOpenChange(false);
  };

  // Custom icon style for line style
  const iconStyle = {
    className: "h-4 w-4 text-foreground",
    stroke: 2,
  };

  // Filter item types based on search query
  const filteredItemTypes = itemTypes.filter((type) =>
    type.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get the selected item type object
  const selectedType = itemTypes.find((type) => type.value === itemType);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-xl border bg-card text-card-foreground shadow p-0 overflow-hidden">
        <DialogHeader className="bg-background px-6 pt-10 pb-6">
          <DialogTitle>Add Item</DialogTitle>
          <DialogDescription>
            Add a new device or service to your homelab visualization.
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
                <Input
                  id="itemName"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="itemType" className="text-right">
                  Item Type
                </Label>
                <div className="col-span-3">
                  <Popover
                    open={openCombobox}
                    onOpenChange={setOpenCombobox}
                    modal
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        ref={triggerRef}
                        role="combobox"
                        aria-expanded={openCombobox}
                        className="w-full justify-between bg-card"
                      >
                        {selectedType ? (
                          <div className="flex items-center">
                            {selectedType.icon && (
                              <selectedType.icon
                                className="h-4 w-4 text-foreground mr-2"
                                stroke={2}
                              />
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
                        <CommandList className="max-h-[200px] w-full scroll-auto overflow-y-auto">
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
                                      : "opacity-0"
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
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="ipAddress" className="text-right">
                  IP Address
                </Label>
                <Input
                  id="ipAddress"
                  value={ipAddress}
                  onChange={(e) => setIpAddress(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Add</Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
