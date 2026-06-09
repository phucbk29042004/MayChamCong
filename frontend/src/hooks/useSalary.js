import { useQuery } from '@tanstack/react-query';
import api from '../api/axios.js';

export function useSalary(month, year) {
  const { data: salaryData = { salaries: [], metrics: { totalSalaryBudget: 0, averageSalary: 0, totalBhxh: 0, totalAbsentDays: 0 } }, isLoading } = useQuery({
    queryKey: ['salary', month, year],
    queryFn: async () => {
      const res = await api.get(`/api/salary?month=${month}&year=${year}`);
      return res.data;
    },
  });

  return { salaryData, isLoading };
}
