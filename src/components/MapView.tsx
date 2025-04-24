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
import { Minus, Plus, Maximize, Wrench } from "lucide-react";
import { FC, useMemo, useState } from "react";
import { useInventory } from "@/context/InventoryContext";
import { getIconForType } from "@/lib/Utils";
import { Badge } from "./ui/badge";
import { Slider } from "./ui/slider";
import { Label } from "./ui/label";

interface CustomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onCustomize: () => void;
}

// Custom controls using shadcn UI components
const CustomControls: FC<CustomControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onFitView,
  onCustomize,
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
      <Button
        variant="ghost"
        size="icon"
        onClick={onCustomize}
        className="bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8"
      >
        <Wrench className="h-4 w-4" />
        <span className="sr-only">Customize</span>
      </Button>
    </div>
  );
};

// Customization panel component
interface CustomizationPanelProps {
  horizontalDistance: number;
  verticalDistance: number;
  nodeWidth: number;
  nodeHeight: number;
  onHorizontalDistanceChange: (value: number[]) => void;
  onVerticalDistanceChange: (value: number[]) => void;
  onNodeWidthChange: (value: number[]) => void;
  onNodeHeightChange: (value: number[]) => void;
  isOpen: boolean;
}

const CustomizationPanel: FC<CustomizationPanelProps> = ({
  horizontalDistance,
  verticalDistance,
  nodeWidth,
  nodeHeight,
  onHorizontalDistanceChange,
  onVerticalDistanceChange,
  onNodeWidthChange,
  onNodeHeightChange,
  isOpen,
}) => {
  if (!isOpen) return null;

  return (
    <div className="bg-card border-border absolute bottom-4 left-4 z-50 flex flex-col gap-4 rounded-md border p-4 shadow-md">
      <h3 className="text-foreground font-medium">Layout Customization</h3>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="horizontal-distance" className="text-sm">
            Horizontal Distance
          </Label>
          <span className="text-muted-foreground text-xs">
            {horizontalDistance}px
          </span>
        </div>
        <Slider
          id="horizontal-distance"
          min={40}
          max={400}
          step={10}
          value={[horizontalDistance]}
          onValueChange={onHorizontalDistanceChange}
          className="w-48"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="vertical-distance" className="text-sm">
            Vertical Distance
          </Label>
          <span className="text-muted-foreground text-xs">
            {verticalDistance}px
          </span>
        </div>
        <Slider
          id="vertical-distance"
          min={80}
          max={400}
          step={10}
          value={[verticalDistance]}
          onValueChange={onVerticalDistanceChange}
          className="w-48"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="node-width" className="text-sm">
            Node Width
          </Label>
          <span className="text-muted-foreground text-xs">{nodeWidth}px</span>
        </div>
        <Slider
          id="node-width"
          min={150}
          max={400}
          step={10}
          value={[nodeWidth]}
          onValueChange={onNodeWidthChange}
          className="w-48"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="node-height" className="text-sm">
            Node Height
          </Label>
          <span className="text-muted-foreground text-xs">{nodeHeight}px</span>
        </div>
        <Slider
          id="node-height"
          min={120}
          max={400}
          step={10}
          value={[nodeHeight]}
          onValueChange={onNodeHeightChange}
          className="w-48"
        />
      </div>
    </div>
  );
};

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

// Flow component that uses the ReactFlow hook
const Flow: FC = () => {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const { items } = useInventory();

  const [isCustomizationPanelOpen, setIsCustomizationPanelOpen] =
    useState(false);
  const [horizontalDistance, setHorizontalDistance] = useState(40);
  const [verticalDistance, setVerticalDistance] = useState(80);
  const [nodeWidth, setNodeWidth] = useState(150);
  const [nodeHeight, setNodeHeight] = useState(120);

  // Handle distance changes
  const handleHorizontalDistanceChange = (value: number[]) => {
    setHorizontalDistance(value[0]);
    // Small delay to ensure nodes are repositioned before fitting view
    setTimeout(() => fitView({ padding: 0.2 }), 50);
  };

  const handleVerticalDistanceChange = (value: number[]) => {
    setVerticalDistance(value[0]);
    // Small delay to ensure nodes are repositioned before fitting view
    setTimeout(() => fitView({ padding: 0.2 }), 50);
  };

  const handleNodeWidthChange = (value: number[]) => {
    setNodeWidth(value[0]);
  };

  const handleNodeHeightChange = (value: number[]) => {
    setNodeHeight(value[0]);
  };

  // Create nodes from inventory items
  const nodes: Node[] = useMemo(() => {
    // Create a map to track node levels (how deep in the linking hierarchy)
    const nodeLevels: Record<string, number> = {};

    // Find connected nodes (with either incoming or outgoing links)
    const connectedNodeIds = new Set<string>();

    // Add nodes with outgoing links
    items.forEach((item) => {
      if (item.outgoingLinks && item.outgoingLinks.length > 0) {
        connectedNodeIds.add(item.id);
        // Also add the target nodes
        item.outgoingLinks.forEach((link) => {
          connectedNodeIds.add(link.targetItemId);
        });
      }
    });

    // Add nodes with incoming links (in case they don't have outgoing links)
    items.forEach((item) => {
      if (item.incomingLinks && item.incomingLinks.length > 0) {
        connectedNodeIds.add(item.id);
      }
    });

    // Filter items to only include connected nodes
    const connectedItems = items.filter((item) =>
      connectedNodeIds.has(item.id),
    );

    // Find all ISP nodes first (they're at level 0) from connected nodes
    const ispNodes = connectedItems.filter((item) => item.type === "ISP");
    ispNodes.forEach((item) => {
      nodeLevels[item.id] = 0;
    });

    // Function to determine node level based on connections
    const determineNodeLevels = () => {
      let hasChanges = false;

      connectedItems.forEach((item) => {
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

    // Assign level 1 to any connected nodes without a level
    connectedItems.forEach((item) => {
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

    // Position nodes by level and in a grid within each level
    Object.entries(nodesByLevel).forEach(([level, nodeIds]) => {
      const levelNum = parseInt(level);
      const totalWidth =
        nodeIds.length * nodeWidth + (nodeIds.length - 1) * horizontalDistance; // Approx width including margins
      const startX = -totalWidth / 2; // Center the row of nodes
      const y = levelNum * (verticalDistance + nodeHeight);

      nodeIds.forEach((nodeId, index) => {
        const item = items.find((i) => i.id === nodeId);
        if (item) {
          positionedNodes.push({
            id: item.id,
            type: "inventoryItem",
            position: {
              x: startX + index * nodeWidth + index * horizontalDistance,
              y: y,
            },
            data: {
              label: item.name,
              ipAddress: item.ipAddress,
              type: item.type,
              icon: getIconForType(item.type),
              width: nodeWidth,
              height: nodeHeight,
            },
          });
        }
      });
    });

    return positionedNodes;
  }, [items, horizontalDistance, verticalDistance, nodeWidth, nodeHeight]);

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
            className: "",
            style: {
              stroke: "var(--muted-foreground)",
              strokeWidth: 1,
              opacity: 0.8,
            },
            labelStyle: {
              fill: "var(--muted-foreground)",
              fontSize: 10,
              fontWeight: "500",
            },
            label: link.linkType,
            data: { linkType: link.linkType },
            markerEnd: {
              type: MarkerType.Arrow,
              width: 15,
              height: 15,
              color: "var(--muted-foreground)",
            },
          });
        });
      }
    });

    return allEdges;
  }, [items]);

  // Define node types for the ReactFlow component
  const nodeTypes = useMemo(() => ({ inventoryItem: InventoryItemNode }), []);

  // Define proOptions to hide the watermark
  const proOptions = { hideAttribution: true };

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      proOptions={proOptions}
      className="bg-background h-full w-full rounded-md"
      fitView
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={false}
    >
      <Background />
      <CustomControls
        onZoomIn={() => zoomIn()}
        onZoomOut={() => zoomOut()}
        onFitView={() => fitView()}
        onCustomize={() =>
          setIsCustomizationPanelOpen(!isCustomizationPanelOpen)
        }
      />
      <CustomizationPanel
        horizontalDistance={horizontalDistance}
        verticalDistance={verticalDistance}
        nodeWidth={nodeWidth}
        nodeHeight={nodeHeight}
        onHorizontalDistanceChange={handleHorizontalDistanceChange}
        onVerticalDistanceChange={handleVerticalDistanceChange}
        onNodeWidthChange={handleNodeWidthChange}
        onNodeHeightChange={handleNodeHeightChange}
        isOpen={isCustomizationPanelOpen}
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
