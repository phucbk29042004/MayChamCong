import React from 'react';
import { useEmployees } from '../hooks/useEmployees.js';
import { useAttendance } from '../hooks/useAttendance.js';
import toast from 'react-hot-toast';

export default function AttendanceGrid({ month, setMonth, year, setYear }) {
  const { employees, isLoading: loadingEmployees } = useEmployees();
  const { attendance, isLoading: loadingAttendance, saveAttendance, isSaving } = useAttendance(month, year);

  const totalDays = new Date(year, month, 0).getDate();
  const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);

  const nextStatus = {
    '': 'X',
    'X': '0',
    '0': 'P',
    'P': 'OT',
    'OT': '1/2',
    '1/2': 'X',
  };

  const statusConfig = {
    'X':       { bg: 'bg-emerald-500 text-white',                                              label: 'X',   title: 'Đi làm (X)' },
    '0':       { bg: 'bg-red-500 text-white',                                                  label: '0',   title: 'Vắng (0)' },
    'P':       { bg: 'bg-blue-500 text-white',                                                 label: 'P',   title: 'Nghỉ phép (P)' },
    'OT':      { bg: 'bg-amber-500 text-white',                                                label: 'OT',  title: 'Tăng ca (OT)' },
    '1/2':     { bg: 'bg-violet-500 text-white',                                               label: '1/2', title: 'Nghỉ nửa ngày (1/2)' },
    'SUNDAY':  { bg: 'bg-slate-100 text-slate-300 cursor-not-allowed',                         label: '',    title: 'Chủ nhật' },
    'DEFAULT': { bg: 'bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-400',  label: '',    title: 'Chưa chấm' },
  };

  const handleCellClick = async (employeeId, day) => {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T00:00:00.000Z`;
    const date = new Date(dateStr);
    if (date.getDay() === 0) return;

    const existing = attendance.find(
      (att) => att.employeeId === employeeId && new Date(att.date).getUTCDate() === day
    );

    const currentStatus = existing ? existing.status : '';
    const newStatus = nextStatus[currentStatus];
    const defaultCheckIn = (newStatus === 'X' || newStatus === 'OT' || newStatus === '1/2') ? '08:00' : null;

    try {
      await saveAttendance({
        employeeId,
        date: dateStr,
        status: newStatus,
        checkIn: defaultCheckIn,
        otHours: newStatus === 'OT' ? 8 : 0,
      });
    } catch (err) {
      toast.error('Chấm công thất bại');
      console.error(err);
    }
  };

  const handleCellDoubleClick = async (employeeId, day) => {
    const existing = attendance.find(
      (att) => att.employeeId === employeeId && new Date(att.date).getUTCDate() === day
    );

    if (!existing || (existing.status !== 'X' && existing.status !== 'OT' && existing.status !== '1/2')) {
      toast.error('Chỉ có thể nhập giờ đi làm khi trạng thái là X, OT hoặc 1/2');
      return;
    }

    const newTime = prompt(
      `Nhập giờ vào làm cho ${employees.find(e => e.id === employeeId)?.name} ngày ${day}/${month} (Định dạng hh:mm, sau 09:05 là đi trễ):`,
      existing.checkIn || '08:00'
    );

    if (newTime === null) return;

    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T00:00:00.000Z`;

    try {
      await saveAttendance({
        employeeId,
        date: dateStr,
        status: existing.status,
        checkIn: newTime,
        otHours: existing.otHours,
        note: existing.note,
      });
      toast.success('Đã cập nhật giờ check-in');
    } catch (err) {
      toast.error('Cập nhật giờ check-in thất bại');
      console.error(err);
    }
  };

  const getEmployeeStats = (employeeId) => {
    const empAtt = attendance.filter(att => att.employeeId === employeeId);
    const work = empAtt.filter(att => att.status === 'X' || att.status === 'OT').length;
    const absent = empAtt.filter(att => att.status === '0').length;
    const leave = empAtt.filter(att => att.status === 'P').length;
    const ot = empAtt.filter(att => att.status === 'OT').length;
    const lateDaysCount = empAtt.filter(att =>
      (att.status === 'X' || att.status === 'OT') &&
      att.checkIn && att.checkIn > '09:05'
    ).length;
    const late = Math.max(0, lateDaysCount - 3);
    return { work, absent, leave, ot, late, lateDaysCount };
  };

  const getCellDetails = (employeeId, day) => {
    const date = new Date(year, month - 1, day);
    const isSunday = date.getDay() === 0;

    const match = attendance.find(
      (att) => att.employeeId === employeeId && new Date(att.date).getUTCDate() === day
    );

    if (isSunday) {
      if (match) return { ...statusConfig[match.status], checkIn: match.checkIn };
      return statusConfig['SUNDAY'];
    }

    if (match) return { ...(statusConfig[match.status] || statusConfig['DEFAULT']), checkIn: match.checkIn };
    return statusConfig['DEFAULT'];
  };

  const getDayName = (day) => {
    const d = new Date(year, month - 1, day);
    const weekdays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    return weekdays[d.getDay()];
  };

  const [visibleDays, setVisibleDays] = React.useState(10);
  const visibleDaysArray = daysArray.slice(0, visibleDays);
  const scrollContainerRef = React.useRef(null);
  const dragState = React.useRef({ active: false, startX: 0, scrollLeft: 0, dragging: false });
  const [isDragging, setIsDragging] = React.useState(false);

  const handleDragStart = (event) => {
    if (!scrollContainerRef.current) return;
    dragState.current.active = true;
    dragState.current.startX = event.pageX;
    dragState.current.scrollLeft = scrollContainerRef.current.scrollLeft;
  };

  const handleDragMove = (event) => {
    if (!dragState.current.active || !scrollContainerRef.current) return;
    const dx = event.pageX - dragState.current.startX;
    if (!dragState.current.dragging && Math.abs(dx) < 5) return;
    if (!dragState.current.dragging) {
      dragState.current.dragging = true;
      setIsDragging(true);
    }
    event.preventDefault();
    scrollContainerRef.current.scrollLeft = dragState.current.scrollLeft - dx;
  };

  const handleDragEnd = () => {
    dragState.current.active = false;
    dragState.current.dragging = false;
    setIsDragging(false);
  };

  const handleScroll = (event) => {
    const el = event.target;
    if (visibleDays >= totalDays) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    if (atBottom) {
      setVisibleDays((prev) => Math.min(prev + 10, totalDays));
    }
  };

  React.useEffect(() => {
    setVisibleDays(10);
  }, [month, year]);

  const overallStats = employees.reduce(
    (acc, emp) => {
      const stats = getEmployeeStats(emp.id);
      acc.work += stats.work;
      acc.absent += stats.absent;
      acc.leave += stats.leave;
      acc.ot += stats.ot;
      acc.late += stats.late;
      acc.lateDaysCount += stats.lateDaysCount;
      return acc;
    },
    { work: 0, absent: 0, leave: 0, ot: 0, late: 0, lateDaysCount: 0 }
  );

  if (loadingEmployees || loadingAttendance) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-slate-100 rounded-full w-48"></div>
        <div className="h-96 bg-slate-100 rounded-2xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex justify-between items-center">
        <p className="text-slate-500 text-sm">
          Click ô để chấm. <span className="font-semibold text-slate-700">Double-click</span> vào X / OT để sửa giờ vào (sau 09:05 là đi trễ).
        </p>
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
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 items-center pb-3 border-b border-slate-100">
        {[
          { bg: 'bg-emerald-500', label: 'X',   text: 'Có mặt' },
          { bg: 'bg-red-500',     label: '0',   text: 'Vắng' },
          { bg: 'bg-blue-500',    label: 'P',   text: 'Nghỉ phép' },
          { bg: 'bg-amber-500',   label: 'OT',  text: 'Tăng ca' },
          { bg: 'bg-violet-500',  label: '1/2', text: 'Nửa ngày' },
          { bg: 'bg-slate-200',   label: '',    text: 'Chủ nhật' },
        ].map(({ bg, label, text }) => (
          <div key={text} className="flex items-center gap-1.5">
            <div className={`w-5 h-5 rounded-md ${bg} flex items-center justify-center`}>
              <span className="text-white font-bold text-[9px] leading-none">{label}</span>
            </div>
            <span className="text-sm text-slate-600">{text}</span>
          </div>
        ))}
        {isSaving && <span className="text-xs text-slate-400 italic ml-auto">Đang lưu...</span>}
      </div>

      {/* Attendance Table */}
      <div
        ref={scrollContainerRef}
        onMouseDown={handleDragStart}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onScroll={handleScroll}
        className={`overflow-auto max-h-[540px] rounded-2xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-100 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} select-none`}
      >
        <table className="w-full min-w-[780px] border-separate border-spacing-0">
          <thead>
            <tr className="text-xs font-semibold text-slate-500 uppercase tracking-wide select-none">
              <th className="sticky top-0 left-0 z-30 bg-slate-50 border-b-2 border-r border-slate-200 px-3 py-3 text-center min-w-[72px]">
                Ngày
              </th>
              {employees.map(emp => (
                <th
                  key={emp.id}
                  className="sticky top-0 z-20 bg-slate-50 border-b-2 border-r border-slate-200 px-2 py-3 text-center min-w-[52px]"
                >
                  <div className="truncate max-w-[52px] text-[11px]">{emp.name.split(' ').pop()}</div>
                </th>
              ))}
              <th className="sticky top-0 right-0 z-30 bg-slate-50 border-b-2 border-l-2 border-slate-200 px-3 py-3 text-center min-w-[120px]">
                Tổng ngày
              </th>
            </tr>
          </thead>
          <tbody>
            {visibleDaysArray.map((day) => {
              const isSun = new Date(year, month - 1, day).getDay() === 0;
              const dayStats = employees.reduce(
                (acc, emp) => {
                  const cell = getCellDetails(emp.id, day);
                  if (cell.label === 'X' || cell.label === 'OT') acc.work += 1;
                  if (cell.label === '0') acc.absent += 1;
                  if (cell.label === 'P') acc.leave += 1;
                  if (cell.label === 'OT') acc.ot += 1;
                  if (cell.label === '1/2') acc.half += 1;
                  return acc;
                },
                { work: 0, absent: 0, leave: 0, ot: 0, half: 0 }
              );

              const rowBg = isSun ? 'bg-slate-50/80' : 'bg-white hover:bg-blue-50/30';

              return (
                <tr key={day} className={`transition-colors ${rowBg}`}>
                  <td className="sticky left-0 z-10 bg-inherit border-r border-b border-slate-100 px-2 text-center h-[48px]">
                    <div className={`text-sm font-bold ${isSun ? 'text-rose-400' : 'text-slate-700'}`}>{day}</div>
                    <div className={`text-[10px] font-medium ${isSun ? 'text-rose-300' : 'text-slate-400'}`}>{getDayName(day)}</div>
                  </td>

                  {employees.map((emp) => {
                    const cell = getCellDetails(emp.id, day);
                    return (
                      <td key={emp.id} className="border-b border-r border-slate-100 text-center" style={{ padding: '3px' }}>
                        <button
                          onClick={() => handleCellClick(emp.id, day)}
                          onDoubleClick={() => handleCellDoubleClick(emp.id, day)}
                          disabled={isSun && cell.label !== 'OT' && cell.label !== 'P' && cell.label !== '0'}
                          title={`${emp.name} – Ngày ${day}/${month} (${cell.title})`}
                          className={`w-[38px] h-[38px] rounded-xl flex items-center justify-center font-mono select-none mx-auto ${cell.bg}`}
                        >
                          <span className="font-bold text-xs leading-none">{cell.label || '·'}</span>
                        </button>
                      </td>
                    );
                  })}

                  <td className="sticky right-0 z-10 bg-inherit border-b border-l-2 border-slate-200 px-3 h-[48px]">
                    <div className="flex flex-col justify-center h-full gap-0.5 min-w-[100px]">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-medium">Công</span>
                        <span className="text-xs font-bold text-emerald-600">{dayStats.work}</span>
                      </div>
                      <div className="flex items-center justify-between" style={{ visibility: dayStats.absent > 0 ? 'visible' : 'hidden' }}>
                        <span className="text-[10px] text-slate-400 font-medium">Vắng</span>
                        <span className="text-xs font-bold text-red-500">{dayStats.absent}</span>
                      </div>
                      <div className="flex items-center justify-between" style={{ visibility: dayStats.half > 0 ? 'visible' : 'hidden' }}>
                        <span className="text-[10px] text-violet-400 font-medium">½ ngày</span>
                        <span className="text-xs font-bold text-violet-600">{dayStats.half}</span>
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="text-[11px] text-slate-400 text-center">
        Hiển thị {visibleDays}/{totalDays} ngày · Cuộn xuống để tải thêm · Kéo ngang để xem toàn bộ nhân viên
      </div>

      {/* Summary cards */}
      <div className="grid gap-3 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Tổng cộng tháng</div>
          <div className="space-y-2 text-sm">
            {[
              { label: 'Tổng công',         value: `${overallStats.work}`,              color: 'text-emerald-600 font-bold' },
              { label: 'Vắng mặt',          value: `${overallStats.absent}`,            color: 'text-red-500 font-semibold' },
              { label: 'Nghỉ phép',         value: `${overallStats.leave}`,             color: 'text-blue-500 font-semibold' },
              { label: 'Tăng ca (OT)',      value: `${overallStats.ot}`,               color: 'text-amber-500 font-semibold' },
              { label: 'Đi trễ (tổng)',     value: `${overallStats.lateDaysCount} lần`, color: 'text-slate-600 font-semibold' },
              { label: 'Bị trừ lương trễ',  value: overallStats.late > 0 ? `${overallStats.late} lần` : 'Không có',
                color: overallStats.late > 0 ? 'text-red-500 font-bold' : 'text-emerald-600 font-semibold' },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex justify-between items-center py-1 border-b border-slate-50 last:border-0">
                <span className="text-slate-500">{label}</span>
                <span className={color}>{value}</span>
              </div>
            ))}
            <div className="mt-2 rounded-xl bg-slate-50 border border-slate-100 p-3 text-[11px] text-slate-500 space-y-0.5">
              <p className="font-semibold text-slate-700 mb-1">Quy ước</p>
              <p>X = Có mặt · 0 = Vắng · P = Phép · OT = Tăng ca · 1/2 = Nửa ngày</p>
              <p>Đi trễ = sau 09:05. Được phép trễ <strong>3 lần/tháng</strong> miễn phí.</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Gợi ý thao tác</div>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex gap-2"><span className="text-slate-300">›</span> Click ô để đổi trạng thái (X → 0 → P → OT → 1/2).</li>
            <li className="flex gap-2"><span className="text-slate-300">›</span> Double-click ô X / OT / 1/2 để sửa giờ vào làm.</li>
            <li className="flex gap-2"><span className="text-slate-300">›</span> Chủ nhật tự động bị khóa (nền xám).</li>
            <li className="flex gap-2"><span className="text-slate-300">›</span> Kéo ngang bảng để xem đủ nhân viên.</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Thông tin bảng</div>
          <p className="text-sm text-slate-600 leading-relaxed">
            Tên nhân viên hiển thị rút gọn (họ cuối) ở header. Cột <strong>Ngày</strong> neo trái, cột <strong>Tổng ngày</strong> neo phải — luôn hiển thị khi kéo ngang.
          </p>
        </div>
      </div>
    </div>
  );
}
