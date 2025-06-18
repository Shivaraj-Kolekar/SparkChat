import axios from "axios";

// Create a configured axios instance for API calls
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to ensure cookies are sent
apiClient.interceptors.request.use(
  (config) => {
    // Ensure credentials are included
    config.withCredentials = true;

    // Add any additional headers if needed
    if (typeof window !== "undefined") {
      // Add any client-side headers here if needed
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Export common API methods
export const api = {
  get: (url: string, config = {}) => apiClient.get(url, config),
  post: (url: string, data = {}, config = {}) =>
    apiClient.post(url, data, config),
  put: (url: string, data = {}, config = {}) =>
    apiClient.put(url, data, config),
  delete: (url: string, config = {}) => apiClient.delete(url, config),
};
