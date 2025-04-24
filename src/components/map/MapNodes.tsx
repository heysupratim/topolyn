import { useMemo } from "react";
import { Node, Edge, MarkerType } from "reactflow";
import { getIconForType } from "@/lib/Utils";
import { InventoryItem } from "@/context/InventoryContext";

interface MapNodesOptions {
  items: InventoryItem[];
  horizontalDistance: number;
  verticalDistance: number;
  nodeWidth: number;
  nodeHeight: number;
}

export function useMapNodes({
  items,
  horizontalDistance,
  verticalDistance,
  nodeWidth,
  nodeHeight,
}: MapNodesOptions) {
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

      // Check horizontal overlap with a buffer to ensure visual separation
      return node1Right > node2Left && node1Left < node2Right;
    };

    // Function to ensure minimum spacing between nodes on the same level
    const enforceMinimumSpacing = (
      nodeIds: string[],
      minSpacing = horizontalDistance,
    ) => {
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
          const minRequiredX = prevNode.x + nodeWidth + minSpacing;

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
    };

    // Function to center parent node over its children
    const centerParentOverChildren = (
      parentId: string,
      processedNodes = new Set<string>(),
    ) => {
      if (processedNodes.has(parentId)) return;
      processedNodes.add(parentId);

      const childrenIds = parentToChildren[parentId] || [];

      if (
        childrenIds.length > 0 &&
        childrenIds.every((id) => nodePositions[id])
      ) {
        // Find leftmost and rightmost coordinates of all children
        const childLeftmost = Math.min(
          ...childrenIds.map((id) => nodePositions[id].x),
        );
        const childRightmost = Math.max(
          ...childrenIds.map((id) => nodePositions[id].x + nodeWidth),
        );

        // Calculate center point of children's bounding box
        const centerPoint =
          childLeftmost + (childRightmost - childLeftmost) / 2;

        // Get current center point of parent
        const parentCenter = nodePositions[parentId].x + nodeWidth / 2;

        // Calculate adjustment needed
        const adjustment = centerPoint - parentCenter;

        if (Math.abs(adjustment) > 2) {
          // Only adjust if difference is significant
          nodePositions[parentId].x += adjustment;

          // Propagate adjustment to parent's parents if needed
          if (childToParents[parentId]) {
            childToParents[parentId].forEach((parentParentId) => {
              centerParentOverChildren(parentParentId, processedNodes);
            });
          }
        }
      }
    };

    // Improved function to check and resolve overlaps across the entire tree
    const resolveAllOverlaps = () => {
      let overlapsResolved = true;
      let iterations = 0;
      const maxIterations = 50; // Safety to prevent infinite loops

      do {
        overlapsResolved = true;
        iterations++;

        // Check each level for overlaps
        Object.keys(nodesByLevel).forEach((levelStr) => {
          const level = parseInt(levelStr);
          const levelNodes = nodesByLevel[level];

          if (levelNodes.length <= 1) return;

          // Sort nodes by x position
          const sortedNodes = [...levelNodes].sort(
            (a, b) => (nodePositions[a]?.x || 0) - (nodePositions[b]?.x || 0),
          );

          // Check each adjacent pair for overlaps
          for (let i = 0; i < sortedNodes.length - 1; i++) {
            const currentNodeId = sortedNodes[i];
            const nextNodeId = sortedNodes[i + 1];

            if (nodesOverlap(currentNodeId, nextNodeId)) {
              // Calculate required adjustment
              const currentRight = nodePositions[currentNodeId].x + nodeWidth;
              const nextLeft = nodePositions[nextNodeId].x;
              const overlap = currentRight - nextLeft + horizontalDistance;

              // Move the right node (and its descendants)
              adjustAncestorPositions(nextNodeId, overlap, new Set<string>());

              // Recenter parents after adjustments
              if (childToParents[nextNodeId]) {
                childToParents[nextNodeId].forEach((parentId) => {
                  centerParentOverChildren(parentId, new Set<string>());
                });
              }

              overlapsResolved = false;
              break; // Restart checking this level with new positions
            }
          }
        });
      } while (!overlapsResolved && iterations < maxIterations);

      // Final spacing pass to ensure minimum distances
      Object.values(nodesByLevel).forEach((levelNodes) => {
        enforceMinimumSpacing(levelNodes, horizontalDistance);
      });
    };

    // First position the top level nodes (level 0, typically ISPs)
    if (nodesByLevel[0]) {
      const levelZeroNodes = nodesByLevel[0];
      // Use more spacing for top level nodes
      const spacingForTopLevel = horizontalDistance * 1.5;
      const totalWidth =
        levelZeroNodes.length * nodeWidth +
        (levelZeroNodes.length - 1) * spacingForTopLevel;
      const startX = -totalWidth / 2; // Center the first level nodes

      levelZeroNodes.forEach((nodeId, index) => {
        const xPos = startX + index * (nodeWidth + spacingForTopLevel);
        nodePositions[nodeId] = {
          x: xPos,
          y: 0,
        };
      });
    }

    // Process remaining levels in order
    const remainingLevels = Object.keys(nodesByLevel)
      .map(Number)
      .filter((level) => level > 0)
      .sort((a, b) => a - b);

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
          const minChildSpacing = horizontalDistance;
          const totalWidth =
            children.length * nodeWidth +
            (children.length - 1) * minChildSpacing;

          // Center children under parent
          const startX = parentXPos - totalWidth / 2 + nodeWidth / 2;

          children.forEach((nodeId, index) => {
            const xPos = startX + index * (nodeWidth + minChildSpacing);
            nodePositions[nodeId] = {
              x: xPos,
              y: level * (verticalDistance + nodeHeight),
            };
          });
        }
      });

      // Apply minimum spacing enforcement to all nodes at this level
      enforceMinimumSpacing(levelNodes, horizontalDistance);

      // After positioning the children, check for overlaps and adjust
      let hasOverlaps = true;
      const maxOverlapIterations = 5;
      let overlapIteration = 0;

      while (hasOverlaps && overlapIteration < maxOverlapIterations) {
        overlapIteration++;
        hasOverlaps = false;

        // Sort nodes by x position
        const sortedLevelNodes = [...levelNodes].sort(
          (a, b) => (nodePositions[a]?.x || 0) - (nodePositions[b]?.x || 0),
        );

        // Check for and resolve overlaps
        for (let i = 0; i < sortedLevelNodes.length - 1; i++) {
          const currentNodeId = sortedLevelNodes[i];
          const nextNodeId = sortedLevelNodes[i + 1];

          if (nodesOverlap(currentNodeId, nextNodeId)) {
            hasOverlaps = true;

            // Calculate adjustment needed
            const currentRight = nodePositions[currentNodeId].x + nodeWidth;
            const nextLeft = nodePositions[nextNodeId].x;
            const overlap = currentRight - nextLeft + horizontalDistance + 20;

            // Shift the next node and its descendants
            adjustAncestorPositions(nextNodeId, overlap, new Set<string>());

            // Re-sort after adjustment
            sortedLevelNodes.sort(
              (a, b) => (nodePositions[a]?.x || 0) - (nodePositions[b]?.x || 0),
            );

            // Restart checking from the adjusted node
            i = Math.max(0, i - 1);
          }
        }
      }

      // After resolving overlaps, recenter parents over their children
      Object.keys(childrenByParent).forEach((parentId) => {
        if (parentId !== "orphans") {
          centerParentOverChildren(parentId, new Set<string>());
        }
      });
    });

    // Final pass to resolve any remaining overlaps across the entire tree
    resolveAllOverlaps();

    // Balance the tree by making sure parents are centered over their children
    // Start from the bottom level and work upward
    remainingLevels.reverse().forEach((level) => {
      const levelNodes = nodesByLevel[level];

      levelNodes.forEach((nodeId) => {
        if (childToParents[nodeId]) {
          childToParents[nodeId].forEach((parentId) => {
            centerParentOverChildren(parentId, new Set<string>());
          });
        }
      });
    });

    // Apply one final check for overlaps
    resolveAllOverlaps();

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

  return { nodes, edges };
}
