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
};

// Define the shape of our context
interface InventoryContextType {
  items: InventoryItem[];
  isLoading: boolean;
  error: Error | null;
  refreshInventory: () => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
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
      const data = await inventoryApi.getAllItems();
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
