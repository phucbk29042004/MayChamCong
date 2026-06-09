import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed for May 2026 with official full names...');

  // Delete existing data
  await prisma.attendance.deleteMany({});
  await prisma.employee.deleteMany({});

  // 1. Seed 8 Employees with official full names and manual BHXH
  const employeesData = [
    { name: 'Huỳnh Văn Khánh', baseSalary: 20000000, bhxhDeduct: 557550, lunchAllowance: 1200000, allowance: 4000000, petrolAllowance: 0 },
    { name: 'Phạm Tú Tiến', baseSalary: 10000000, bhxhDeduct: 557550, lunchAllowance: 1250000, allowance: 500000, petrolAllowance: 0 },
    { name: 'Nguyễn Quốc Huấn', baseSalary: 10000000, bhxhDeduct: 557550, lunchAllowance: 1050000, allowance: 1000000, petrolAllowance: 0 },
    { name: 'Huỳnh Thị Ảnh', baseSalary: 12000000, bhxhDeduct: 557550, lunchAllowance: 1150000, allowance: 0, petrolAllowance: 0 },
    { name: 'Hoàng Gia Thuận', baseSalary: 5000000, bhxhDeduct: 557550, lunchAllowance: 1200000, allowance: 0, petrolAllowance: 0 },
    { name: 'Phạm Sĩ Tài', baseSalary: 5000000, bhxhDeduct: 557550, lunchAllowance: 1200000, allowance: 0, petrolAllowance: 0 },
    { name: 'Nguyễn Thị Ngọc Như', baseSalary: 7000000, bhxhDeduct: 557550, lunchAllowance: 1250000, allowance: 0, petrolAllowance: 0 },
    { name: 'Phan Trường Thịnh', baseSalary: 24000000, bhxhDeduct: 0, lunchAllowance: 1000000, allowance: 0, petrolAllowance: 1000000 },
  ];

  const employees = [];
  for (const emp of employeesData) {
    const created = await prisma.employee.create({
      data: {
        name: emp.name,
        baseSalary: emp.baseSalary,
        attendBonus: 0,
        bhxhDeduct: emp.bhxhDeduct,
        lunchAllowance: emp.lunchAllowance,
        allowance: emp.allowance,
        petrolAllowance: emp.petrolAllowance,
      },
    });
    created.allowance = emp.allowance;
    created.petrolAllowance = emp.petrolAllowance;
    employees.push(created);
    console.log(`Created employee: ${created.name}`);
  }

  const year = 2026;
  const month = 5; // May
  const totalDays = 31;

  const attendanceSetup = {
    'Huỳnh Văn Khánh': { xCount: 25, halfCount: 0, pCount: 2, zeroCount: 3, lateCheckIns: [] },
    'Phạm Tú Tiến': { xCount: 27, halfCount: 0, pCount: 0, zeroCount: 3, lateCheckIns: [] },
    'Nguyễn Quốc Huấn': { xCount: 23, halfCount: 0, pCount: 3, zeroCount: 4, lateCheckIns: [] },
    'Huỳnh Thị Ảnh': { xCount: 25, halfCount: 0, pCount: 2, zeroCount: 3, lateCheckIns: [{ day: 13, time: '09:02' }] },
    'Hoàng Gia Thuận': { xCount: 25, halfCount: 0, pCount: 2, zeroCount: 3, lateCheckIns: [{ day: 13, time: '09:15' }, { day: 14, time: '09:15' }, { day: 15, time: '09:18' }] },
    'Phạm Sĩ Tài': { xCount: 22, halfCount: 0, pCount: 1, zeroCount: 5, lateCheckIns: [{ day: 13, time: '09:25' }, { day: 14, time: '09:14' }, { day: 15, time: '09:15' }] },
    'Phan Trường Thịnh': { xCount: 28, halfCount: 0, pCount: 0, zeroCount: 2, lateCheckIns: [{ day: 13, time: '09:05' }, { day: 14, time: '09:15' }] },
    'Nguyễn Thị Ngọc Như': { xCount: 23, halfCount: 2, pCount: 0, zeroCount: 5, lateCheckIns: [{ day: 13, time: '09:06' }, { day: 14, time: '09:11' }, { day: 15, time: '09:08' }] }
  };

  const attendanceRecords = [];

  for (const emp of employees) {
    const setup = attendanceSetup[emp.name];
    let xRemaining = setup.xCount;
    let halfRemaining = setup.halfCount;
    let pRemaining = setup.pCount;
    let zeroRemaining = setup.zeroCount;

    // Subtract late check-ins from the X remaining count
    setup.lateCheckIns.forEach(() => {
      xRemaining--;
    });

    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(Date.UTC(year, month - 1, day));
      const isSunday = date.getDay() === 0;

      // Day 1: Holiday
      if (day === 1) {
        attendanceRecords.push({
          employeeId: emp.id,
          date,
          status: 'X',
          checkIn: '08:00',
          note: 'Nghỉ lễ',
        });
        continue;
      }

      // Check if it's a designated late day
      const lateConfig = setup.lateCheckIns.find(l => l.day === day);
      if (lateConfig) {
        attendanceRecords.push({
          employeeId: emp.id,
          date,
          status: 'X',
          checkIn: lateConfig.time,
          note: 'Đi trễ',
        });
        continue;
      }

      let status = 'X';
      let checkIn = '08:00';
      let note = null;

      if (isSunday) {
        if (zeroRemaining > 0) {
          status = '0';
          checkIn = null;
          zeroRemaining--;
        } else {
          status = 'X';
          xRemaining--;
        }
      } else {
        // Weekdays
        if (pRemaining > 0) {
          status = 'P';
          checkIn = null;
          pRemaining--;
        } else if (emp.name === 'Nguyễn Quốc Huấn' && zeroRemaining > 0 && day <= 10) {
          // Put weekday 0s for Huấn
          status = '0';
          checkIn = null;
          zeroRemaining--;
        } else if (halfRemaining > 0) {
          status = '1/2';
          halfRemaining--;
        } else {
          status = 'X';
          xRemaining--;
        }
      }

      attendanceRecords.push({
        employeeId: emp.id,
        date,
        status,
        checkIn,
        note,
      });
    }
  }

  console.log(`Seeding ${attendanceRecords.length} records...`);
  for (const r of attendanceRecords) {
    await prisma.attendance.create({
      data: r,
    });
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
