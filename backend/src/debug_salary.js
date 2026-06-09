import prisma from './db.js';
import { calculateSalary } from './utils/salaryCalculator.js';

async function debug() {
  const emp = await prisma.employee.findFirst({
    where: { name: 'Huỳnh Văn Khánh' }
  });

  if (!emp) {
    console.log('Employee not found!');
    return;
  }

  const startDate = new Date(Date.UTC(2026, 4, 1));
  const endDate = new Date(Date.UTC(2026, 5, 1));

  const attendances = await prisma.attendance.findMany({
    where: {
      employeeId: emp.id,
      date: {
        gte: startDate,
        lt: endDate
      }
    }
  });

  console.log(`Employee: ${emp.name}`);
  console.log(`Total attendance records: ${attendances.length}`);
  console.log('Status counts:');
  const counts = {};
  attendances.forEach(a => {
    counts[a.status] = (counts[a.status] || 0) + 1;
  });
  console.log(counts);

  const salary = calculateSalary(emp, attendances, 2026, 5);
  console.log('Calculated Result:', salary);
}

debug().finally(() => prisma.$disconnect());
