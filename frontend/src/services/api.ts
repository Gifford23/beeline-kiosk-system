import axios from "axios";

// 1. Dynamic URL
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// 2. CREATE AXIOS INSTANCE
// We use this instance ('api') instead of the default 'axios'
// so we can apply settings (like auth headers) globally.
const api = axios.create({
  baseURL: API_URL,
});

// 3. ADD REQUEST INTERCEPTOR
// Before any request is sent, this code runs.
// It checks if a token exists and adds it to the headers.
api.interceptors.request.use(
  (config) => {
    // This assumes you store the token in localStorage with the key "token"
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- Customer Functions (Public) ---

export const fetchMenu = async () => {
  const response = await api.get("/menu");
  return response.data;
};

export const createOrder = async (orderData: any) => {
  const response = await api.post("/orders", orderData);
  return response.data;
};

// --- Kitchen Functions (Protected) ---

export const fetchKitchenOrders = async () => {
  const response = await api.get("/kitchen/orders");
  return response.data;
};

export const updateStatus = async (orderId: number, status: string) => {
  const response = await api.put(`/orders/${orderId}/status`, {
    status,
  });
  return response.data;
};

// --- Admin Functions (Protected) ---

export const addMenuItem = async (itemData: any) => {
  const response = await api.post("/menu", itemData);
  return response.data;
};

// *Added* to match your backend capabilities
export const updateMenuItem = async (id: number, itemData: any) => {
  const response = await api.put(`/menu/${id}`, itemData);
  return response.data;
};

export const toggleItemStatus = async (id: number) => {
  const response = await api.patch(`/menu/${id}/status`);
  return response.data;
};

export const deleteMenuItem = async (id: number) => {
  const response = await api.delete(`/menu/${id}`);
  return response.data;
};

export const fetchStats = async () => {
  const response = await api.get("/stats");
  return response.data;
};

export const fetchTransactions = async () => {
  const response = await api.get("/transactions");
  return response.data;
};

// --- Auth & Tracking ---

export const loginUser = async (credentials: any) => {
  // NOTE: This is the only one we might want to keep as raw 'axios'
  // to avoid sending a stale token, but using 'api' is also fine.
  const response = await api.post("/login", credentials);
  return response.data;
};

export const fetchOrderById = async (id: number) => {
  const response = await api.get(`/orders/${id}`);
  return response.data;
};
