import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { inventoryApi } from "@/lib/Api";

// Define the shape of an inventory item
export type InventoryItem = {
  id: string;
  name: string;
  type: string;
  ipAddress: string | null;
  createdAt: Date;
  updatedAt: Date;
  outgoingLinks?: ItemLink[];
  incomingLinks?: ItemLink[];
};

// Define the shape of an item link
export type ItemLink = {
  id: string;
  linkType: string;
  port?: string;
  sourceItemId: string;
  targetItemId: string;
  sourceItem?: InventoryItem;
  targetItem?: InventoryItem;
  createdAt: Date;
};

// Define the shape of our context
interface InventoryContextType {
  items: InventoryItem[];
  isLoading: boolean;
  error: Error | null;
  refreshInventory: () => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  updateItem: (item: InventoryItem) => Promise<void>;
  getItemLinks: (id: string) => Promise<ItemLink[]>;
  addItemLink: (
    id: string,
    linkedItemId: string,
    linkType: string,
    port?: string,
  ) => Promise<void>;
  updateItemLink: (
    id: string,
    linkId: string,
    linkType: string,
    port?: string,
  ) => Promise<void>;
  removeItemLink: (id: string, linkId: string) => Promise<void>;
}

// Create the context with a default value
const InventoryContext = createContext<InventoryContextType | undefined>(
  undefined,
);

// Props for the context provider
interface InventoryProviderProps {
  children: ReactNode;
}

// Provider component that wraps parts of the app that need access to the inventory state
export function InventoryProvider({ children }: InventoryProviderProps) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Function to fetch inventory items
  const refreshInventory = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await inventoryApi.getAllItems(true); // Include links by default
      setItems(data);
    } catch (err) {
      console.error("Failed to fetch inventory items:", err);
      setError(
        err instanceof Error
          ? err
          : new Error("Failed to fetch inventory items"),
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Function to delete an inventory item
  const deleteItem = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await inventoryApi.deleteItem(id);
      // Refresh the inventory after deletion
      await refreshInventory();
    } catch (err) {
      console.error("Failed to delete inventory item:", err);
      setError(
        err instanceof Error
          ? err
          : new Error("Failed to delete inventory item"),
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Function to update an inventory item
  const updateItem = async (item: InventoryItem) => {
    try {
      setIsLoading(true);
      setError(null);
      await inventoryApi.updateItem(item.id, item);
      // Refresh the inventory after update
      await refreshInventory();
    } catch (err) {
      console.error("Failed to update inventory item:", err);
      setError(
        err instanceof Error
          ? err
          : new Error("Failed to update inventory item"),
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Function to get links for a specific item
  const getItemLinks = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const links = await inventoryApi.getItemLinks(id);
      return links;
    } catch (err) {
      console.error("Failed to get item links:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to get item links"),
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Function to add a link between two items
  const addItemLink = async (
    id: string,
    linkedItemId: string,
    linkType: string,
    port?: string,
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      await inventoryApi.addItemLink(id, linkedItemId, linkType, port);
      // Refresh the inventory after adding the link
      await refreshInventory();
    } catch (err) {
      console.error("Failed to add item link:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to add item link"),
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Function to update a link between two items
  const updateItemLink = async (
    id: string,
    linkId: string,
    linkType: string,
    port?: string,
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      await inventoryApi.updateItemLink(id, linkId, linkType, port);
      // Refresh the inventory after updating the link
      await refreshInventory();
    } catch (err) {
      console.error("Failed to update item link:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to update item link"),
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Function to remove a link between two items
  const removeItemLink = async (id: string, linkId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await inventoryApi.removeItemLink(id, linkId);
      // Refresh the inventory after removing the link
      await refreshInventory();
    } catch (err) {
      console.error("Failed to remove item link:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to remove item link"),
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    refreshInventory();
  }, []);

  // The value that will be provided to consumers of this context
  const value = {
    items,
    isLoading,
    error,
    refreshInventory,
    deleteItem,
    updateItem,
    getItemLinks,
    addItemLink,
    updateItemLink,
    removeItemLink,
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
}

// Custom hook for consuming the inventory context
export function useInventory() {
  const context = useContext(InventoryContext);

  if (context === undefined) {
    throw new Error("useInventory must be used within an InventoryProvider");
  }

  return context;
}
