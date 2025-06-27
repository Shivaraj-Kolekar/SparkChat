import axios from 'axios'
import type { AxiosRequestHeaders } from 'axios'

// Create a configured axios instance for API calls
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000 // 30 second timeout to allow for server delays
})

// Utility to get Clerk token outside React components
export async function getClerkToken () {
  if (typeof window === 'undefined') return null
  // Clerk loads on window as Clerk, or via window.__clerk
  const w = window as typeof window & { Clerk?: any; __clerk?: any }
  const clerk = w.Clerk || w.__clerk
  if (clerk && clerk.session) {
    try {
      // getToken() returns a promise
      return await clerk.session.getToken()
    } catch (e) {
      return null
    }
  }
  return null
}

// Add request interceptor to ensure cookies are sent and add Authorization header
apiClient.interceptors.request.use(
  async config => {
    // Log request details in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`)
    }

    // Ensure credentials are included
    config.withCredentials = true

    // Add Authorization header with Clerk token if available
    if (typeof window !== 'undefined') {
      const token = await getClerkToken()
      if (token) {
        if (!config.headers) config.headers = {} as AxiosRequestHeaders
        ;(config.headers as Record<string, string>)[
          'Authorization'
        ] = `Bearer ${token}`
        console.log('Clerk token added to request headers')
      } else {
        console.log('No Clerk token available for request')
      }
    }

    return config
  },
  error => {
    console.error('API Request Error:', error)
    return Promise.reject(error)
  }
)

// Add response interceptor to handle auth errors
apiClient.interceptors.response.use(
  response => {
    // Log successful responses in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Response: ${response.status} ${response.config.url}`)
    }
    return response
  },
  error => {
    // Enhanced error logging
    console.error('API Response Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method,
      message: error.message,
      data: error.response?.data
    })

    // Don't automatically redirect on 401 - let components handle it
    if (error.response?.status === 401) {
      console.log('Unauthorized access detected')
      // Let the calling component decide how to handle this
    }

    // Handle network errors
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      console.error('API request timed out')
    }

    // Handle connection errors
    if (
      error.code === 'ERR_NETWORK' ||
      error.message.includes('Network Error')
    ) {
      console.error('Network error - check if server is running and accessible')
    }

    return Promise.reject(error)
  }
)

// Export common API methods
export const api = {
  get: (url: string, config = {}) => apiClient.get(url, config),
  post: (url: string, data = {}, config = {}) =>
    apiClient.post(url, data, config),
  put: (url: string, data = {}, config = {}) =>
    apiClient.put(url, data, config),
  delete: (url: string, config = {}) => apiClient.delete(url, config)
}
