import { getRefreshToken, useAuthStore } from "@/shared/api/auth-store";
import { api } from "@/shared/api/client";
import { queryKeys } from "@/shared/api/queryKeys";
import { User } from "@/shared/api/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = {
  email: string;
  password: string;
  display_name: string;
};

type AuthResponse = {
  access_token: string;
  refresh_token: string;
  user: User;
};

export const useLoginMutation =()=>
    useMutation({
        mutationFn:async (body:LoginInput)=>{
            const {data}= await api.post('/auth/login',body)
            return data
        },
        onSuccess:(data)=>{
            useAuthStore.getState().setTokens(data.access_token,data.refresh_token)
        }
    })

    export const useRegisterMutation =()=>
    useMutation({
        mutationFn:async(body:RegisterInput)=>{
            const {data}= await api.post('/auth/register',body)
            return data
        },
        onSuccess:(data)=>{
            useAuthStore.getState().setTokens(data.access_token,data.refresh_token)
        }
    })

export const useGoogleLoginMutation = () =>
  useMutation({
    mutationFn: async (credential: string) => {
      const { data } = await api.post<AuthResponse>('/auth/google', { credential });
      return data;
    },
    onSuccess: (data) => {
      useAuthStore.getState().setTokens(data.access_token, data.refresh_token);
    },
  });

export const useGetMeQuery = () =>
  useQuery({
    queryKey: queryKeys.me,
    queryFn: async () => {
      const { data } = await api.get<User>('/auth/me');
      return data;
    },
  });

export const useLogoutMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const refresh = getRefreshToken();
      if (refresh) {
        await api.post('/auth/logout', { refresh_token: refresh });
      }
    },
    onSettled: () => {
      useAuthStore.getState().clearTokens();
      queryClient.clear();
    },
  });
};

export type MeUpdate = {
  display_name?: string;
  avatar_url?: string | null;
};

export const useEditMeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (changes: MeUpdate) => {
      const { data } = await api.patch<User>('/auth/me', changes);
      return data;
    },
    onSuccess: (user) => queryClient.setQueryData(queryKeys.me, user),
  });
};

export type PasswordChange = {
  current_password: string;
  new_password: string;
};

export const useChangePasswordMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: PasswordChange) => api.post('/auth/change-password', body),
    onSuccess: () => {
      useAuthStore.getState().clearTokens();
      queryClient.clear();
    },
  });
};
