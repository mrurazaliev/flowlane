import { create } from "zustand"

const REFRESH_KEY = "refresh_token"

type AuthState = {
    accessToken:string | null
    setTokens:(access:string , refreshh:string)=>void
    clearTokens:()=>void
}

export const  useAuthStore = create<AuthState>((set)=>({

  accessToken: null,

  setTokens:(access,refresh)=>{
    localStorage.setItem(REFRESH_KEY,refresh)
    set({accessToken:access})
  },

  clearTokens:()=>{
    localStorage.removeItem(REFRESH_KEY)
    set({accessToken:null})
  }

}))

export function getRefreshToken() {
    if (typeof window==="undefined") return null
    return localStorage.getItem(REFRESH_KEY)
}