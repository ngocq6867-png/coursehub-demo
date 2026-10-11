# CourseHub - Buoi 2

## 1. Co so du lieu

- DBMS: PostgreSQL.
- Database: `coursehub`.
- Cac bang: `students`, `courses`, `semesters`, `lecturers`, `class_sections`, `enrollments`.

## 2. Thu tu thuc hien

- `01_schema.sql`: tao cac bang va rang buoc.
- `02_seed.sql`: them du lieu mau.
- `03_queries.sql`: thuc hanh truy van SQL.
- `04_views.sql`: tao View tong hop thong tin lop.
- `05_constraint_checks.sql`: kiem tra cac rang buoc du lieu.
- `06_view_demo.sql`: minh hoa transaction va ROLLBACK.
- `07_ai_query.sql`: minh hoa loi logic khi dung COUNT(*) voi LEFT JOIN.

## 3. Du lieu mau

- 4 sinh vien.
- 3 hoc phan.
- 1 hoc ky.
- 2 giang vien.
- 4 lop hoc phan.
- 5 luot dang ky.

## 4. Ket qua quan trong

- `WEB-01`: 2 sinh vien dang ky, con 1 cho.
- `WEB-02`: 0 sinh vien dang ky, con 2 cho.
- `v_section_summary`: View tong hop so luong dang ky va so cho con lai.
- `ROLLBACK`: huy thay doi trong transaction.
- `COUNT(e.student_id)`: dem cac luot dang ky thuc te khi dung LEFT JOIN.

## 5. Luu y

Cac file SQL luu cau lenh va cau truc database, khong phai ban sao cua du lieu dang chay. Khi clone repository sang may khac, can ket noi PostgreSQL va chay lai cac file SQL theo thu tu phu hop.