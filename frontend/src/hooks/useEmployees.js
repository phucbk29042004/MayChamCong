import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios.js';

export function useEmployees() {
  const queryClient = useQueryClient();

  const { data: employees = [], isLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const res = await api.get('/api/employees');
      return res.data;
    },
  });

  const { mutateAsync: createEmployee } = useMutation({
    mutationFn: (data) => api.post('/api/employees', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employees'] }),
  });

  const { mutateAsync: updateEmployee } = useMutation({
    mutationFn: ({ id, data }) => api.put(`/api/employees/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employees'] }),
  });

  const { mutateAsync: deleteEmployee } = useMutation({
    mutationFn: (id) => api.delete(`/api/employees/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employees'] }),
  });

  return { employees, isLoading, createEmployee, updateEmployee, deleteEmployee };
}
