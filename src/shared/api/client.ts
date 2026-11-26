import axios from "axios";
import { getRefreshToken, useAuthStore } from "./auth-store";



export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api/v1";

export const api= axios.create(
  {
    baseURL:API_URL,
  }
)

api.interceptors.request.use((config)=>{
    const token=useAuthStore.getState().accessToken
    if (token){
     config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

let refreshPromise: Promise<string> | null = null

const refreshAccessToken = async (): Promise<string> => {
  const refresh = getRefreshToken()
  if (!refresh) {
    throw new Error("No refresh token")
  }

  const { data } = await axios.post(`${API_URL}/auth/refresh`, {
    refresh_token: refresh,
  })
  useAuthStore.getState().setTokens(data.access_token, data.refresh_token)
  return data.access_token
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error)
    }
    original._retry = true

    try {
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null
        })
      }
      const newToken = await refreshPromise
      original.headers.Authorization = `Bearer ${newToken}`
      return api(original)
    } catch (e) {
      useAuthStore.getState().clearTokens()
      window.location.href = "/login"
      return Promise.reject(e)
    }
  }
)
)