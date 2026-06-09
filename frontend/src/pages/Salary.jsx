import React from 'react';
import SalaryTable from '../components/SalaryTable.jsx';
import { Download } from 'lucide-react';

export default function Salary({ month, setMonth, year, setYear }) {
  const exportUrl = `/api/salary/export?month=${month}&year=${year}`;

  return (
    <div className="container mx-auto px-6 py-8 space-y-6">
      <div className="flex items-center justify-end gap-3">
        <div className="flex items-center gap-1 bg-white border border-slate-200 shadow-sm p-1 rounded-xl">
          <select
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value))}
            className="bg-transparent text-sm text-slate-800 px-3 py-1.5 font-semibold outline-none cursor-pointer rounded-lg hover:bg-slate-50"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>Tháng {m}</option>
            ))}
          </select>
          <div className="w-px h-5 bg-slate-200" />
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="bg-transparent text-sm text-slate-800 px-3 py-1.5 font-semibold outline-none cursor-pointer rounded-lg hover:bg-slate-50"
          >
            {[2024, 2025, 2026, 2027].map((y) => (
              <option key={y} value={y}>Năm {y}</option>
            ))}
          </select>
        </div>
        <button
          onClick={() => window.open(exportUrl, '_blank')}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-700 text-white text-sm font-semibold py-2 px-4 rounded-xl transition-colors shadow-sm"
        >
          <Download size={15} />
          <span>Xuất Excel</span>
        </button>
      </div>

      <SalaryTable month={month} year={year} />
    </div>
  );
}
