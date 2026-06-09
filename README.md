# Ollama Timekeeping & Payroll Management System

Ứng dụng quản lý chấm công và tính bảng lương được xây dựng theo phong cách thiết kế tối giản, tinh tế của **Ollama** (với canvas trắng phẳng, góc bo tròn dạng viên thuốc `rounded-full`, không đổ bóng).

## Công Nghệ Sử Dụng
- **Frontend**: React 18, Vite, TailwindCSS, React Query (TanStack Query), Axios, Lucide Icons, SheetJS (`xlsx` blob download).
- **Backend**: Node.js, Express.
- **Database**: SQLite (thông qua Prisma ORM) gọn nhẹ, chạy ngay lập tức mà không cần cài cơ sở dữ liệu bên ngoài.
- **Export**: SheetJS (`xlsx`) xuất dữ liệu lương sang Excel đẹp mắt và định dạng tiền tệ VNĐ chuẩn xác.

---

## Hướng Dẫn Cài Đặt & Chạy Ứng Dụng

### Bước 1: Khởi tạo cơ sở dữ liệu Backend

1. Mở Terminal mới và di chuyển vào thư mục `backend`:
   ```bash
   cd backend
   ```

2. Cài đặt các gói phụ thuộc:
   ```bash
   npm install
   ```
   *(Lưu ý: Nếu chạy trên Windows PowerShell gặp lỗi script, bạn có thể chạy bằng Command Prompt (cmd) hoặc thêm bypass: `powershell -ExecutionPolicy Bypass -Command "npm install"`)*

3. Chạy lệnh khởi tạo cơ sở dữ liệu SQLite thông qua Prisma:
   ```bash
   npx prisma migrate dev --name init
   ```
   *Lệnh này sẽ tự động tạo file cơ sở dữ liệu `prisma/dev.db` và tạo các bảng `Employee`, `Attendance` tương ứng.*

4. Chạy Seed dữ liệu mẫu (Khởi tạo 7 nhân viên và chấm công tháng 01/2026):
   ```bash
   npm run prisma:seed
   ```
   *Seed data bao gồm Anh Khánh, Tý, Đen, Ảnh, Tom, Tài, Phan Thịnh kèm theo lịch sử chấm công chính xác như mô tả.*

5. Khởi động Backend Server ở chế độ phát triển (chạy ở cổng `3001`):
   ```bash
   npm run dev
   ```

---

### Bước 2: Cấu hình và chạy Frontend

1. Mở một Terminal khác và di chuyển vào thư mục `frontend`:
   ```bash
   cd frontend
   ```

2. Cài đặt các gói phụ thuộc cho Frontend:
   ```bash
   npm install
   ```

3. Khởi động Frontend Development Server (chạy ở cổng `3000`):
   ```bash
   npm run dev
   ```

4. Mở trình duyệt và truy cập: [http://localhost:3000](http://localhost:3000)

---

## Quy Tắc Tính Lương (Business Rules)
1. **Ngày chuẩn trong tháng** (`standardDays`): Số ngày trong tháng trừ các ngày Chủ nhật.
2. **Lương một ngày** (`dayRate`): `baseSalary` / `standardDays`.
3. **Ngày làm việc thực tế** (`workDays`): Tổng số ngày có trạng thái `X` (Đi làm) hoặc `OT` (Tăng ca).
4. **Lương cơ bản thực nhận** (`basePay`): `dayRate` × `workDays`.
5. **PC Chuyên cần** (`attendBonus`): Nhận đủ nếu **không vắng mặt** (`0`) buổi nào trong tháng. Ngược lại = `0đ`.
6. **PC Ăn trưa** (`lunchPay`): `workDays` × `50.000đ`.
7. **Phụ cấp tăng ca** (`otPay`): `số ngày OT` × `dayRate` × `1.5`.
8. **Tổng thu nhập** (`totalIncome`): `basePay` + `attendBonus` + `lunchPay` + `otPay`.
9. **Khấu trừ BHXH** (`bhxhDeduct`): `totalIncome` × (`bhxhRate` / 100).
10. **Thực nhận Net** (`netSalary`): `totalIncome` - `bhxhDeduct`.
