/**
 * Helper to calculate standard work days (total days in month excluding Sundays)
 * and count of Sundays.
 * @param {number} year 
 * @param {number} month (1-indexed, e.g. 1 for January)
 * @returns {{totalDays: number, sundays: number, standardDays: number}}
 */
export function getMonthDaysInfo(year, month) {
  const totalDays = new Date(year, month, 0).getDate();
  let sundays = 0;
  for (let day = 1; day <= totalDays; day++) {
    const date = new Date(year, month - 1, day);
    if (date.getDay() === 0) {
      sundays++;
    }
  }
  const standardDays = totalDays - sundays;
  return { totalDays, sundays, standardDays };
}

/**
 * Calculates salary for an employee based on their attendance list in a specific month.
 * @param {Object} employee - Employee object from db (name, baseSalary, attendBonus, bhxhRate, lunchAllowance, etc.)
 * @param {Array} attendances - List of attendance records for the employee in this month
 * @param {number} year
 * @param {number} month
 */
export function calculateSalary(employee, attendances, year, month) {
  const { standardDays } = getMonthDaysInfo(year, month);
  
  // dayRate = baseSalary / standardDays
  const dayRate = employee.baseSalary / standardDays;
  
  // Counts of statuses on weekdays (excluding Sundays)
  const absentDays = attendances.filter(att => 
    att.status === '0' && 
    new Date(att.date).getDay() !== 0
  ).length;
  const leaveDays = attendances.filter(att => 
    att.status === 'P' && 
    new Date(att.date).getDay() !== 0
  ).length;
  const halfDays = attendances.filter(att => 
    att.status === '1/2' && 
    new Date(att.date).getDay() !== 0
  ).length;
  
  // Late: after 09:05, with 3 free passes per month before deduction
  const LATE_THRESHOLD = '09:05';
  const FREE_LATE_PASSES = 3;

  const lateDaysCount = attendances.filter(att =>
    (att.status === 'X' || att.status === 'OT' || att.status === '1/2') &&
    att.checkIn &&
    att.checkIn > LATE_THRESHOLD
  ).length;

  // Only deduct salary for late days exceeding the 3 free passes
  const unpaidLateDays = Math.max(0, lateDaysCount - FREE_LATE_PASSES);

  // Ngày công (Ngày buổi) = standardDays - vắng - đi trễ không lương - (nửa ngày * 0.5)
  // Note: phép is paid so we don't subtract it from Ngày công.
  const displayDays = Math.max(0, standardDays - absentDays - unpaidLateDays - (halfDays * 0.5));

  // basePay = dayRate * Ngày công
  const basePay = dayRate * displayDays;
  
  // Phụ cấp cơm trưa is now flat monthly amount manually input
  const lunchPay = employee.lunchAllowance || 0;
  
  // otDays = number of days status = 'OT'
  const otDays = attendances.filter(att => att.status === 'OT').length;
  // otPay = otDays * dayRate * 1.5
  const otPay = otDays * dayRate * 1.5;
  
  // totalIncome = basePay + lunchPay + otPay + allowance + petrolAllowance
  const allowance = employee.allowance || 0;
  const petrolAllowance = employee.petrolAllowance || 0;
  const totalIncome = basePay + lunchPay + otPay + allowance + petrolAllowance;
  
  // bhxhDeduct = flat deduction amount directly from employee (tự nhập)
  const bhxhDeduct = employee.bhxhDeduct || 0;
  
  // netSalary = totalIncome - bhxhDeduct
  const netSalary = Math.max(0, totalIncome - bhxhDeduct);
  
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
    workDays: displayDays, // Display Ngày buổi
    absentDays,
    leaveDays,
    halfDays,
    otDays,
    lateDaysCount,
    unpaidLateDays, // For display
    basePay,
    attendBonus: 0, // Removed chuyên cần
    lunchPay,
    otPay,
    totalIncome,
    netSalary
  };
}

