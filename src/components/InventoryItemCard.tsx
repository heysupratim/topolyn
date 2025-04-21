import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { Server } from "lucide-react";
import { itemTypes } from "@/lib/item-types";
import type { InventoryItem } from "@/context/InventoryContext";

interface InventoryItemCardProps {
  item: InventoryItem;
}

export function InventoryItemCard({ item }: InventoryItemCardProps) {
  // Get icon component for a given type
  const getIconForType = (type: string) => {
    const itemType = itemTypes.find((t) => t.value === type);
    if (itemType && itemType.icon) {
      const Icon = itemType.icon;
      return <Icon className="h-6 w-6" />;
    }
    return <Server className="h-6 w-6" />; // Default icon
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg truncate">{item.name}</h3>
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
  );
}
