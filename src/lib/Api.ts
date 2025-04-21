import axios from "axios";

// Define the base API URL - this should point to your backend API
const API_BASE_URL = import.meta.env.VITE_API_URL;

// Create an API client
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// API endpoints for inventory management
export const inventoryApi = {
  // Check database connection and ensure it exists
  ensureDatabase: async () => {
    try {
      const response = await apiClient.get("/health");
      return response.data;
    } catch (error) {
      console.error("Failed to check database status:", error);
      throw error;
    }
  },

  // Get all inventory items
  getAllItems: async () => {
    const response = await apiClient.get("/inventory");
    return response.data;
  },

  // Get a specific inventory item by ID
  getItemById: async (id: string) => {
    const response = await apiClient.get(`/inventory/${id}`);
    return response.data;
  },

  // Create a new inventory item
  createItem: async (data: any) => {
    const response = await apiClient.post("/inventory", data);
    return response.data;
  },

  // Update an existing inventory item
  updateItem: async (id: string, data: any) => {
    const response = await apiClient.put(`/inventory/${id}`, data);
    return response.data;
  },

  // Delete an inventory item
  deleteItem: async (id: string) => {
    const response = await apiClient.delete(`/inventory/${id}`);
    return response.data;
  },
};

export default inventoryApi;
