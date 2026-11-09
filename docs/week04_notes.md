# CourseHub – Báo cáo thực hành Buổi 4

## 1. Mục tiêu

- Tìm hiểu transaction, COMMIT, ROLLBACK và race condition trong đăng ký học phần.
- Sử dụng `SELECT ... FOR UPDATE` để khóa dòng lớp học phần khi tạo/hủy đăng ký.
- Tạo migration có phiên bản và lưu lịch sử sự kiện đăng ký.
- Kiểm thử hai yêu cầu đăng ký đồng thời vào lớp chỉ còn một chỗ.
- Sinh 100.000 sự kiện để so sánh kế hoạch và thời gian truy vấn trước/sau khi tạo composite index.
- Sử dụng bind parameters để hạn chế nguy cơ SQL injection.

## 2. Migration 001 và dữ liệu thử nghiệm

- Migration: `database/migrations/001_add_enrollment_events.sql`.
- Bảng `schema_migrations`: theo dõi phiên bản migration đã áp dụng.
- Bảng `enrollment_events`: lưu sự kiện `CREATED` và `CANCELLED`.
- File rollback: `database/migrations/001_add_enrollment_events_rollback.sql` (không chạy trong quy trình thông thường).
- Lớp thực nghiệm: `RACE-01`, `capacity = 1`.

## 3. Race condition và row-level locking

**Thí nghiệm không khóa:** Hai transaction đọc trạng thái lớp `RACE-01` còn một chỗ rồi cùng thêm đăng ký. Trong trường hợp xen kẽ thành công, số sinh viên đăng ký vượt sức chứa (`enrolled = 2`, `remaining = -1`). Nguyên nhân là các transaction cùng đưa ra quyết định dựa trên dữ liệu cũ.

**Thí nghiệm khóa dòng:** Sử dụng `SELECT ... FOR UPDATE` trên dòng của `RACE-01`. Transaction B phải chờ transaction A kết thúc trước khi lấy được khóa. Khi áp dụng vào API, thao tác kiểm tra trùng, đếm số đăng ký, thêm đăng ký và ghi sự kiện được đặt trong transaction để xử lý đồng thời an toàn hơn.

## 4. API Transaction và kiểm thử

- Phiên bản API: `0.4.0`.
- `POST /enrollments`: khóa lớp học phần, kiểm tra đăng ký trùng và sức chứa, sau đó thêm đăng ký cùng sự kiện `CREATED` trong một transaction.
- `DELETE /enrollments/{student_id}/{class_section_id}`: khóa lớp, xóa đăng ký và thêm sự kiện `CANCELLED` trong cùng transaction.
- Kết quả kỳ vọng của phép thử tuần tự: `201 Created` → `409 Conflict` → `204 No Content`.
- Kết quả kỳ vọng của kiểm thử đồng thời: một `201`, một `409`, cuối cùng `enrolled = 1`, `remaining = 0`.

> Minh chứng kiểm thử: [Bổ sung ảnh hoặc log `CONCURRENCY TEST PASSED` đã chạy thực tế nếu lưu trong repository.]

## 5. Dữ liệu hiệu năng và composite index

Script `database/11_generate_performance_events.sql` tạo bộ dữ liệu giả lập 100.000 sự kiện với `dataset = 'performance'` để tách khỏi dữ liệu lịch sử API (`dataset = 'demo'`).

Truy vấn đánh giá:

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, student_id, class_section_id, event_type, occurred_at
FROM enrollment_events
WHERE dataset = 'performance'
  AND student_id = '22000001'
  AND occurred_at >= TIMESTAMP '2025-12-20 00:00:00'
ORDER BY occurred_at DESC
LIMIT 50;
```

Chỉ mục được tạo:

```sql
CREATE INDEX idx_enrollment_events_dataset_student_time
ON enrollment_events (dataset, student_id, occurred_at DESC);
```

### 5.1. Kết quả đo thực tế

| Chỉ tiêu | Trước index | Sau index |
|---|---:|---:|
| Scan Type | Seq Scan + Sort | Index Scan |
| Execution Time | 10.331 ms | 0.184 ms |
| Planning Time | 1.261 ms | 2.365 ms |
| Buffers (execution) | shared hit = 1137 | shared hit = 50, read = 3 |
| Rows Removed by Filter | 99183 | Không hiển thị trong kế hoạch |
| Số dòng trả về | 50 | 50 |

### 5.2. Nhận xét

Trước khi tạo index, PostgreSQL sử dụng `Seq Scan` để đọc bảng `enrollment_events`, loại 99.183 dòng không thỏa điều kiện, rồi sắp xếp theo `occurred_at DESC` trước khi lấy 50 dòng. Thời gian thực thi là **10.331 ms**.

Sau khi tạo composite index trên `(dataset, student_id, occurred_at DESC)`, PostgreSQL chuyển sang `Index Scan`, dùng các điều kiện lọc trên chính chỉ mục và trả về 50 dòng mà không cần một bước `Sort` riêng trong kế hoạch được ghi nhận. Thời gian thực thi giảm còn **0.184 ms**.

Mức giảm thời gian thực thi của hai phép đo:

\[
\frac{10.331 - 0.184}{10.331} \times 100\% \approx 98.22\%.
\]

Tương đương tốc độ thực thi cao hơn khoảng **56,15 lần** trong lần đo này. Số lần truy cập shared buffers trong quá trình thực thi cũng giảm đáng kể. Kết quả phụ thuộc vào dữ liệu, bộ nhớ đệm, thống kê và môi trường chạy, nên không thể xem đây là tỷ lệ tăng tốc cố định.

## 6. An toàn truy vấn

API `/courses` sử dụng tham số `:q` thay vì nối trực tiếp giá trị người dùng vào câu SQL:

```python
sql += " WHERE code ILIKE :q OR name ILIKE :q"
params["q"] = f"%{q}%"
```

Cách này giúp giá trị đầu vào được xử lý như dữ liệu, không phải cú pháp SQL. Kết quả thử input đặc biệt: **[Bổ sung sau khi chạy kiểm thử thực tế]**.

## 7. Kết luận

Buổi thực hành minh họa nguyên nhân race condition khi hai transaction đọc và ghi dữ liệu xen kẽ; cơ chế row-level locking và transaction để kiểm soát việc đăng ký; migration để mở rộng CSDL có phiên bản; và tác động thực tế của composite index đến kế hoạch thực thi truy vấn trên bảng dữ liệu lớn.

Các kết quả kiểm thử và số liệu đo được cần được lưu kèm code trên nhánh `week_4` của repository GitHub.
