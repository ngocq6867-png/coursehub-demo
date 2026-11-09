# CourseHub – Báo cáo thực hành Tuần 5

## 1. Nội dung thực hiện

- Xây dựng Frontend với React 18 và Vite.
- Kết nối Frontend với Backend FastAPI.
- Cấu hình CORS cho môi trường phát triển.
- Hiển thị danh sách học phần và lớp học phần từ PostgreSQL.
- Xem danh sách đăng ký theo mã sinh viên.
- Thực hiện đăng ký và hủy đăng ký học phần.
- Tìm kiếm, lọc lớp còn chỗ và hiển thị thống kê.
- Xử lý trạng thái tải dữ liệu, thành công và lỗi.

## 2. Các API sử dụng

| Method | Endpoint | Chức năng |
|---|---|---|
| GET | `/courses` | Danh sách học phần |
| GET | `/sections` | Danh sách lớp học phần |
| GET | `/students/{student_id}/enrollments` | Danh sách đăng ký |
| POST | `/enrollments` | Đăng ký học phần |
| DELETE | `/enrollments/{student_id}/{class_section_id}` | Hủy đăng ký |

## 3. Kiểm thử

- Frontend chạy tại `http://127.0.0.1:5173`.
- Backend chạy tại `http://127.0.0.1:8000`.
- GET: Hiển thị dữ liệu từ API thành công.
- POST: Đăng ký lớp thành công, danh sách đăng ký được cập nhật.
- DELETE: Hủy đăng ký thành công, số chỗ được cập nhật.
- PostgreSQL: Đã đối chiếu dữ liệu thông qua `v_section_summary`, `enrollments` và `enrollment_events`.
- Giao diện xử lý các trường hợp không hợp lệ và lỗi API.

## 4. Các thành phần Frontend

- `App.jsx`: Quản lý state và điều phối API.
- `api.js`: Gửi request HTTP và xử lý lỗi.
- `StudentForm.jsx`: Chọn mã sinh viên.
- `SectionTable.jsx`: Hiển thị lớp học phần.
- `EnrollmentList.jsx`: Hiển thị và hủy đăng ký.
- `Notice.jsx`: Hiển thị thông báo.
- `styles.css`: Bố cục và giao diện responsive.

## 5. Hướng dẫn chạy

Khởi động Backend từ thư mục gốc:

```powershell
python -m uvicorn backend.app.main:app --reload
```

Khởi động Frontend:

```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```

Truy cập `http://127.0.0.1:5173`.

## 6. Kết luận

Ứng dụng CourseHub đã kết nối thành công React, FastAPI và PostgreSQL. Các thao tác đăng ký và hủy đăng ký được xử lý thông qua Backend; Frontend tải lại dữ liệu để đồng bộ trạng thái hiển thị với cơ sở dữ liệu.