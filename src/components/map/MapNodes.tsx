import { useMemo } from "react";
import { Node, Edge, MarkerType } from "reactflow";
import { getIconForType } from "@/lib/Utils";
import { InventoryItem } from "@/context/InventoryContext";
import { flextree } from "d3-flextree";

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

interface HierarchyItem {
  id: string;
  children: HierarchyItem[];
}

interface ItemWithChildren extends InventoryItem {
  children: string[];
}

interface NodePosition {
  x: number;
  y: number;
}

// Helper function to create a hierarchical tree structure
function createHierarchy(items: InventoryItem[]): HierarchyItem {
  // Create a mapping from id to item for faster lookup
  const itemMap = new Map<string, ItemWithChildren>();

  // Initialize items with empty children arrays
  items.forEach((item) => {
    itemMap.set(item.id, { ...item, children: [] });
  });

  // Build parent-child relationships based on links
  items.forEach((item) => {
    if (item.outgoingLinks) {
      item.outgoingLinks.forEach((link) => {
        const source = itemMap.get(item.id);
        if (source) {
          source.children.push(link.targetItemId);
        }
      });
    }
  });

  // Find root nodes (nodes without incoming links)
  const childNodes = new Set<string>();
  items.forEach((item) => {
    if (item.outgoingLinks) {
      item.outgoingLinks.forEach((link) => {
        childNodes.add(link.targetItemId);
      });
    }
  });

  const rootNodes = items.filter((item) => !childNodes.has(item.id));

  // If no clear root, use the first item as root
  if (rootNodes.length === 0 && items.length > 0) {
    return { id: items[0].id, children: buildTree(items[0].id, itemMap) };
  }

  // If multiple roots, create a virtual root
  if (rootNodes.length > 1) {
    return {
      id: "virtual-root",
      children: rootNodes.map((root) => ({
        id: root.id,
        children: buildTree(root.id, itemMap),
      })),
    };
  }

  // Single root case
  if (rootNodes.length === 1) {
    return {
      id: rootNodes[0].id,
      children: buildTree(rootNodes[0].id, itemMap),
    };
  }

  // Fallback for empty items array
  return { id: "empty", children: [] };
}

// Recursive function to build the tree
function buildTree(
  rootId: string,
  itemMap: Map<string, ItemWithChildren>,
): HierarchyItem[] {
  const item = itemMap.get(rootId);
  if (!item) return [];

  return item.children.map((childId) => {
    const children = buildTree(childId, itemMap);
    return {
      id: childId,
      children: children,
    };
  });
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
    // Create a mapping to store the x,y position of each node
    const nodePositions: Record<string, NodePosition> = {};

    // Create a hierarchical structure from the items
    const hierarchy = createHierarchy(items);

    // Set up the flextree layout with dynamic node sizing
    const layout = flextree<HierarchyItem>({
      children: (d) => d.children || [],
      nodeSize: (d) => {
        // Get the custom dimensions for this node, or use default values
        const nodeDimension = nodeDimensions[d.data.id];
        const width = nodeDimension?.width || defaultNodeWidth;
        const height = nodeDimension?.height || defaultNodeHeight;

        return [width, height + verticalDistance];
      },
    }).spacing(() => horizontalDistance);

    // Apply the layout
    const tree = layout.hierarchy(hierarchy);
    layout(tree);

    // Extract positions from the layout
    tree.each((node) => {
      if ((node.data as HierarchyItem).id !== "virtual-root") {
        nodePositions[node.data.id] = {
          x: isVertical ? node.x : node.y,
          y: isVertical ? node.y : node.x,
        };
      }
    });

    // Create the actual node objects using calculated positions
    const positionedNodes: Node[] = [];
    items.forEach((item) => {
      // Get custom dimensions for this node or use defaults
      const customDimension = nodeDimensions[item.id];
      const itemWidth = customDimension?.width || defaultNodeWidth;
      const itemHeight = customDimension?.height || defaultNodeHeight;

      // Ensure every item has a position, even if not in the hierarchy
      const position = nodePositions[item.id] || {
        x: Math.random() * (items.length * (itemWidth + horizontalDistance)),
        y: Math.random() * (5 * (itemHeight + verticalDistance)),
      };

      positionedNodes.push({
        id: item.id,
        type: "inventoryItem",
        position: position,
        data: {
          label: item.name,
          ipAddress: item.ipAddress,
          type: item.type,
          icon: getIconForType(item.type),
          width: itemWidth,
          height: itemHeight,
        },
      });
    });

    return positionedNodes;
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
