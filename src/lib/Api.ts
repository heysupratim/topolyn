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
  getAllItems: async (includeLinks = false) => {
    const response = await apiClient.get(
      `/inventory?includeLinks=${includeLinks}`,
    );
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

  // Get services for a specific inventory item
  getItemServices: async (id: string) => {
    const response = await apiClient.get(`/inventory/${id}/services`);
    return response.data;
  },

  // Add a service to an inventory item
  addItemService: async (id: string, name: string, imageUrl?: string) => {
    const response = await apiClient.post(`/inventory/${id}/services`, {
      name,
      imageUrl,
    });
    return response.data;
  },

  // Update a service
  updateItemService: async (id: string, serviceId: string, name: string, imageUrl?: string) => {
    const response = await apiClient.put(`/inventory/${id}/services/${serviceId}`, {
      name,
      imageUrl,
    });
    return response.data;
  },

  // Delete a service from an inventory item
  removeItemService: async (id: string, serviceId: string) => {
    const response = await apiClient.delete(`/inventory/${id}/services/${serviceId}`);
    return response.data;
  },

  // Get links for a specific inventory item
  getItemLinks: async (id: string) => {
    const response = await apiClient.get(`/inventory/${id}/links`);
    return response.data;
  },

  // Add a link between two inventory items
  addItemLink: async (
    id: string,
    linkedItemId: string,
    linkType: string,
    port?: string,
  ) => {
    const response = await apiClient.post(`/inventory/${id}/links`, {
      linkedItemId,
      linkType,
      port,
    });
    return response.data;
  },

  // Update a link between two inventory items
  updateItemLink: async (
    id: string,
    linkId: string,
    linkType: string,
    port?: string,
  ) => {
    const response = await apiClient.put(`/inventory/${id}/links/${linkId}`, {
      linkType,
      port,
    });
    return response.data;
  },

  // Remove a link between two inventory items
  removeItemLink: async (id: string, linkId: string) => {
    const response = await apiClient.delete(`/inventory/${id}/links/${linkId}`);
    return response.data;
  },
};

export default inventoryApi;
