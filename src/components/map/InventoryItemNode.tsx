import { FC } from "react";
import { Handle, NodeProps, Position } from "reactflow";
import { Badge } from "@/components/ui/badge";

// Custom node component to display inventory item details
const InventoryItemNode: FC<NodeProps> = ({ data }) => {
  // Get visibility settings from data props
  const showIcon = data.showIcon !== undefined ? data.showIcon : true;
  const showLabel = data.showLabel !== undefined ? data.showLabel : true;
  const showIpAddress =
    data.showIpAddress !== undefined ? data.showIpAddress : true;

  return (
    <div
      className="bg-card border-border hover:bg-accent flex cursor-pointer flex-col items-center justify-center rounded-md border p-4 shadow-sm transition-all hover:shadow-md"
      style={{ width: `${data.width}px`, height: `${data.height}px` }}
      onClick={() => data.onNodeClick && data.onNodeClick(data.id)}
    >
      <div className="flex flex-col items-center gap-2">
        {showIcon && (
          <div className="bg-muted mb-1 rounded-md p-2">{data.icon}</div>
        )}
        {showLabel && (
          <div className="w-full truncate text-center text-xs font-medium">
            {data.label}
          </div>
        )}
        {showIpAddress && data.ipAddress && (
          <Badge variant="secondary" className="text-xs">
            {data.ipAddress}
          </Badge>
        )}
      </div>
      <Handle
        type="source"
        position={data.isVertical ? Position.Bottom : Position.Right}
        id="source"
        className="invisible h-2 w-2"
      />
      <Handle
        type="target"
        position={data.isVertical ? Position.Top : Position.Left}
        id="target"
        className="invisible h-2 w-2"
      />
    </div>
  );
};

export default InventoryItemNode;
