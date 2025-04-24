import { Button } from "@/components/ui/button";
import ReactFlow, {
  Background,
  ReactFlowProvider,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";
import { Minus, Plus, Maximize, Wrench, X } from "lucide-react";
import { FC, useMemo, useState } from "react";
import { useInventory } from "@/context/InventoryContext";
import { Slider } from "./ui/slider";
import { Label } from "./ui/label";
import { useMapNodes } from "./map/MapNodes";
import InventoryItemNode from "./map/InventoryItemNode";
import { EditItemDrawer } from "./EditItemDrawer";
import type { InventoryItem } from "@/context/InventoryContext";

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
    <div className="bg-card absolute right-4 bottom-4 z-50 flex flex-col gap-2 rounded-md border p-1 shadow-sm">
      <Button
        variant="ghost"
        size="icon"
        onClick={onZoomIn}
        className="bg-card hover:bg-accent hover:text-accent-foreground h-8 w-8"
      >
        <Plus className="h-4 w-4" />
        <span className="sr-only">Zoom in</span>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onZoomOut}
        className="bg-card hover:bg-accent hover:text-accent-foreground h-8 w-8"
      >
        <Minus className="h-4 w-4" />
        <span className="sr-only">Zoom out</span>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onFitView}
        className="bg-card hover:bg-accent hover:text-accent-foreground h-8 w-8"
      >
        <Maximize className="h-4 w-4" />
        <span className="sr-only">Fit view</span>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onCustomize}
        className="bg-card hover:bg-accent hover:text-accent-foreground h-8 w-8"
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
  onClose: () => void;
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
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="bg-card border-border absolute bottom-4 left-4 z-50 flex flex-col gap-4 rounded-md border p-4 shadow-md">
      <div className="flex items-center justify-between gap-8">
        <h3 className="text-foreground font-medium">Layout Customization</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="bg-background hover:bg-accent hover:text-accent-foreground h-6 w-6"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </div>

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
          min={130}
          max={300}
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
          max={300}
          step={10}
          value={[nodeHeight]}
          onValueChange={onNodeHeightChange}
          className="w-48"
        />
      </div>
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
  const [nodeWidth, setNodeWidth] = useState(130);
  const [nodeHeight, setNodeHeight] = useState(120);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Handle distance changes
  const handleHorizontalDistanceChange = (value: number[]) => {
    setHorizontalDistance(value[0]);
  };

  const handleVerticalDistanceChange = (value: number[]) => {
    setVerticalDistance(value[0]);
  };

  const handleNodeWidthChange = (value: number[]) => {
    setNodeWidth(value[0]);
  };

  const handleNodeHeightChange = (value: number[]) => {
    setNodeHeight(value[0]);
  };

  // Handle node click
  const handleNodeClick = (nodeId: string) => {
    const item = items.find((item) => item.id === nodeId);
    if (item) {
      setSelectedItem(item);
      setIsDrawerOpen(true);
    }
  };

  // Use the extracted node generation logic
  const { nodes, edges } = useMapNodes({
    items,
    horizontalDistance,
    verticalDistance,
    nodeWidth,
    nodeHeight,
  });

  // Add onClick handler to nodes
  const nodesWithEvents = useMemo(() => {
    return nodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        id: node.id,
        onNodeClick: handleNodeClick,
      },
    }));
  }, [nodes]);

  // Define node types for the ReactFlow component
  const nodeTypes = useMemo(() => ({ inventoryItem: InventoryItemNode }), []);

  // Define proOptions to hide the watermark
  const proOptions = { hideAttribution: true };

  return (
    <>
      <ReactFlow
        nodes={nodesWithEvents}
        edges={edges}
        nodeTypes={nodeTypes}
        proOptions={proOptions}
        className="bg-background h-full w-full rounded-md"
        fitView
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
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
          onClose={() => setIsCustomizationPanelOpen(false)}
        />
      </ReactFlow>

      {selectedItem && (
        <EditItemDrawer
          item={selectedItem}
          isOpen={isDrawerOpen}
          onOpenChange={setIsDrawerOpen}
        />
      )}
    </>
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
