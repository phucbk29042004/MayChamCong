import prisma from '../db.js';

export const getEmployees = async (req, res) => {
  try {
    const employees = await prisma.employee.findMany({
      orderBy: { id: 'asc' },
    });
    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: 'Không thể lấy danh sách nhân viên' });
  }
};

export const createEmployee = async (req, res) => {
  try {
    const { name, baseSalary, attendBonus, bhxhDeduct, lunchAllowance, allowance, petrolAllowance } = req.body;
    if (!name || baseSalary === undefined) {
      return res.status(400).json({ error: 'Tên và lương cơ bản là bắt buộc' });
    }
    const newEmployee = await prisma.employee.create({
      data: {
        name,
        baseSalary: parseFloat(baseSalary),
        attendBonus: attendBonus !== undefined ? parseFloat(attendBonus) : undefined,
        bhxhDeduct: bhxhDeduct !== undefined ? parseFloat(bhxhDeduct) : undefined,
        lunchAllowance: lunchAllowance !== undefined ? parseFloat(lunchAllowance) : undefined,
        allowance: allowance !== undefined ? parseFloat(allowance) : undefined,
        petrolAllowance: petrolAllowance !== undefined ? parseFloat(petrolAllowance) : undefined,
      },
    });
    res.status(201).json(newEmployee);
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ error: 'Không thể thêm nhân viên mới' });
  }
};

export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, baseSalary, attendBonus, bhxhDeduct, lunchAllowance, allowance, petrolAllowance } = req.body;
    const updated = await prisma.employee.update({
      where: { id: parseInt(id) },
      data: {
        name,
        baseSalary: baseSalary !== undefined ? parseFloat(baseSalary) : undefined,
        attendBonus: attendBonus !== undefined ? parseFloat(attendBonus) : undefined,
        bhxhDeduct: bhxhDeduct !== undefined ? parseFloat(bhxhDeduct) : undefined,
        lunchAllowance: lunchAllowance !== undefined ? parseFloat(lunchAllowance) : undefined,
        allowance: allowance !== undefined ? parseFloat(allowance) : undefined,
        petrolAllowance: petrolAllowance !== undefined ? parseFloat(petrolAllowance) : undefined,
      },
    });
    res.json(updated);
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ error: 'Không thể cập nhật thông tin nhân viên' });
  }
};

export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.employee.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: 'Xóa nhân viên thành công' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ error: 'Không thể xóa nhân viên này' });
  }
};
