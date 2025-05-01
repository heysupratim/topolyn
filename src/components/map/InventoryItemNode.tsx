import { FC, useRef, useEffect } from "react";
import { Handle, NodeProps, Position } from "reactflow";
import { Badge } from "@/components/ui/badge";
import { Service } from "@/context/InventoryContext";

// Custom node component to display inventory item details
const InventoryItemNode: FC<NodeProps> = ({ data, id }) => {
  // Get visibility settings from data props
  const showIcon = data.showIcon !== undefined ? data.showIcon : true;
  const showLabel = data.showLabel !== undefined ? data.showLabel : true;
  const showIpAddress =
    data.showIpAddress !== undefined ? data.showIpAddress : true;
  const showBackground =
    data.showBackground !== undefined ? data.showBackground : true;
  const showServices =
    data.showServices !== undefined ? data.showServices : true;

  // Create a ref to measure the actual rendered size of the node
  const nodeRef = useRef<HTMLDivElement>(null);

  // Report the node's actual dimensions when it renders or changes
  useEffect(() => {
    if (nodeRef.current) {
      const { offsetWidth, offsetHeight } = nodeRef.current;

      // Only report if we have a callback and the dimensions are valid
      if (data.onNodeMeasure && offsetWidth && offsetHeight) {
        data.onNodeMeasure(id.toString(), {
          width: offsetWidth,
          height: offsetHeight,
        });
      }
    }
  }, [
    id,
    data.onNodeMeasure,
    showIcon,
    showLabel,
    showIpAddress,
    showServices,
  ]);

  return (
    <div
      ref={nodeRef}
      className={`flex cursor-pointer flex-col items-center justify-center rounded-md border p-4 transition-all hover:shadow-md ${
        showBackground
          ? "bg-card border-border hover:bg-accent min-h-[120px] min-w-[130px] shadow-sm"
          : "h-fit w-fit border-transparent bg-transparent"
      }`}
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

        {/* Display services if available and enabled */}
        {showServices && data.services && data.services.length > 0 && (
          <div className="border-border mt-2 w-full border-t pt-2">
            <div className="flex flex-col gap-1">
              {data.services.map((service: Service, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  {service.imageUrl ? (
                    <img
                      src={service.imageUrl}
                      alt={service.name}
                      className="h-4 w-4 rounded-sm object-contain"
                    />
                  ) : null}
                  <span className="truncate text-xs">{service.name}</span>
                </div>
              ))}
            </div>
          </div>
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
