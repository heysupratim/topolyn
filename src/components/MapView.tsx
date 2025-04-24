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

    // Create a mapping of parents to their children
    const parentToChildren: Record<string, string[]> = {};

    // Map each child to its parent(s)
    items.forEach((item) => {
      if (item.outgoingLinks) {
        item.outgoingLinks.forEach((link) => {
          if (!parentToChildren[item.id]) {
            parentToChildren[item.id] = [];
          }
          parentToChildren[item.id].push(link.targetItemId);
        });
      }
    });

    // Create a mapping to store the x-position of each node
    const nodePositions: Record<string, { x: number; y: number }> = {};

    // Position nodes
    const positionedNodes: Node[] = [];

    // First position the top level nodes (level 0, typically ISPs)
    if (nodesByLevel[0]) {
      const levelZeroNodes = nodesByLevel[0];
      const totalWidth =
        levelZeroNodes.length * nodeWidth +
        (levelZeroNodes.length - 1) * horizontalDistance;
      const startX = -totalWidth / 2; // Center the first level nodes

      levelZeroNodes.forEach((nodeId, index) => {
        const xPos = startX + index * (nodeWidth + horizontalDistance);
        nodePositions[nodeId] = {
          x: xPos,
          y: 0,
        };
      });
    }

    // Then position the rest of the levels, aligning children with parents
    const processedLevels = nodesByLevel[0] ? [0] : [];

    // Process remaining levels in order
    const remainingLevels = Object.keys(nodesByLevel)
      .map(Number)
      .filter((level) => !processedLevels.includes(level))
      .sort((a, b) => a - b);

    // Create a reverse mapping of children to parents for ancestor adjustments
    const childToParents: Record<string, string[]> = {};
    items.forEach((item) => {
      if (item.outgoingLinks) {
        item.outgoingLinks.forEach((link) => {
          if (!childToParents[link.targetItemId]) {
            childToParents[link.targetItemId] = [];
          }
          childToParents[link.targetItemId].push(item.id);
        });
      }
    });

    // Function to check if two nodes overlap
    const nodesOverlap = (node1Id: string, node2Id: string) => {
      const node1Pos = nodePositions[node1Id];
      const node2Pos = nodePositions[node2Id];

      if (!node1Pos || !node2Pos) return false;

      const node1Left = node1Pos.x;
      const node1Right = node1Pos.x + nodeWidth;
      const node2Left = node2Pos.x;
      const node2Right = node2Pos.x + nodeWidth;

      // Check horizontal overlap with a small buffer
      const buffer = 10; // Extra buffer space to ensure visual separation
      return node1Right + buffer > node2Left && node1Left - buffer < node2Right;
    };

    // Function to ensure minimum spacing between nodes on the same level
    const enforceMinimumSpacing = (nodeIds: string[]) => {
      if (nodeIds.length <= 1) return;

      // Sort nodes by x position
      const sortedNodeIds = [...nodeIds].sort(
        (a, b) => (nodePositions[a]?.x || 0) - (nodePositions[b]?.x || 0),
      );

      // Iterate through nodes and ensure minimum spacing
      for (let i = 1; i < sortedNodeIds.length; i++) {
        const prevNodeId = sortedNodeIds[i - 1];
        const currentNodeId = sortedNodeIds[i];

        const prevNode = nodePositions[prevNodeId];
        const currentNode = nodePositions[currentNodeId];

        if (prevNode && currentNode) {
          const minRequiredX = prevNode.x + nodeWidth + horizontalDistance;

          // If current node is too close to previous node, adjust its position
          if (currentNode.x < minRequiredX) {
            const adjustmentNeeded = minRequiredX - currentNode.x;

            // Shift current node and all nodes to its right
            for (let j = i; j < sortedNodeIds.length; j++) {
              const nodeToShift = sortedNodeIds[j];
              if (nodePositions[nodeToShift]) {
                nodePositions[nodeToShift].x += adjustmentNeeded;
              }
            }
          }
        }
      }
    };

    // Function to recursively adjust ancestor positions
    const adjustAncestorPositions = (
      nodeId: string,
      moveDistance: number,
      processedNodes = new Set<string>(),
    ) => {
      if (processedNodes.has(nodeId)) return;
      processedNodes.add(nodeId);

      // Adjust this node's position
      if (nodePositions[nodeId]) {
        nodePositions[nodeId].x += moveDistance;
      }

      // Adjust all children positions to maintain parent-child alignment
      if (parentToChildren[nodeId]) {
        parentToChildren[nodeId].forEach((childId) => {
          if (nodePositions[childId]) {
            nodePositions[childId].x += moveDistance;

            // Also adjust any children of this child recursively
            if (parentToChildren[childId]) {
              adjustAncestorPositions(childId, moveDistance, processedNodes);
            }
          }
        });
      }

      // Adjust all parents' positions (if needed for balance)
      if (childToParents[nodeId]) {
        childToParents[nodeId].forEach((parentId) => {
          // Only adjust parent if all its children have been processed
          const allChildrenProcessed =
            parentToChildren[parentId]?.every((id) => processedNodes.has(id)) ??
            true;
          if (allChildrenProcessed) {
            // Recenter parent over its children
            const childrenIds = parentToChildren[parentId] || [];
            if (
              childrenIds.length > 0 &&
              childrenIds.every((id) => nodePositions[id])
            ) {
              const childLeftmost = Math.min(
                ...childrenIds.map((id) => nodePositions[id].x),
              );
              const childRightmost = Math.max(
                ...childrenIds.map((id) => nodePositions[id].x + nodeWidth),
              );
              const centerPoint =
                childLeftmost + (childRightmost - childLeftmost) / 2;
              const parentCenter = nodePositions[parentId].x + nodeWidth / 2;
              const delta = centerPoint - parentCenter;

              if (Math.abs(delta) > 5) {
                // Only adjust if the difference is significant
                nodePositions[parentId].x += delta;

                // Continue adjustment up the ancestor chain
                adjustAncestorPositions(parentId, 0, processedNodes);
              }
            }
          }
        });
      }
    };

    remainingLevels.forEach((level) => {
      const levelNodes = nodesByLevel[level];

      // Group children by their parents to position them together
      const childrenByParent: Record<string, string[]> = {};

      // Find parents for each node at this level
      levelNodes.forEach((nodeId) => {
        let foundParent = false;

        // Check if this node has a parent from previous levels
        items.forEach((item) => {
          if (item.outgoingLinks) {
            item.outgoingLinks.forEach((link) => {
              if (link.targetItemId === nodeId && nodeLevels[item.id] < level) {
                const parentId = item.id;
                if (!childrenByParent[parentId]) {
                  childrenByParent[parentId] = [];
                }
                childrenByParent[parentId].push(nodeId);
                foundParent = true;
              }
            });
          }
        });

        // If no parent found, treat as orphan node
        if (!foundParent) {
          if (!childrenByParent["orphans"]) {
            childrenByParent["orphans"] = [];
          }
          childrenByParent["orphans"].push(nodeId);
        }
      });

      // Initial positioning of children based on their parents
      Object.entries(childrenByParent).forEach(([parentId, children]) => {
        if (parentId === "orphans") {
          // Position orphan nodes centered at this level
          const totalWidth =
            children.length * nodeWidth +
            (children.length - 1) * horizontalDistance;
          const startX = -totalWidth / 2;

          children.forEach((nodeId, index) => {
            const xPos = startX + index * (nodeWidth + horizontalDistance);
            nodePositions[nodeId] = {
              x: xPos,
              y: level * (verticalDistance + nodeHeight),
            };
          });
        } else {
          // Position children underneath their parent
          const parentXPos = nodePositions[parentId]?.x || 0;
          const totalWidth =
            children.length * nodeWidth +
            (children.length - 1) * horizontalDistance;
          const startX = parentXPos - totalWidth / 2 + nodeWidth / 2;

          children.forEach((nodeId, index) => {
            const xPos = startX + index * (nodeWidth + horizontalDistance);
            nodePositions[nodeId] = {
              x: xPos,
              y: level * (verticalDistance + nodeHeight),
            };
          });
        }
      });

      // Apply minimum spacing enforcement to all nodes at this level
      enforceMinimumSpacing(levelNodes);

      // Check for overlaps between different parent groups at this level
      const sortedLevelNodes = [...levelNodes].sort(
        (a, b) => (nodePositions[a]?.x || 0) - (nodePositions[b]?.x || 0),
      );

      // Resolve overlaps by shifting nodes and their descendants
      for (let i = 0; i < sortedLevelNodes.length - 1; i++) {
        const currentNodeId = sortedLevelNodes[i];
        const nextNodeId = sortedLevelNodes[i + 1];

        if (nodesOverlap(currentNodeId, nextNodeId)) {
          const currentRight = nodePositions[currentNodeId].x + nodeWidth;
          const nextLeft = nodePositions[nextNodeId].x;
          const overlap = currentRight - nextLeft + horizontalDistance;

          // Shift the right node (and all its descendants) to eliminate overlap
          adjustAncestorPositions(nextNodeId, overlap, new Set<string>());

          // Re-sort the nodes after adjustment
          sortedLevelNodes.sort(
            (a, b) => (nodePositions[a]?.x || 0) - (nodePositions[b]?.x || 0),
          );

          // Reset counter to check new adjacencies
          i = Math.max(0, i - 1);
        }
      }

      // Apply minimum spacing enforcement again after overlap resolution
      enforceMinimumSpacing(levelNodes);

      // After resolving overlaps, recenter parents over their children
      const processedNodes = new Set<string>();
      Object.keys(childrenByParent).forEach((parentId) => {
        if (parentId !== "orphans" && !processedNodes.has(parentId)) {
          adjustAncestorPositions(parentId, 0, processedNodes);
        }
      });
    });

    // Create the actual node objects using calculated positions
    items.forEach((item) => {
      if (nodePositions[item.id]) {
        const { x, y } = nodePositions[item.id];
        positionedNodes.push({
          id: item.id,
          type: "inventoryItem",
          position: { x, y },
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
