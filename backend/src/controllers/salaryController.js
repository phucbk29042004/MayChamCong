import prisma from '../db.js';
import { calculateSalary } from '../utils/salaryCalculator.js';
import XLSX from 'xlsx';

export const getSalaryList = async (req, res) => {
  try {
    const year = parseInt(req.query.year || new Date().getFullYear());
    const month = parseInt(req.query.month || (new Date().getMonth() + 1));

    const employees = await prisma.employee.findMany({
      orderBy: { id: 'asc' },
    });

    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 1));

    const attendances = await prisma.attendance.findMany({
      where: {
        date: {
          gte: startDate,
          lt: endDate,
        },
      },
    });

    const salaries = employees.map(emp => {
      const empAttendances = attendances.filter(att => att.employeeId === emp.id);
      return calculateSalary(emp, empAttendances, year, month);
    });

    // Calculate metrics
    const totalSalaryBudget = salaries.reduce((sum, s) => sum + s.netSalary, 0);
    const averageSalary = salaries.length > 0 ? totalSalaryBudget / salaries.length : 0;
    const totalBhxh = salaries.reduce((sum, s) => sum + s.bhxhDeduct, 0);
    const totalAbsentDays = salaries.reduce((sum, s) => sum + s.absentDays, 0);

    res.json({
      year,
      month,
      salaries,
      metrics: {
        totalSalaryBudget,
        averageSalary,
        totalBhxh,
        totalAbsentDays,
      },
    });
  } catch (error) {
    console.error('Error calculating salaries:', error);
    res.status(500).json({ error: 'Không thể tính toán bảng lương' });
  }
};

export const exportSalaryExcel = async (req, res) => {
  try {
    const year = parseInt(req.query.year || new Date().getFullYear());
    const month = parseInt(req.query.month || (new Date().getMonth() + 1));

    const employees = await prisma.employee.findMany({
      orderBy: { id: 'asc' },
    });

    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 1));

    const attendances = await prisma.attendance.findMany({
      where: {
        date: {
          gte: startDate,
          lt: endDate,
        },
      },
    });

    const salaries = employees.map(emp => {
      const empAttendances = attendances.filter(att => att.employeeId === emp.id);
      return calculateSalary(emp, empAttendances, year, month);
    });

    // Create raw table data for SheetJS
    const rawData = salaries.map(s => {
      return {
        'Nhân viên': s.name,
        'Ngày chuẩn': s.standardDays,
        'Ngày buổi': s.workDays, // This represents displayDays (total Công)
        'Vắng (0)': s.absentDays,
        'Phép (P)': s.leaveDays,
        'Tăng ca (OT)': s.otDays,
        'Đi trễ': s.lateDaysCount,
        'Trừ trễ (ngày)': s.unpaidLateDays,
        'Lương CB': Math.round(s.baseSalary),
        'Phụ cấp': Math.round(s.allowance),
        'Phụ cấp xăng': Math.round(s.petrolAllowance),
        'Phụ cấp cơm trưa': Math.round(s.lunchPay), 
        'Phụ cấp OT': Math.round(s.otPay),
        'Tổng thu nhập': Math.round(s.totalIncome),
        'BHXH': Math.round(s.bhxhDeduct),
        'Thực nhận': Math.round(s.netSalary),
      };
    });

    // Add Total Row
    if (salaries.length > 0) {
      const totalRow = {
        'Nhân viên': 'TỔNG CỘNG',
        'Ngày chuẩn': '',
        'Ngày buổi': salaries.reduce((sum, s) => sum + s.workDays, 0),
        'Vắng (0)': salaries.reduce((sum, s) => sum + s.absentDays, 0),
        'Phép (P)': salaries.reduce((sum, s) => sum + s.leaveDays, 0),
        'Tăng ca (OT)': salaries.reduce((sum, s) => sum + s.otDays, 0),
        'Đi trễ': salaries.reduce((sum, s) => sum + s.lateDaysCount, 0),
        'Trừ trễ (ngày)': salaries.reduce((sum, s) => sum + s.unpaidLateDays, 0),
        'Lương CB': Math.round(salaries.reduce((sum, s) => sum + s.baseSalary, 0)),
        'Phụ cấp': Math.round(salaries.reduce((sum, s) => sum + s.allowance, 0)),
        'Phụ cấp xăng': Math.round(salaries.reduce((sum, s) => sum + s.petrolAllowance, 0)),
        'Phụ cấp cơm trưa': Math.round(salaries.reduce((sum, s) => sum + s.lunchPay, 0)),
        'Phụ cấp OT': Math.round(salaries.reduce((sum, s) => sum + s.otPay, 0)),
        'Tổng thu nhập': Math.round(salaries.reduce((sum, s) => sum + s.totalIncome, 0)),
        'BHXH': Math.round(salaries.reduce((sum, s) => sum + s.bhxhDeduct, 0)),
        'Thực nhận': Math.round(salaries.reduce((sum, s) => sum + s.netSalary, 0)),
      };
      rawData.push(totalRow);
    }

    // Generate sheet
    const ws = XLSX.utils.json_to_sheet(rawData);

    // Set column widths to prevent ###
    const colWidths = [
      { wch: 22 }, // Nhân viên
      { wch: 12 }, // Ngày chuẩn
      { wch: 12 }, // Ngày buổi
      { wch: 10 }, // Vắng (0)
      { wch: 10 }, // Phép (P)
      { wch: 12 }, // Tăng ca (OT)
      { wch: 10 }, // Đi trễ
      { wch: 15 }, // Trừ trễ (ngày)
      { wch: 16 }, // Lương CB
      { wch: 16 }, // Phụ cấp
      { wch: 16 }, // Phụ cấp xăng
      { wch: 18 }, // Phụ cấp cơm trưa
      { wch: 16 }, // Phụ cấp OT
      { wch: 18 }, // Tổng thu nhập
      { wch: 16 }, // BHXH
      { wch: 18 }, // Thực nhận
    ];
    ws['!cols'] = colWidths;

    // Format currency columns if possible or keep as numbers
    const currencyCols = ['I', 'J', 'K', 'L', 'M', 'N', 'O', 'P']; // Columns for money
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let R = range.s.r + 1; R <= range.e.r; ++R) {
      for (const col of currencyCols) {
        const cellRef = col + (R + 1);
        if (ws[cellRef] && typeof ws[cellRef].v === 'number') {
          ws[cellRef].z = '#,##0"đ"'; // VNĐ custom format
        }
      }
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Luong_Thang_${month}_${year}`);

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=Bang_Luong_Thang_${month}_${year}.xlsx`);
    res.send(buffer);
  } catch (error) {
    console.error('Error exporting salary sheet:', error);
    res.status(500).json({ error: 'Không thể xuất file Excel' });
  }
};
