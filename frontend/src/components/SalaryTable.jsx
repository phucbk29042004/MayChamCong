import React from 'react';
import { useSalary } from '../hooks/useSalary.js';
import { Users, Landmark, Heart, CalendarX } from 'lucide-react';

export default function SalaryTable({ month, year }) {
  const { salaryData, isLoading } = useSalary(month, year);
  const { salaries, metrics } = salaryData;

  /* ── drag-to-scroll ── */
  const tableRef = React.useRef(null);
  const drag = React.useRef({ active: false, startX: 0, scrollLeft: 0, moved: false });
  const [isDragging, setIsDragging] = React.useState(false);

  const onMouseDown = (e) => {
    if (!tableRef.current) return;
    drag.current = { active: true, startX: e.pageX, scrollLeft: tableRef.current.scrollLeft, moved: false };
  };
  const onMouseMove = (e) => {
    if (!drag.current.active || !tableRef.current) return;
    const dx = e.pageX - drag.current.startX;
    if (!drag.current.moved && Math.abs(dx) < 5) return;
    drag.current.moved = true;
    setIsDragging(true);
    e.preventDefault();
    tableRef.current.scrollLeft = drag.current.scrollLeft - dx;
  };
  const onMouseUp = () => { drag.current.active = false; drag.current.moved = false; setIsDragging(false); };

  const fmt = (val) => {
    if (val === undefined || val === null) return '0 VNĐ';
    return Math.round(val).toLocaleString('vi-VN') + ' VNĐ';
  };

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-slate-100 rounded-2xl" />)}
        </div>
        <div className="h-80 bg-slate-100 rounded-2xl" />
      </div>
    );
  }

  const totalBaseSalary      = salaries.reduce((s, r) => s + r.baseSalary, 0);
  const totalWorkDays        = salaries.reduce((s, r) => s + r.workDays, 0);
  const totalAbsentDays      = salaries.reduce((s, r) => s + r.absentDays, 0);
  const totalLeaveDays       = salaries.reduce((s, r) => s + r.leaveDays, 0);
  const totalOtDays          = salaries.reduce((s, r) => s + r.otDays, 0);
  const totalLateDays        = salaries.reduce((s, r) => s + (r.lateDaysCount || 0), 0);
  const totalUnpaidLateDays  = salaries.reduce((s, r) => s + (r.unpaidLateDays || 0), 0);
  const totalAllowance       = salaries.reduce((s, r) => s + (r.allowance || 0), 0);
  const totalPetrolAllowance = salaries.reduce((s, r) => s + (r.petrolAllowance || 0), 0);
  const totalLunchPay        = salaries.reduce((s, r) => s + r.lunchPay, 0);
  const totalOtPay           = salaries.reduce((s, r) => s + r.otPay, 0);
  const totalIncome          = salaries.reduce((s, r) => s + r.totalIncome, 0);
  const totalBhxhDeduct      = salaries.reduce((s, r) => s + r.bhxhDeduct, 0);
  const totalNetSalary       = salaries.reduce((s, r) => s + r.netSalary, 0);

  const numCols = [
    { key: 'standardDays',   label: 'Chuẩn',   cls: 'text-slate-400',                 w: 52 },
    { key: 'workDays',       label: 'Công',     cls: 'text-emerald-600 font-bold',     w: 52 },
    { key: 'absentDays',     label: 'Vắng',     cls: 'text-red-500 font-semibold',     w: 44 },
    { key: 'leaveDays',      label: 'Phép',     cls: 'text-blue-500',                  w: 44 },
    { key: 'otDays',         label: 'OT',       cls: 'text-amber-500',                 w: 40 },
    { key: 'lateDaysCount',  label: 'Trễ',      cls: '',                               w: 44, dynamic: (v) => v > 3 ? 'text-rose-600 font-bold' : 'text-orange-400' },
    { key: 'unpaidLateDays', label: 'Trừ trễ', cls: 'text-rose-500 font-bold',        w: 52, fmt: (v) => v > 0 ? `${v}d` : '—' },
  ];

  const moneyCols = [
    { key: 'baseSalary',      label: 'Lương CB',  cls: 'text-slate-600' },
    { key: 'allowance',       label: 'Phụ cấp',   cls: 'text-slate-600' },
    { key: 'petrolAllowance', label: 'PC Xăng',   cls: 'text-slate-600' },
    { key: 'lunchPay',        label: 'Cơm trưa',  cls: 'text-slate-600' },
    { key: 'otPay',           label: 'PC OT',     cls: 'text-amber-600' },
    { key: 'totalIncome',     label: 'Tổng thu',  cls: 'text-slate-800 font-semibold' },
    { key: 'bhxhDeduct',      label: 'Trừ BHXH',  cls: 'text-rose-500' },
  ];

  const numTotals   = [null, totalWorkDays, totalAbsentDays, totalLeaveDays, totalOtDays, totalLateDays, totalUnpaidLateDays];
  const moneyTotals = [totalBaseSalary, totalAllowance, totalPetrolAllowance, totalLunchPay, totalOtPay, totalIncome, totalBhxhDeduct];

  return (
    <div className="space-y-5">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {[
          { label: 'Quỹ lương thực tế', value: fmt(metrics.totalSalaryBudget), sub: 'Thực trả net cho nhân viên',    icon: <Landmark size={15}/>, grad: 'from-emerald-50 to-teal-50',   border: 'border-emerald-100', ic: 'bg-emerald-100', icTxt: 'text-emerald-600', lTxt: 'text-emerald-600', vTxt: 'text-emerald-700', sTxt: 'text-emerald-500' },
          { label: 'Lương trung bình',  value: fmt(metrics.averageSalary),      sub: 'Tính trên tổng số nhân sự',    icon: <Users size={15}/>,    grad: 'from-blue-50 to-indigo-50',   border: 'border-blue-100',    ic: 'bg-blue-100',    icTxt: 'text-blue-600',    lTxt: 'text-blue-600',    vTxt: 'text-blue-700',    sTxt: 'text-blue-400'    },
          { label: 'Tổng BHXH (8%)',    value: fmt(metrics.totalBhxh),          sub: 'Khấu trừ bảo hiểm NV',         icon: <Heart size={15}/>,    grad: 'from-rose-50 to-pink-50',     border: 'border-rose-100',    ic: 'bg-rose-100',    icTxt: 'text-rose-600',    lTxt: 'text-rose-600',    vTxt: 'text-rose-700',    sTxt: 'text-rose-400'    },
          { label: 'Tổng ngày vắng',    value: `${metrics.totalAbsentDays} ngày`, sub: 'Không lương & mất chuyên cần', icon: <CalendarX size={15}/>, grad: 'from-amber-50 to-orange-50', border: 'border-amber-100',   ic: 'bg-amber-100',   icTxt: 'text-amber-600',   lTxt: 'text-amber-600',   vTxt: 'text-amber-700',   sTxt: 'text-amber-500' },
        ].map(({ label, value, sub, icon, grad, border, ic, icTxt, lTxt, vTxt, sTxt }) => (
          <div key={label} className={`bg-gradient-to-br ${grad} border ${border} p-4 rounded-2xl`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[11px] font-semibold ${lTxt} uppercase tracking-wide`}>{label}</span>
              <div className={`w-7 h-7 ${ic} rounded-lg flex items-center justify-center ${icTxt}`}>{icon}</div>
            </div>
            <div className={`text-lg font-bold ${vTxt} whitespace-nowrap`}>{value}</div>
            <div className={`text-[10px] ${sTxt} mt-0.5`}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Salary Table — drag-to-scroll */}
      <div
        ref={tableRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        className={`overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-100 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} select-none`}
      >
        <table className="text-left border-collapse" style={{ tableLayout: 'fixed', width: 'max-content', minWidth: '100%' }}>
          <colgroup>
            <col style={{ width: 140 }} />
            {numCols.map(c => <col key={c.key} style={{ width: c.w }} />)}
            {moneyCols.map(c => <col key={c.key} style={{ width: 148 }} />)}
            <col style={{ width: 160 }} />
          </colgroup>

          <thead>
            <tr className="bg-slate-50 border-b-2 border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
              <th className="py-3 px-3 sticky left-0 bg-slate-50 border-r-2 border-slate-200 z-10 text-left whitespace-nowrap">
                Nhân viên
              </th>
              {numCols.map(c => (
                <th key={c.key} className="py-3 px-2 text-center whitespace-nowrap">{c.label}</th>
              ))}
              {moneyCols.map(c => (
                <th key={c.key} className="py-3 px-3 text-right whitespace-nowrap">{c.label}</th>
              ))}
              <th className="py-3 px-3 text-right whitespace-nowrap text-emerald-600 font-bold bg-emerald-50 border-l-2 border-emerald-100">
                Thực nhận
              </th>
            </tr>
          </thead>

          <tbody className="text-xs text-slate-700">
            {salaries.map((s, idx) => {
              const rowBg = idx % 2 === 1 ? '#f8fafc' : '#ffffff';
              return (
                <tr key={s.employeeId} className="border-b border-slate-100 hover:bg-blue-50/40 transition-colors">
                  <td
                    className="py-2.5 px-3 font-semibold sticky left-0 border-r-2 border-slate-200 z-10 whitespace-nowrap text-slate-800"
                    style={{ background: rowBg }}
                  >
                    {s.name}
                  </td>

                  {numCols.map((c) => {
                    const raw = s[c.key] ?? 0;
                    const display = c.fmt ? c.fmt(raw) : raw;
                    const cls = c.dynamic ? c.dynamic(raw) : c.cls;
                    return (
                      <td key={c.key} className={`py-2.5 px-2 text-center font-mono ${cls}`}>
                        {display}
                      </td>
                    );
                  })}

                  {moneyCols.map(c => (
                    <td key={c.key} className={`py-2.5 px-3 text-right font-mono whitespace-nowrap ${c.cls}`}>
                      {fmt(s[c.key])}
                    </td>
                  ))}

                  <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700 whitespace-nowrap bg-emerald-50/60 border-l-2 border-emerald-100">
                    {fmt(s.netSalary)}
                  </td>
                </tr>
              );
            })}

            {salaries.length > 0 && (
              <tr className="bg-slate-800 text-white font-semibold text-xs">
                <td className="py-3 px-3 sticky left-0 bg-slate-800 border-r-2 border-slate-700 font-bold tracking-wide whitespace-nowrap">
                  TỔNG CỘNG
                </td>
                {numCols.map((c, i) => {
                  const raw = numTotals[i];
                  const display = raw === null ? '—' : (c.fmt ? c.fmt(raw) : raw);
                  return (
                    <td key={c.key} className="py-3 px-2 text-center font-mono text-slate-300">
                      {display}
                    </td>
                  );
                })}
                {moneyCols.map((c, i) => (
                  <td key={c.key} className="py-3 px-3 text-right font-mono text-slate-300 whitespace-nowrap">
                    {fmt(moneyTotals[i])}
                  </td>
                ))}
                <td className="py-3 px-3 text-right font-mono font-extrabold text-emerald-400 whitespace-nowrap bg-emerald-900/30 border-l-2 border-emerald-700">
                  {fmt(totalNetSalary)}
                </td>
              </tr>
            )}

            {salaries.length === 0 && (
              <tr>
                <td colSpan="16" className="py-12 text-center text-slate-400">
                  Chưa có dữ liệu bảng lương. Vui lòng thêm nhân viên và chấm công.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
