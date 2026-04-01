import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { AxiosError } from 'axios';
import api from '@/lib/api';
import type { UpworkAccount } from '@/types';

function extractError(error: unknown, fallback: string): string {
  const msg = (error as AxiosError<{ message: string | string[] }>)?.response?.data?.message;
  return Array.isArray(msg) ? msg[0] : msg || fallback;
}

export function useUpworkAccounts() {
  return useQuery<UpworkAccount[]>({
    queryKey: ['upwork-accounts'],
    queryFn: async () => {
      const res = await api.get('/auth/upwork-accounts');
      return res.data;
    },
  });
}

export function useCreateUpworkAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { accountName: string; profileUrl?: string }) => {
      const res = await api.post('/auth/upwork-accounts', data);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['upwork-accounts'] });
      toast.success('Upwork account linked');
    },
    onError: (error: unknown) => {
      toast.error(extractError(error, 'Failed to link account'));
    },
  });
}

export function useDeleteUpworkAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/auth/upwork-accounts/${id}`);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['upwork-accounts'] });
      toast.success('Account removed');
    },
    onError: (error: unknown) => {
      toast.error(extractError(error, 'Failed to remove account'));
    },
  });
}

export function useSetDefaultUpworkAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.patch(`/auth/upwork-accounts/${id}/default`);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['upwork-accounts'] });
      toast.success('Default account updated');
    },
    onError: (error: unknown) => {
      toast.error(extractError(error, 'Failed to set default'));
    },
  });
}
