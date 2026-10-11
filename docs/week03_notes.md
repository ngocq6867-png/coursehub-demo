# GHI CHÚ TUẦN 3 - DỰ ÁN COURSEHUB

## 1. Tổng quan dự án

CourseHub là ứng dụng quản lý đăng ký học phần, được xây dựng bằng FastAPI và PostgreSQL.

Dự án cung cấp các API phục vụ những chức năng chính:
- Kiểm tra trạng thái hoạt động của API và kết nối cơ sở dữ liệu.
- Lấy danh sách học phần và lớp học phần.
- Tra cứu thông tin học phần.
- Xem danh sách đăng ký học phần của sinh viên.
- Đăng ký và hủy đăng ký học phần.
- Kiểm tra dữ liệu đầu vào và xử lý các trường hợp lỗi.

## 2. Công nghệ sử dụng

- **Python:** Ngôn ngữ lập trình chính.
- **FastAPI:** Xây dựng các API.
- **SQLAlchemy Core:** Thực hiện truy vấn SQL và tương tác với cơ sở dữ liệu.
- **PostgreSQL:** Hệ quản trị cơ sở dữ liệu quan hệ.
- **Pydantic:** Kiểm tra và xác thực dữ liệu đầu vào.
- **Uvicorn:** Khởi chạy ứng dụng FastAPI.
- **Postman:** Kiểm thử các API.
- **Swagger UI:** Giao diện trực quan để xem và thử nghiệm API.

## 3. Cấu trúc dự án

```text
coursehub-demo/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   └── schemas.py
│   ├── requirements.txt
│   ├── .env.example
│   └── .env
├── postman/
│   ├── CourseHub_Buoi_3.postman_collection.json
│   └── CourseHub_Local.postman_environment.json
├── docs/
│   └── week03_notes.md
└── .gitignore
```

**Lưu ý:** File `backend/.env` chứa thông tin cấu hình kết nối cơ sở dữ liệu. Không được đưa file này lên GitHub.

## 4. Cấu hình môi trường

Ứng dụng sử dụng các biến môi trường để cấu hình kết nối PostgreSQL:

- `DB_HOST`: Địa chỉ máy chủ cơ sở dữ liệu.
- `DB_PORT`: Cổng kết nối PostgreSQL.
- `DB_NAME`: Tên cơ sở dữ liệu.
- `DB_USER`: Tên người dùng cơ sở dữ liệu.
- `DB_PASSWORD`: Mật khẩu cơ sở dữ liệu.

Các thông tin cấu hình được lưu trong file `backend/.env`.

File `.gitignore` được sử dụng để loại trừ các file không cần thiết hoặc chứa thông tin nhạy cảm:

```gitignore
__pycache__/
*.pyc
.venv/
.env
```

## 5. Khởi chạy ứng dụng

Mở PowerShell tại thư mục gốc của dự án và chạy lệnh:

```powershell
python -m uvicorn backend.app.main:app --reload
```

Sau khi ứng dụng khởi chạy thành công, có thể truy cập:

- **Địa chỉ API:** http://127.0.0.1:8000
- **Giao diện Swagger UI:** http://127.0.0.1:8000/docs

Giữ cửa sổ terminal hoạt động trong quá trình kiểm thử API.

## 6. Các chức năng API

### 6.1. Kiểm tra trạng thái hệ thống

- **Phương thức:** GET
- **Đường dẫn:** `/health`
- **Chức năng:** Kiểm tra trạng thái hoạt động của API và kết nối cơ sở dữ liệu.
- **Mã trạng thái mong đợi:** `200 OK` khi hệ thống hoạt động bình thường.

### 6.2. Tra cứu học phần

**Lấy danh sách học phần**

- **Phương thức:** GET
- **Đường dẫn:** `/courses`
- **Chức năng:** Lấy danh sách các học phần trong hệ thống.

**Lấy thông tin một học phần**

- **Phương thức:** GET
- **Đường dẫn:** `/courses/{course_code}`
- **Chức năng:** Tra cứu thông tin của học phần theo mã học phần.

Kết quả có thể bao gồm mã học phần, tên học phần và số tín chỉ.

### 6.3. Tra cứu lớp học phần

- **Phương thức:** GET
- **Đường dẫn:** `/sections`
- **Chức năng:** Lấy thông tin các lớp học phần.

API sử dụng khung nhìn cơ sở dữ liệu `v_section_summary` để truy xuất thông tin tổng hợp về lớp học phần.

### 6.4. Xem đăng ký học phần của sinh viên

- **Phương thức:** GET
- **Đường dẫn:** `/students/{student_id}/enrollments`
- **Chức năng:** Tra cứu danh sách học phần và lớp học phần mà sinh viên đã đăng ký.

API kết hợp dữ liệu đăng ký, lớp học phần và học phần để trả về thông tin cần thiết.

### 6.5. Đăng ký học phần

- **Phương thức:** POST
- **Đường dẫn:** `/enrollments`
- **Chức năng:** Tạo đăng ký học phần cho sinh viên.

API thực hiện các bước:
1. Kiểm tra dữ liệu gửi lên.
2. Kiểm tra sinh viên có tồn tại hay không.
3. Kiểm tra lớp học phần có tồn tại hay không.
4. Kiểm tra đăng ký đã tồn tại để tránh đăng ký trùng.
5. Thực hiện thêm bản ghi đăng ký vào cơ sở dữ liệu nếu dữ liệu hợp lệ.

Các mã trạng thái phản hồi:

- `201 Created`: Đăng ký thành công.
- `404 Not Found`: Không tìm thấy sinh viên hoặc lớp học phần.
- `409 Conflict`: Đăng ký bị trùng.
- `422 Unprocessable Entity`: Dữ liệu đầu vào không hợp lệ.

### 6.6. Hủy đăng ký học phần

- **Phương thức:** DELETE
- **Đường dẫn:** `/enrollments`
- **Chức năng:** Xóa một đăng ký học phần đã tồn tại theo các tham số mà API yêu cầu.

Các mã trạng thái phản hồi:

- `204 No Content`: Hủy đăng ký thành công.
- `404 Not Found`: Không tìm thấy đăng ký cần xóa.

## 7. Kiểm tra dữ liệu đầu vào

Pydantic được sử dụng để kiểm tra dữ liệu gửi đến API trước khi xử lý.

Đối với dữ liệu đăng ký học phần:

- `student_id`: Phải có đúng 8 ký tự.
- `class_section_id`: Phải có từ 1 đến 20 ký tự.

Nếu dữ liệu không đáp ứng các điều kiện kiểm tra, API trả về mã trạng thái `422 Unprocessable Entity`.

Ngoài ra, API còn kiểm tra sự tồn tại của sinh viên, lớp học phần và tình trạng đăng ký trùng để đảm bảo tính hợp lệ của dữ liệu.

## 8. Kiểm thử API bằng Postman

Bộ sưu tập các yêu cầu kiểm thử được lưu tại:

`postman/CourseHub_Buoi_3.postman_collection.json`

Môi trường kiểm thử cục bộ được lưu tại:

`postman/CourseHub_Local.postman_environment.json`

Biến môi trường `base_url` được thiết lập với giá trị:

`http://127.0.0.1:8000`

Các trường hợp kiểm thử bao gồm:

1. Kiểm tra trạng thái hệ thống.
2. Lấy danh sách học phần.
3. Tìm kiếm học phần.
4. Lấy thông tin chi tiết học phần.
5. Lấy danh sách lớp học phần.
6. Xem danh sách đăng ký của sinh viên.
7. Đăng ký học phần với dữ liệu hợp lệ.
8. Thử đăng ký trùng.
9. Gửi dữ liệu đăng ký không hợp lệ.
10. Hủy đăng ký học phần.

Với mỗi trường hợp kiểm thử, cần kiểm tra mã trạng thái HTTP và nội dung phản hồi để xác định kết quả có đúng với mong đợi hay không.

## 9. Trình tự kiểm thử đề xuất

Thực hiện kiểm thử theo thứ tự sau:

1. Khởi chạy ứng dụng FastAPI.
2. Gửi yêu cầu `GET /health` để kiểm tra hệ thống.
3. Gửi yêu cầu lấy danh sách học phần và lớp học phần.
4. Tra cứu đăng ký học phần của một sinh viên.
5. Tạo một đăng ký học phần hợp lệ.
6. Thử đăng ký trùng và gửi dữ liệu không hợp lệ.
7. Hủy đăng ký vừa tạo.
8. Kiểm tra lại dữ liệu để xác nhận kết quả thay đổi trong cơ sở dữ liệu.

Trình tự này giúp kiểm tra cả chức năng truy vấn, thêm, xóa và xử lý lỗi của API.

## 10. Quản lý mã nguồn bằng Git và GitHub

Trước khi gửi bài, cần kiểm tra các file mã nguồn, bộ sưu tập Postman, môi trường Postman và tài liệu ghi chú đã được chuẩn bị đầy đủ.

Chạy các lệnh sau tại thư mục gốc của dự án:

```powershell
git status
git check-ignore -v backend/.env
git branch --show-current
```

Thêm các file cần nộp vào vùng chuẩn bị commit:

```powershell
git add backend postman docs/week03_notes.md
git diff --cached --stat
git diff --cached
```

Kiểm tra danh sách file được đưa vào commit. Đảm bảo `backend/.env` không xuất hiện trong danh sách.

Sau khi kiểm tra, tạo commit:

```powershell
git commit -m "Add CourseHub FastAPI and Postman requests"
```

Đẩy commit lên GitHub:

```powershell
git push
```

Cuối cùng, truy cập repository trên GitHub để kiểm tra các file đã được cập nhật đầy đủ.

## 11. Lưu ý về bảo mật

- Không đưa mật khẩu cơ sở dữ liệu hoặc thông tin bí mật lên GitHub.
- Không commit file `backend/.env`.
- Sử dụng `backend/.env.example` để mô tả các biến môi trường cần thiết mà không tiết lộ thông tin thật.
- Kiểm tra nội dung trước khi commit để tránh đưa nhầm file nhạy cảm lên repository.

## 12. Kết luận

Trong tuần 3, dự án CourseHub tập trung xây dựng và kiểm thử REST API bằng FastAPI, SQLAlchemy Core và PostgreSQL.

Các nội dung chính bao gồm truy vấn cơ sở dữ liệu, quản lý đăng ký học phần, kiểm tra dữ liệu đầu vào, xử lý mã trạng thái HTTP, kiểm thử API bằng Postman và quản lý mã nguồn bằng Git/GitHub.

Qua đó, dự án giúp củng cố kiến thức về phát triển API, tương tác với cơ sở dữ liệu và quy trình kiểm thử phần mềm.
