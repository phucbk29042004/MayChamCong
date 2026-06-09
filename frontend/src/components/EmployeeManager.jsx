import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useEmployees } from '../hooks/useEmployees.js';
import { Plus, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';

function MoneyInput({ value, onChange, placeholder }) {
  const [focused, setFocused] = useState(false);
  const numVal = parseFloat(value) || 0;
  const displayVal = focused ? value : (numVal > 0 ? numVal.toLocaleString('vi-VN') : '');

  return (
    <div className="relative">
      <input
        type={focused ? 'number' : 'text'}
        value={displayVal}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={focused ? '0' : placeholder || '0'}
        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-800 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 font-mono"
      />
      {!focused && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">VNĐ</span>
      )}
    </div>
  );
}

export default function EmployeeManager() {
  const { employees, isLoading, createEmployee, updateEmployee, deleteEmployee } = useEmployees();

  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');

  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newBaseSalary, setNewBaseSalary] = useState('7000000');
  const [newLunchAllowance, setNewLunchAllowance] = useState('1200000');
  const [newBhxhDeduct, setNewBhxhDeduct] = useState('557550');
  const [newAllowance, setNewAllowance] = useState('0');
  const [newPetrolAllowance, setNewPetrolAllowance] = useState('0');

  const handleCellClick = (employee, field, value) => {
    setEditingCell({ employeeId: employee.id, field });
    setEditValue((value || 0).toString());
  };

  const handleSaveCell = async (employeeId, field) => {
    if (!editValue.trim() && field === 'name') {
      toast.error('Giá trị không được để trống');
      setEditingCell(null);
      return;
    }

    try {
      let parsedValue = editValue;
      if (field !== 'name') {
        parsedValue = parseFloat(editValue || '0');
        if (isNaN(parsedValue)) {
          toast.error('Vui lòng nhập số hợp lệ');
          return;
        }
      }

      await updateEmployee({ id: employeeId, data: { [field]: parsedValue } });
      toast.success('Cập nhật nhân viên thành công');
      setEditingCell(null);
    } catch (err) {
      toast.error('Cập nhật thất bại');
      console.error(err);
    }
  };

  const handleKeyDown = (e, employeeId, field) => {
    if (e.key === 'Enter') handleSaveCell(employeeId, field);
    else if (e.key === 'Escape') setEditingCell(null);
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    if (!newName.trim()) {
      toast.error('Vui lòng điền tên nhân viên');
      return;
    }

    try {
      await createEmployee({
        name: newName,
        baseSalary: parseFloat(newBaseSalary) || 0,
        lunchAllowance: parseFloat(newLunchAllowance) || 0,
        bhxhDeduct: parseFloat(newBhxhDeduct) || 0,
        allowance: parseFloat(newAllowance) || 0,
        petrolAllowance: parseFloat(newPetrolAllowance) || 0,
      });
      toast.success('Thêm nhân viên thành công');
      setNewName('');
      setNewAllowance('0');
      setNewPetrolAllowance('0');
      setShowAddForm(false);
    } catch (err) {
      toast.error('Thêm nhân viên thất bại');
      console.error(err);
    }
  };

  const handleDelete = async (id, name) => {
    if (confirm(`Bạn có chắc chắn muốn xóa nhân viên ${name}? Dữ liệu chấm công của nhân viên này cũng sẽ bị xóa.`)) {
      try {
        await deleteEmployee(id);
        toast.success('Xóa nhân viên thành công');
      } catch (err) {
        toast.error('Xóa thất bại');
        console.error(err);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-slate-100 rounded-full w-48"></div>
        <div className="h-64 bg-slate-100 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <p className="text-slate-500 text-sm">Click vào bất kỳ ô nào trong bảng để sửa thông tin trực tiếp.</p>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-700 text-white text-sm font-semibold py-2 px-4 rounded-xl transition-colors duration-150 shadow-sm"
        >
          <Plus size={15} />
          <span>Thêm nhân viên</span>
        </button>
      </div>

      {/* Add Employee Modal — portal to avoid fixed-positioning containment */}
      {showAddForm && ReactDOM.createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={() => setShowAddForm(false)}
        >
          <div
            className="w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-slate-200 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-semibold text-xl text-slate-900">Thêm Nhân Viên Mới</h3>
                <p className="text-sm text-slate-400 mt-0.5">Điền đầy đủ thông tin rồi nhấn Lưu.</p>
              </div>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-semibold text-slate-600">Họ tên nhân viên</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-800 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Lương cơ bản</label>
                  <MoneyInput value={newBaseSalary} onChange={setNewBaseSalary} placeholder="7.000.000" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Phụ cấp cơm trưa</label>
                  <MoneyInput value={newLunchAllowance} onChange={setNewLunchAllowance} placeholder="1.200.000" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Phụ cấp khác</label>
                  <MoneyInput value={newAllowance} onChange={setNewAllowance} placeholder="0" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Phụ cấp xăng</label>
                  <MoneyInput value={newPetrolAllowance} onChange={setNewPetrolAllowance} placeholder="0" />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-semibold text-slate-600">Tiền đóng BHXH cố định</label>
                  <MoneyInput value={newBhxhDeduct} onChange={setNewBhxhDeduct} placeholder="557.550" />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors mt-1 shadow-sm"
              >
                Lưu nhân viên
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Employees Table */}
      <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm ring-1 ring-slate-100">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b-2 border-slate-200 text-xs font-semibold text-slate-500 tracking-wider uppercase">
              <th className="py-3.5 px-4 w-1/5">Họ và Tên</th>
              <th className="py-3.5 px-3 text-right">Lương Cơ Bản</th>
              <th className="py-3.5 px-3 text-right">Cơm trưa</th>
              <th className="py-3.5 px-3 text-right">Phụ cấp</th>
              <th className="py-3.5 px-3 text-right">PC Xăng</th>
              <th className="py-3.5 px-3 text-right">BHXH</th>
              <th className="py-3.5 px-4 text-center w-16">Xóa</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {employees.map((emp, idx) => (
              <tr key={emp.id} className={`transition-colors hover:bg-blue-50/40 ${idx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}`}>
                <td className="py-3 px-4 font-medium">
                  {editingCell?.employeeId === emp.id && editingCell?.field === 'name' ? (
                    <input
                      type="text"
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      onBlur={() => handleSaveCell(emp.id, 'name')}
                      onKeyDown={e => handleKeyDown(e, emp.id, 'name')}
                      autoFocus
                      className="border border-slate-300 rounded px-2 py-0.5 w-full bg-white"
                    />
                  ) : (
                    <div
                      onClick={() => handleCellClick(emp, 'name', emp.name)}
                      className="cursor-pointer hover:bg-slate-50 border border-transparent hover:border-slate-200 rounded px-2 py-0.5 inline-block w-full transition-all"
                    >
                      {emp.name}
                    </div>
                  )}
                </td>

                <td className="py-3 px-3 text-right font-mono">
                  {editingCell?.employeeId === emp.id && editingCell?.field === 'baseSalary' ? (
                    <input
                      type="number"
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      onBlur={() => handleSaveCell(emp.id, 'baseSalary')}
                      onKeyDown={e => handleKeyDown(e, emp.id, 'baseSalary')}
                      autoFocus
                      className="border border-slate-300 rounded px-2 py-0.5 text-right w-24 bg-white ml-auto"
                    />
                  ) : (
                    <div
                      onClick={() => handleCellClick(emp, 'baseSalary', emp.baseSalary)}
                      className="cursor-pointer hover:bg-slate-50 border border-transparent hover:border-slate-200 rounded px-2 py-0.5 inline-block w-full transition-all"
                    >
                      {emp.baseSalary.toLocaleString('vi-VN')} VNĐ
                    </div>
                  )}
                </td>

                <td className="py-3 px-3 text-right font-mono">
                  {editingCell?.employeeId === emp.id && editingCell?.field === 'lunchAllowance' ? (
                    <input
                      type="number"
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      onBlur={() => handleSaveCell(emp.id, 'lunchAllowance')}
                      onKeyDown={e => handleKeyDown(e, emp.id, 'lunchAllowance')}
                      autoFocus
                      className="border border-slate-300 rounded px-2 py-0.5 text-right w-20 bg-white ml-auto"
                    />
                  ) : (
                    <div
                      onClick={() => handleCellClick(emp, 'lunchAllowance', emp.lunchAllowance)}
                      className="cursor-pointer hover:bg-slate-50 border border-transparent hover:border-slate-200 rounded px-2 py-0.5 inline-block w-full transition-all"
                    >
                      {emp.lunchAllowance.toLocaleString('vi-VN')} VNĐ
                    </div>
                  )}
                </td>

                <td className="py-3 px-3 text-right font-mono">
                  {editingCell?.employeeId === emp.id && editingCell?.field === 'allowance' ? (
                    <input
                      type="number"
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      onBlur={() => handleSaveCell(emp.id, 'allowance')}
                      onKeyDown={e => handleKeyDown(e, emp.id, 'allowance')}
                      autoFocus
                      className="border border-slate-300 rounded px-2 py-0.5 text-right w-24 bg-white ml-auto"
                    />
                  ) : (
                    <div
                      onClick={() => handleCellClick(emp, 'allowance', emp.allowance || 0)}
                      className="cursor-pointer hover:bg-slate-50 border border-transparent hover:border-slate-200 rounded px-2 py-0.5 inline-block w-full transition-all"
                    >
                      {(emp.allowance || 0).toLocaleString('vi-VN')} VNĐ
                    </div>
                  )}
                </td>

                <td className="py-3 px-3 text-right font-mono">
                  {editingCell?.employeeId === emp.id && editingCell?.field === 'petrolAllowance' ? (
                    <input
                      type="number"
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      onBlur={() => handleSaveCell(emp.id, 'petrolAllowance')}
                      onKeyDown={e => handleKeyDown(e, emp.id, 'petrolAllowance')}
                      autoFocus
                      className="border border-slate-300 rounded px-2 py-0.5 text-right w-24 bg-white ml-auto"
                    />
                  ) : (
                    <div
                      onClick={() => handleCellClick(emp, 'petrolAllowance', emp.petrolAllowance || 0)}
                      className="cursor-pointer hover:bg-slate-50 border border-transparent hover:border-slate-200 rounded px-2 py-0.5 inline-block w-full transition-all"
                    >
                      {(emp.petrolAllowance || 0).toLocaleString('vi-VN')} VNĐ
                    </div>
                  )}
                </td>

                <td className="py-3 px-3 text-right font-mono">
                  {editingCell?.employeeId === emp.id && editingCell?.field === 'bhxhDeduct' ? (
                    <input
                      type="number"
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      onBlur={() => handleSaveCell(emp.id, 'bhxhDeduct')}
                      onKeyDown={e => handleKeyDown(e, emp.id, 'bhxhDeduct')}
                      autoFocus
                      className="border border-slate-300 rounded px-2 py-0.5 text-right w-24 bg-white ml-auto"
                    />
                  ) : (
                    <div
                      onClick={() => handleCellClick(emp, 'bhxhDeduct', emp.bhxhDeduct)}
                      className="cursor-pointer hover:bg-slate-50 border border-transparent hover:border-slate-200 rounded px-2 py-0.5 inline-block w-full transition-all"
                    >
                      {(emp.bhxhDeduct || 0).toLocaleString('vi-VN')} VNĐ
                    </div>
                  )}
                </td>

                <td className="py-3 px-4 text-center">
                  <button
                    onClick={() => handleDelete(emp.id, emp.name)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors duration-150"
                  >
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}

            {employees.length === 0 && (
              <tr>
                <td colSpan="7" className="py-12 text-center text-slate-400 text-sm">
                  Chưa có nhân viên nào trong danh sách.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
