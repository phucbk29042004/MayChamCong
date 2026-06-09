import prisma from '../db.js';

export const getAttendance = async (req, res) => {
  try {
    const year = parseInt(req.query.year || new Date().getFullYear());
    const month = parseInt(req.query.month || (new Date().getMonth() + 1));

    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 1)); // start of next month

    const attendances = await prisma.attendance.findMany({
      where: {
        date: {
          gte: startDate,
          lt: endDate,
        },
      },
    });

    res.json(attendances);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ error: 'Không thể lấy dữ liệu chấm công' });
  }
};

export const upsertAttendance = async (req, res) => {
  try {
    const { employeeId, date, status, checkIn, otHours, note } = req.body;

    if (!employeeId || !date || !status) {
      return res.status(400).json({ error: 'Thiếu thông tin chấm công bắt buộc' });
    }

    const targetDate = new Date(date);
    // Force UTC midnight to ensure consistency
    const utcDate = new Date(Date.UTC(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()));

    const attendance = await prisma.attendance.upsert({
      where: {
        employeeId_date: {
          employeeId: parseInt(employeeId),
          date: utcDate,
        },
      },
      update: {
        status,
        checkIn: checkIn !== undefined ? checkIn : undefined,
        otHours: otHours !== undefined ? parseFloat(otHours) : undefined,
        note,
      },
      create: {
        employeeId: parseInt(employeeId),
        date: utcDate,
        status,
        checkIn: checkIn || null,
        otHours: otHours !== undefined ? parseFloat(otHours) : 0,
        note,
      },
    });

    res.json(attendance);
  } catch (error) {
    console.error('Error saving attendance:', error);
    res.status(500).json({ error: 'Không thể cập nhật chấm công' });
  }
};

export const bulkAttendance = async (req, res) => {
  try {
    const { records } = req.body; // Array of { employeeId, date, status, checkIn, otHours, note }

    if (!records || !Array.isArray(records)) {
      return res.status(400).json({ error: 'Danh sách bản ghi không hợp lệ' });
    }

    const results = [];
    for (const record of records) {
      const { employeeId, date, status, checkIn, otHours, note } = record;
      const targetDate = new Date(date);
      const utcDate = new Date(Date.UTC(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()));

      const result = await prisma.attendance.upsert({
        where: {
          employeeId_date: {
            employeeId: parseInt(employeeId),
            date: utcDate,
          },
        },
        update: {
          status,
          checkIn: checkIn !== undefined ? checkIn : undefined,
          otHours: otHours !== undefined ? parseFloat(otHours) : undefined,
          note,
        },
        create: {
          employeeId: parseInt(employeeId),
          date: utcDate,
          status,
          checkIn: checkIn || null,
          otHours: otHours !== undefined ? parseFloat(otHours) : 0,
          note,
        },
      });
      results.push(result);
    }

    res.json({ message: 'Cập nhật hàng loạt thành công', count: results.length });
  } catch (error) {
    console.error('Error saving bulk attendance:', error);
    res.status(500).json({ error: 'Không thể cập nhật chấm công hàng loạt' });
  }
};
