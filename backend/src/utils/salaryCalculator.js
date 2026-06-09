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
  const { standardDays } = getMonthDaysInfo(year, month);

  const dayRate = employee.baseSalary / standardDays;

  // Count statuses on weekdays only (exclude Sundays)
  const isWeekday = (att) => new Date(att.date).getDay() !== 0;

  const absentDays = attendances.filter(att => att.status === '0' && isWeekday(att)).length;
  const leaveDays  = attendances.filter(att => att.status === 'P' && isWeekday(att)).length;
  const halfDays   = attendances.filter(att => att.status === '1/2' && isWeekday(att)).length;
  const otDays     = attendances.filter(att => att.status === 'OT').length;

  // Late: only X and OT count — 1/2 ngày KHÔNG tính trễ
  const LATE_THRESHOLD = '09:05';
  const FREE_LATE_PASSES = 3;

  const lateDaysCount = attendances.filter(att =>
    (att.status === 'X' || att.status === 'OT') &&
    att.checkIn &&
    att.checkIn > LATE_THRESHOLD
  ).length;

  const unpaidLateDays = Math.max(0, lateDaysCount - FREE_LATE_PASSES);

  // Ngày công thực tính lương:
  // = standardDays - vắng - trừ trễ - (nửa ngày × 0.5)
  // Nghỉ phép (P) KHÔNG bị trừ — vẫn được hưởng lương cơ bản
  const paidDays = Math.max(0, standardDays - absentDays - unpaidLateDays - (halfDays * 0.5));

  const basePay = dayRate * paidDays;

  // OT pay = số ngày OT × dayRate × 1.5
  const otPay = otDays * dayRate * 1.5;

  // Phụ cấp cơm trưa: chỉ tính ngày thực đi làm (X + OT + 1/2), KHÔNG tính ngày phép
  // lunchAllowance là mức/ngày → tính theo số ngày đi thực tế
  const workDaysActual = attendances.filter(att =>
    (att.status === 'X' || att.status === 'OT' || att.status === '1/2') && isWeekday(att)
  ).length;
  const lunchPay = (employee.lunchAllowance || 0) * workDaysActual;

  const allowance       = employee.allowance || 0;
  const petrolAllowance = employee.petrolAllowance || 0;

  const totalIncome = basePay + lunchPay + otPay + allowance + petrolAllowance;

  const bhxhDeduct = employee.bhxhDeduct || 0;
  const netSalary  = Math.max(0, totalIncome - bhxhDeduct);

  // workDays hiển thị = paidDays (bao gồm cả ngày phép đã được tính lương)
  const displayWorkDays = paidDays + leaveDays;

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
    absentDays,
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
