import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useInventory } from "@/context/InventoryContext";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CheckIcon, ChevronsUpDown, Filter, PlusCircle, X } from "lucide-react";
import { itemTypes } from "@/lib/ItemTypes";
import { InventoryItemCard } from "@/components/InventoryItemCard";
import { cn } from "@/lib/Utils";
import AddItemDialog from "./AddItemDialog";

export function InventoryTable() {
  const { items, isLoading, refreshInventory } = useInventory();
  const [nameFilter, setNameFilter] = useState("");
  const [typeFilters, setTypeFilters] = useState<string[]>([]);
  const [openFilterPopover, setOpenFilterPopover] = useState(false);
  const [searchTypeQuery, setSearchTypeQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [preselectedType, setPreselectedType] = useState<string | null>(null);
  const [hideIpField, setHideIpField] = useState(false);

  // Filter items by name and type
  const filteredItems = items.filter((item) => {
    const matchesName = item.name
      .toLowerCase()
      .includes(nameFilter.toLowerCase());
    const matchesType =
      typeFilters.length === 0 || typeFilters.includes(item.type);
    return matchesName && matchesType;
  });

  // Toggle type filter
  const toggleTypeFilter = (value: string) => {
    setTypeFilters((current) =>
      current.includes(value)
        ? current.filter((type) => type !== value)
        : [...current, value],
    );
  };

  // Clear all type filters
  const clearTypeFilters = () => {
    setTypeFilters([]);
  };

  // Filter item types based on search query
  const filteredItemTypes = itemTypes.filter((type) =>
    type.label.toLowerCase().includes(searchTypeQuery.toLowerCase()),
  );

  // Handle adding ISP node
  const handleAddIsp = () => {
    setPreselectedType("ISP");
    setHideIpField(true);
    setIsAddDialogOpen(true);
  };

  // Reset add dialog settings when closed
  const handleAddDialogOpenChange = (open: boolean) => {
    setIsAddDialogOpen(open);
    if (!open) {
      setPreselectedType(null);
      setHideIpField(false);
    }
  };

  // Handle when item is added
  const handleItemAdded = () => {
    refreshInventory();
  };

  return (
    <div className="h-full space-y-4">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <Input
          placeholder="Search by name..."
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
          className="bg-card max-w-xs"
        />
        <div className="flex w-full items-center gap-2 sm:w-auto">
          {typeFilters.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearTypeFilters}
              className="flex items-center"
            >
              <X className="mr-1 h-4 w-4" />
              Clear filters
            </Button>
          )}
          <Popover open={openFilterPopover} onOpenChange={setOpenFilterPopover}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="bg-card flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                {typeFilters.length === 0 ? (
                  "Filter by type"
                ) : (
                  <>
                    {typeFilters.length} type{typeFilters.length > 1 ? "s" : ""}{" "}
                    selected
                  </>
                )}
                <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="p-0"
              align="end"
              side="bottom"
              sideOffset={4}
            >
              <Command>
                <CommandInput
                  placeholder="Search item types..."
                  className="h-9"
                  value={searchTypeQuery}
                  onValueChange={setSearchTypeQuery}
                />
                <CommandList className="max-h-[300px] w-full overflow-y-auto scroll-auto">
                  <CommandEmpty>No item types found.</CommandEmpty>
                  <CommandGroup>
                    {filteredItemTypes.map((type) => {
                      const Icon = type.icon;
                      return (
                        <CommandItem
                          key={type.value}
                          value={type.value}
                          onSelect={() => toggleTypeFilter(type.value)}
                          className="flex items-center"
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="h-4 w-4" />
                            {type.label}
                          </div>
                          <CheckIcon
                            className={cn(
                              "ml-auto h-4 w-4",
                              typeFilters.includes(type.value)
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {isLoading ? (
        <div className="py-8 text-center">Loading...</div>
      ) : filteredItems.length > 0 ? (
        <div className="flex flex-wrap gap-4">
          {filteredItems.map((item) => (
            <InventoryItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="flex h-[calc(100%-3rem)] min-h-[200px] w-full flex-col items-center justify-center gap-4 rounded-md border p-6 text-center">
          <p className="text-muted-foreground text-lg">
            Begin by adding your ISP node
          </p>
          <Button
            onClick={handleAddIsp}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            <span>Add ISP Node</span>
          </Button>
        </div>
      )}

      <AddItemDialog
        isOpen={isAddDialogOpen}
        onOpenChange={handleAddDialogOpenChange}
        onItemAdded={handleItemAdded}
        preselectedType={preselectedType}
        isIspEntrypoint={true}
        hideIpField={hideIpField}
      />
    </div>
  );
}
