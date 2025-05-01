import { useMemo } from "react";
import { Node, Edge, MarkerType } from "reactflow";
import { getIconForType } from "@/lib/Utils";
import { InventoryItem } from "@/context/InventoryContext";
import dagre from "dagre";

// All interfaces organized at the top
interface MapNodesOptions {
  items: InventoryItem[];
  horizontalDistance: number;
  verticalDistance: number;
  defaultNodeWidth: number; // Default width, used as fallback
  defaultNodeHeight: number; // Default height, used as fallback
  isVertical?: boolean;
  nodeDimensions?: Record<string, { width: number; height: number }>; // New parameter to receive node dimensions
}

export function useMapNodes({
  items,
  horizontalDistance,
  verticalDistance,
  defaultNodeWidth,
  defaultNodeHeight,
  isVertical,
  nodeDimensions = {}, // Default to empty object
}: MapNodesOptions) {
  // Create nodes from inventory items
  const nodes: Node[] = useMemo(() => {
    if (items.length === 0) return [];

    // Create initial nodes
    const initialNodes: Node[] = items.map((item) => {
      // Get custom dimensions for this node or use defaults
      const customDimension = nodeDimensions[item.id];
      const itemWidth = customDimension?.width || defaultNodeWidth;
      const itemHeight = customDimension?.height || defaultNodeHeight;

      return {
        id: item.id,
        type: "inventoryItem",
        // Position will be calculated by dagre
        position: { x: 0, y: 0 },
        data: {
          label: item.name,
          ipAddress: item.ipAddress,
          type: item.type,
          icon: getIconForType(item.type),
          width: itemWidth,
          height: itemHeight,
          services: item.services || [],
          isVertical: isVertical,
          id: item.id,
        },
      };
    });

    // Create edges for dagre layout calculation
    const edges: Edge[] = [];
    items.forEach((item) => {
      if (item.outgoingLinks) {
        item.outgoingLinks.forEach((link) => {
          edges.push({
            id: `${item.id}-${link.targetItemId}`,
            source: item.id,
            target: link.targetItemId,
          });
        });
      }
    });

    // Initialize dagre graph
    const dagreGraph = new dagre.graphlib.Graph();

    // Set an object for the graph label
    dagreGraph.setGraph({
      rankdir: isVertical ? "TB" : "LR", // Top to Bottom for vertical, Left to Right for horizontal
      nodesep: horizontalDistance,
      ranksep: verticalDistance,
      marginx: 50,
      marginy: 50,
    });

    // Default to assigning a new object as a label for each node
    dagreGraph.setDefaultNodeLabel(() => ({}));
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    // Add nodes to dagre
    initialNodes.forEach((node) => {
      const width = node.data.width;
      const height = node.data.height;
      dagreGraph.setNode(node.id, { width, height });
    });

    // Add edges to dagre
    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    // Calculate the layout
    dagre.layout(dagreGraph);

    // Get positions from dagre
    return initialNodes.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);

      if (!nodeWithPosition) {
        console.warn(`No position calculated for node ${node.id}`);
        return node;
      }

      // Dagre positions the node's center, we need to adjust to the top-left corner
      const position = {
        x: isVertical
          ? nodeWithPosition.x - node.data.width / 2
          : nodeWithPosition.x,
        y: isVertical
          ? nodeWithPosition.y
          : nodeWithPosition.y - node.data.height / 2,
      };

      return {
        ...node,
        position,
      };
    });
  }, [
    items,
    horizontalDistance,
    verticalDistance,
    defaultNodeWidth,
    defaultNodeHeight,
    isVertical,
    nodeDimensions,
  ]);

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
            labelBgStyle: {
              fill: "var(--card)",
              fillOpacity: 1,
              strokeWidth: 1,
              stroke: "var(--border)",
            },
            label: link.port
              ? `${link.linkType} | Port ${link.port}`
              : link.linkType,
            data: { linkType: link.linkType, port: link.port },
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

  return { nodes, edges };
}
