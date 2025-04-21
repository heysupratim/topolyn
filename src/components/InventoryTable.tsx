import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useInventory } from "@/context/InventoryContext";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Filter, X, CheckIcon } from "lucide-react";
import { itemTypes } from "@/lib/ItemTypes";
import { InventoryItemCard } from "@/components/InventoryItemCard";

export function InventoryTable() {
  const { items, isLoading } = useInventory();
  const [nameFilter, setNameFilter] = useState("");
  const [typeFilters, setTypeFilters] = useState<string[]>([]);

  // Filter items by name and type
  const filteredItems = items.filter((item) => {
    const matchesName = item.name
      .toLowerCase()
      .includes(nameFilter.toLowerCase());
    const matchesType =
      typeFilters.length === 0 || typeFilters.includes(item.type);
    return matchesName && matchesType;
  });

  // Handle checkbox toggle
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

  return (
    <div className="space-y-4">
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
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
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="">
              {itemTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <DropdownMenuCheckboxItem
                    key={type.value}
                    checked={typeFilters.includes(type.value)}
                    onCheckedChange={() => toggleTypeFilter(type.value)}
                    className="relative flex items-center justify-between pr-8 pl-2"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4" />
                      {type.label}
                    </div>
                    {typeFilters.includes(type.value) && (
                      <span className="absolute right-2 flex items-center justify-center">
                        <CheckIcon className="h-4 w-4" />
                      </span>
                    )}
                  </DropdownMenuCheckboxItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
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
        <div className="bg-card rounded-md border py-8 text-center">
          No inventory items found.
        </div>
      )}
    </div>
  );
}
