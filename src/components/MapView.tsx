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
    // Create a map to track node levels (how deep in the linking hierarchy)
    const nodeLevels: Record<string, number> = {};

    // Find all ISP nodes first (they're at level 0)
    const ispNodes = items.filter((item) => item.type === "ISP");
    ispNodes.forEach((item) => {
      nodeLevels[item.id] = 0;
    });

    // Function to determine node level based on connections
    const determineNodeLevels = () => {
      let hasChanges = false;

      items.forEach((item) => {
        // If the item already has a level, check if any of its outgoing links
        // need their levels set
        if (nodeLevels[item.id] !== undefined && item.outgoingLinks) {
          item.outgoingLinks.forEach((link) => {
            const targetLevel = nodeLevels[item.id] + 1;
            if (
              nodeLevels[link.targetItemId] === undefined ||
              nodeLevels[link.targetItemId] > targetLevel
            ) {
              nodeLevels[link.targetItemId] = targetLevel;
              hasChanges = true;
            }
          });
        }
      });

      return hasChanges;
    };

    // Run multiple passes until all nodes have been assigned levels
    while (determineNodeLevels()) {}

    // Assign level 1 to any nodes without a level (unconnected nodes)
    items.forEach((item) => {
      if (nodeLevels[item.id] === undefined) {
        nodeLevels[item.id] = 1;
      }
    });

    // Group nodes by levels
    const nodesByLevel: Record<number, string[]> = {};
    Object.entries(nodeLevels).forEach(([id, level]) => {
      if (!nodesByLevel[level]) {
        nodesByLevel[level] = [];
      }
      nodesByLevel[level].push(id);
    });

    // Position nodes
    const positionedNodes: Node[] = [];
    const verticalDistance = 250; // Distance between levels in px

    // Position nodes by level and in a grid within each level
    Object.entries(nodesByLevel).forEach(([level, nodeIds]) => {
      const levelNum = parseInt(level);
      const totalWidth = nodeIds.length * 250; // Approx width including margins
      const startX = -totalWidth / 2 + 90; // Center the row of nodes
      const y = levelNum * verticalDistance;

      nodeIds.forEach((nodeId, index) => {
        const item = items.find((i) => i.id === nodeId);
        if (item) {
          positionedNodes.push({
            id: item.id,
            type: "inventoryItem", // Custom node type
            position: {
              x: startX + index * 250, // 200px spacing between nodes in same level (updated from 180px)
              y: y,
            },
            data: {
              label: item.name,
              ipAddress: item.ipAddress,
              type: item.type,
              icon: getIconForType(item.type),
            },
          });
        }
      });
    });

    return positionedNodes;
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
