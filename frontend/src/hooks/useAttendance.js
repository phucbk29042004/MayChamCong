import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios.js';

export function useAttendance(month, year) {
  const queryClient = useQueryClient();

  const { data: attendance = [], isLoading } = useQuery({
    queryKey: ['attendance', month, year],
    queryFn: async () => {
      const res = await api.get(`/api/attendance?month=${month}&year=${year}`);
      return res.data;
    },
  });

  const { mutateAsync: saveAttendance, isPending: isSaving } = useMutation({
    mutationFn: (data) => api.post('/api/attendance', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['attendance', month, year] }),
  });

  return { attendance, isLoading, saveAttendance, isSaving };
}
