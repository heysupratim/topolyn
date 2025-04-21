import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useInventory } from "@/context/InventoryContext";
import { format } from "date-fns";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Router,
  Shield,
  Network,
  Wifi,
  Cpu,
  Laptop,
  Server,
  ServerCrash,
  Cloud,
  CloudCog,
} from "lucide-react";

// Define item types with their labels and icons (same as AddItemDialog)
const itemTypes = [
  { value: "Router", label: "Router", icon: Router },
  { value: "Firewall", label: "Firewall", icon: Shield },
  { value: "Switch", label: "Switch", icon: Network },
  { value: "Access Point", label: "Access Point", icon: Wifi },
  {
    value: "Single Board Computer",
    label: "Single Board Computer",
    icon: Cpu,
  },
  { value: "Mini PC", label: "Mini PC", icon: Laptop },
  { value: "Tower Server", label: "Tower Server", icon: Server },
  { value: "Rack Server", label: "Rack Server", icon: ServerCrash },
  { value: "VPS", label: "VPS", icon: Cloud },
  { value: "Cloud Compute", label: "Cloud Compute", icon: CloudCog },
];

export function InventoryTable() {
  const { items, isLoading } = useInventory();
  const [nameFilter, setNameFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState<string | null>(null);

  // Get icon component for a given type
  const getIconForType = (type: string) => {
    const itemType = itemTypes.find((t) => t.value === type);
    if (itemType && itemType.icon) {
      const Icon = itemType.icon;
      return <Icon className="h-6 w-6" />;
    }
    return <Server className="h-6 w-6" />; // Default icon
  };

  // Filter items by name and type
  const filteredItems = items.filter((item) => {
    const matchesName = item.name
      .toLowerCase()
      .includes(nameFilter.toLowerCase());
    const matchesType = typeFilter ? item.type === typeFilter : true;
    return matchesName && matchesType;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Input
          placeholder="Filter by name..."
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
          className="max-w-sm bg-card"
        />
        <div className="w-full sm:w-auto">
          <ToggleGroup
            type="single"
            value={typeFilter || ""}
            onValueChange={(value) => setTypeFilter(value || null)}
          >
            {typeFilter && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTypeFilter(null)}
                className="mr-2"
              >
                Clear filter
              </Button>
            )}
            {itemTypes.map((type) => {
              const Icon = type.icon;
              return (
                <ToggleGroupItem
                  key={type.value}
                  value={type.value}
                  aria-label={`Filter by ${type.label}`}
                  title={type.label}
                >
                  <Icon className="h-4 w-4" />
                </ToggleGroupItem>
              );
            })}
          </ToggleGroup>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              className="overflow-hidden hover:shadow-md transition-shadow"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg truncate">
                      {item.name}
                    </h3>
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
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 border rounded-md bg-card">
          No inventory items found.
        </div>
      )}
    </div>
  );
}
