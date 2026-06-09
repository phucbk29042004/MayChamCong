/**
 * Helper to calculate standard work days (total days in month excluding Sundays)
 * @param {number} year
 * @param {number} month (1-indexed)
 */
export function getMonthDaysInfo(year, month) {
  const totalDays = new Date(year, month, 0).getDate();
  let sundays = 0;
  for (let day = 1; day <= totalDays; day++) {
    if (new Date(year, month - 1, day).getDay() === 0) sundays++;
  }
  const standardDays = totalDays - sundays;
  return { totalDays, sundays, standardDays };
}

/**
 * Calculates salary for an employee based on their attendance list in a specific month.
 */
export function calculateSalary(employee, attendances, year, month) {
  const { standardDays, totalDays } = getMonthDaysInfo(year, month);

  const dayRate = employee.baseSalary / standardDays;

  const isWeekday = (date) => new Date(date).getDay() !== 0;

  // Build set of dates that have been recorded
  const recordedDates = new Set(
    attendances.map(att => new Date(att.date).toISOString().slice(0, 10))
  );

  // Count weekdays with NO record → tính là vắng
  let unrecordedAbsent = 0;
  for (let day = 1; day <= totalDays; day++) {
    const date = new Date(Date.UTC(year, month - 1, day));
    if (date.getDay() === 0) continue; // bỏ Chủ nhật
    const dateStr = date.toISOString().slice(0, 10);
    if (!recordedDates.has(dateStr)) {
      unrecordedAbsent++;
    }
  }

  // Count statuses on weekdays only
  const absentDays  = attendances.filter(att => att.status === '0'   && isWeekday(att.date)).length + unrecordedAbsent;
  const leaveDays   = attendances.filter(att => att.status === 'P'   && isWeekday(att.date)).length;
  const halfDays    = attendances.filter(att => att.status === '1/2' && isWeekday(att.date)).length;
  const otDays      = attendances.filter(att => att.status === 'OT').length;
  // workDays = ngày X + OT thực tế (không bao gồm P và 1/2 vì tính riêng)
  const xDays       = attendances.filter(att => att.status === 'X'   && isWeekday(att.date)).length;

  // Late: chỉ X và OT — 1/2 ngày KHÔNG tính trễ
  const LATE_THRESHOLD = '09:05';
  const FREE_LATE_PASSES = 3;

  const lateDaysCount = attendances.filter(att =>
    (att.status === 'X' || att.status === 'OT') &&
    att.checkIn &&
    att.checkIn > LATE_THRESHOLD
  ).length;

  const unpaidLateDays = Math.max(0, lateDaysCount - FREE_LATE_PASSES);

  // Ngày công thực nhận lương:
  // = (X + OT) + P (phép vẫn hưởng lương) + 1/2 * 0.5 - trừ trễ
  // Ngày không chấm + ngày 0 = vắng = không có lương
  const paidDays = Math.max(0,
    xDays + otDays + leaveDays + (halfDays * 0.5) - unpaidLateDays
  );

  const basePay = dayRate * paidDays;

  // OT pay = số ngày OT × dayRate × 1.5 (đã tính trong paidDays, thêm 0.5x nữa)
  const otPay = otDays * dayRate * 0.5;

  // Phụ cấp cơm trưa: tính theo ngày đi thực tế (X + OT + 1/2), không tính ngày phép/vắng
  const workDaysActual = xDays + otDays + halfDays;
  const lunchPay = (employee.lunchAllowance || 0) * workDaysActual;

  const allowance       = employee.allowance || 0;
  const petrolAllowance = employee.petrolAllowance || 0;

  const totalIncome = basePay + lunchPay + otPay + allowance + petrolAllowance;

  const bhxhDeduct = employee.bhxhDeduct || 0;
  const netSalary  = Math.max(0, totalIncome - bhxhDeduct);

  // workDays hiển thị trên bảng = paidDays (bao gồm P)
  const displayWorkDays = paidDays;

  // absentDays hiển thị = ngày 0 + ngày chưa chấm (không tính P và 1/2)
  const displayAbsentDays = absentDays;

  return {
    employeeId: employee.id,
    name: employee.name,
    baseSalary: employee.baseSalary,
    bhxhDeduct,
    lunchAllowance: employee.lunchAllowance,
    allowance,
    petrolAllowance,
    standardDays,
    dayRate,
    workDays: displayWorkDays,
    absentDays: displayAbsentDays,
    leaveDays,
    halfDays,
    otDays,
    lateDaysCount,
    unpaidLateDays,
    basePay,
    attendBonus: 0,
    lunchPay,
    otPay,
    totalIncome,
    netSalary,
  };
}
