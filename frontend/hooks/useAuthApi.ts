import { useMutation } from '@tanstack/react-query';
import api from '../api/client';

export function useLogin() {
  return useMutation({
    mutationKey: ["login"],
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationKey: ["register"],
    mutationFn: async (userData: { name: string; email: string; password: string }) => {
      const response = await api.post('/auth/register', userData);
      return response.data;
    },
  });
}
