import { Button } from "@/components/ui/button";
import ReactFlow, {
  Background,
  ReactFlowProvider,
  useReactFlow,
  Node,
  Edge,
  Position,
  MarkerType,
  Handle,
  NodeProps,
} from "reactflow";
import "reactflow/dist/style.css";
import { Minus, Plus, Maximize } from "lucide-react";
import { FC, useCallback, useMemo } from "react";
import { useInventory } from "@/context/InventoryContext";
import { getIconForType } from "@/lib/Utils";
import { Badge } from "./ui/badge";

interface CustomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
}

// Custom controls using shadcn UI components
const CustomControls: FC<CustomControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onFitView,
}) => {
  return (
    <div className="bg-background absolute right-4 bottom-4 z-50 flex flex-col gap-2 rounded-md border p-1 shadow-sm">
      <Button
        variant="ghost"
        size="icon"
        onClick={onZoomIn}
        className="bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8"
      >
        <Plus className="h-4 w-4" />
        <span className="sr-only">Zoom in</span>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onZoomOut}
        className="bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8"
      >
        <Minus className="h-4 w-4" />
        <span className="sr-only">Zoom out</span>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onFitView}
        className="bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8"
      >
        <Maximize className="h-4 w-4" />
        <span className="sr-only">Fit view</span>
      </Button>
    </div>
  );
};

// Custom node component to display inventory item details
const InventoryItemNode: FC<NodeProps> = ({ data }) => {
  return (
    <div className="bg-card border-border w-[140px] rounded-md border p-4 shadow-sm">
      <div className="flex flex-col items-center gap-2">
        <div className="bg-muted mb-1 rounded-md p-2">{data.icon}</div>
        <div className="w-full truncate text-center font-medium">
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
        className="bg-primary h-2 w-2"
      />
      <Handle
        type="target"
        position={Position.Top}
        id="target"
        className="bg-primary h-2 w-2"
      />
    </div>
  );
};

// Flow component that uses the ReactFlow hook
const Flow: FC = () => {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const { items } = useInventory();

  // Create nodes from inventory items
  const nodes: Node[] = useMemo(() => {
    return items.map((item, index) => {
      // Generate position based on item type and index
      // ISP nodes at the top, others distributed in a grid-like layout
      let position = { x: 0, y: 0 };

      if (item.type === "ISP") {
        position = { x: 0, y: -200 };
      } else {
        // Create a grid layout for non-ISP nodes
        const row = Math.floor(index / 3);
        const col = index % 3;
        position = { x: col * 200 - 200, y: row * 150 };
      }

      return {
        id: item.id,
        type: "inventoryItem", // Custom node type
        position,
        data: {
          label: item.name,
          ipAddress: item.ipAddress,
          type: item.type,
          icon: getIconForType(item.type),
        },
      };
    });
  }, [items]);

  // Create edges from item links
  const edges: Edge[] = useMemo(() => {
    const allEdges: Edge[] = [];

    items.forEach((item) => {
      if (item.outgoingLinks) {
        item.outgoingLinks.forEach((link) => {
          allEdges.push({
            id: `${item.id}-${link.targetItemId}`,
            source: item.id,
            target: link.targetItemId,
            type: "bezier", // Changed from 'smoothstep' to 'bezier' for a more natural curve
            style: {
              stroke: "#555",
              strokeWidth: 1.5,
              opacity: 0.8,
            },
            labelStyle: {
              fill: "#333",
              fontSize: 11,
              fontWeight: "500",
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 15,
              height: 15,
              color: "#555",
            },
            label: link.linkType,
            // Adjust the curve of the edge
            data: { linkType: link.linkType },
          });
        });
      }
    });

    return allEdges;
  }, [items]);

  // Define node types for the ReactFlow component
  const nodeTypes = useMemo(() => ({ inventoryItem: InventoryItemNode }), []);

  // Handle node click
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    console.log("Node clicked:", node);
  }, []);

  // Define proOptions to hide the watermark
  const proOptions = { hideAttribution: true };

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodeClick={onNodeClick}
      proOptions={proOptions}
      defaultEdgeOptions={{
        type: "bezier",
        animated: false,
        style: {
          stroke: "#555",
          strokeWidth: 1.5,
          opacity: 0.8,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 15,
          height: 15,
          color: "#555",
        },
      }}
      className="bg-background h-full w-full rounded-md"
      fitView
    >
      <Background />
      <CustomControls
        onZoomIn={() => zoomIn()}
        onZoomOut={() => zoomOut()}
        onFitView={() => fitView()}
      />
    </ReactFlow>
  );
};

export function MapView() {
  return (
    <div className="flex h-full flex-col gap-4 px-4 py-4 md:gap-6 md:py-6 lg:gap-2 lg:px-6">
      <div className="h-full flex-1">
        <ReactFlowProvider>
          <Flow />
        </ReactFlowProvider>
      </div>
    </div>
  );
}
