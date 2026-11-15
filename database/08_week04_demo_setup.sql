-- Buoi 4: Tao du lieu thuc hanh Race Condition

-- 1. Tao lop RACE-01 co suc chua 1 sinh vien
INSERT INTO class_sections
    (id, course_code, semester_code, lecturer_id, capacity)
VALUES
    ('RACE-01', 'INT2204', '2026-1', 'GV01', 1)
ON CONFLICT (id) DO UPDATE
SET capacity = EXCLUDED.capacity;

-- 2. Xoa cac dang ky thu nghiem cu cua RACE-01
DELETE FROM enrollments
WHERE class_section_id = 'RACE-01';

-- 3. Xoa lich su su kien demo cu cua RACE-01
DELETE FROM enrollment_events
WHERE class_section_id = 'RACE-01'
  AND dataset = 'demo';

-- 4. Kiem tra trang thai lop
SELECT class_id, capacity, enrolled, remaining
FROM v_section_summary
WHERE class_id = 'RACE-01';