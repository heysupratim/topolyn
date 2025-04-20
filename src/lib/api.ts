import axios from "axios";

// Define the base API URL - this should point to your backend API
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001/api";

// Create an API client
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// API endpoints for inventory management
export const inventoryApi = {
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
