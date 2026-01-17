import axios from "axios";

// 1. Dynamic URL: Uses Railway URL in production, localhost in dev
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// --- Customer Functions ---

export const fetchMenu = async () => {
  const response = await axios.get(`${API_URL}/menu`);
  return response.data;
};

// 2. FIX: Renamed to 'createOrder' to match CheckoutPage logic
export const createOrder = async (orderData: any) => {
  const response = await axios.post(`${API_URL}/orders`, orderData);
  return response.data;
};

// --- Kitchen Functions ---

export const fetchKitchenOrders = async () => {
  const response = await axios.get(`${API_URL}/kitchen/orders`);
  return response.data;
};

export const updateStatus = async (orderId: number, status: string) => {
  const response = await axios.put(`${API_URL}/orders/${orderId}/status`, {
    status,
  });
  return response.data;
};

// --- Admin Functions ---

export const addMenuItem = async (itemData: any) => {
  const response = await axios.post(`${API_URL}/menu`, itemData);
  return response.data;
};

export const toggleItemStatus = async (id: number) => {
  const response = await axios.patch(`${API_URL}/menu/${id}/status`);
  return response.data;
};

export const deleteMenuItem = async (id: number) => {
  const response = await axios.delete(`${API_URL}/menu/${id}`);
  return response.data;
};

export const fetchStats = async () => {
  const response = await axios.get(`${API_URL}/stats`);
  return response.data;
};

export const fetchTransactions = async () => {
  const response = await axios.get(`${API_URL}/transactions`);
  return response.data;
};

export const loginUser = async (credentials: any) => {
  const response = await axios.post(`${API_URL}/login`, credentials);
  return response.data;
};

// --- Order Tracking ---

export const fetchOrderById = async (id: number) => {
  const response = await axios.get(`${API_URL}/orders/${id}`);
  return response.data;
};
