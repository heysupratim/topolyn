import { FC } from "react";
import { Handle, NodeProps, Position } from "reactflow";
import { Badge } from "@/components/ui/badge";

// Custom node component to display inventory item details
const InventoryItemNode: FC<NodeProps> = ({ data }) => {
  return (
    <div
      className="bg-card border-border rounded-md border p-4 shadow-sm"
      style={{ width: `${data.width}px`, height: `${data.height}px` }}
    >
      <div className="flex flex-col items-center gap-2">
        <div className="bg-muted mb-1 rounded-md p-2">{data.icon}</div>
        <div className="w-full truncate text-center text-xs font-medium">
          {data.label}
        </div>
        {data.ipAddress && (
          <Badge variant="secondary" className="text-xs">
            {data.ipAddress}
          </Badge>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        id="source"
        className="invisible h-2 w-2"
      />
      <Handle
        type="target"
        position={Position.Top}
        id="target"
        className="invisible h-2 w-2"
      />
    </div>
  );
};

export default InventoryItemNode;
