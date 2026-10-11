-- 1. Liệt kê tất cả học phần
SELECT *
FROM courses
ORDER BY code;


-- 2. Tìm học phần có chữ "web"
SELECT *
FROM courses
WHERE LOWER(name) LIKE '%web%';


-- 3. Xem các lớp mà Minh Anh đã đăng ký
SELECT
    s.name AS student_name,
    cs.id AS class_id,
    cs.course_code
FROM enrollments AS e
JOIN students AS s
    ON e.student_id = s.id
JOIN class_sections AS cs
    ON e.class_section_id = cs.id
WHERE s.id = '22000001';


-- 4. Số sinh viên đăng ký và số chỗ còn lại của từng lớp
SELECT
    cs.id AS class_id,
    cs.course_code,
    cs.capacity,
    COUNT(e.student_id) AS enrolled,
    cs.capacity - COUNT(e.student_id) AS remaining
FROM class_sections AS cs
LEFT JOIN enrollments AS e
    ON e.class_section_id = cs.id
GROUP BY cs.id, cs.course_code, cs.capacity
ORDER BY cs.id;



SELECT
    s.id,
    s.name
FROM students AS s
WHERE NOT EXISTS (
    SELECT 1
    FROM enrollments AS e
    WHERE e.student_id = s.id
)
ORDER BY s.id;


WITH section_capacity AS (
    SELECT
        cs.id AS class_id,
        cs.course_code,
        cs.capacity,
        COUNT(e.student_id) AS enrolled
    FROM class_sections AS cs
    LEFT JOIN enrollments AS e
        ON e.class_section_id = cs.id
    GROUP BY cs.id, cs.course_code, cs.capacity
)
SELECT
    class_id,
    course_code,
    capacity,
    enrolled,
    capacity - enrolled AS remaining
FROM section_capacity
WHERE capacity - enrolled > 0
ORDER BY class_id;


WITH course_enrollment AS (
    SELECT
        c.code,
        c.name,
        COUNT(e.student_id) AS enrolled
    FROM courses AS c
    LEFT JOIN class_sections AS cs
        ON cs.course_code = c.code
    LEFT JOIN enrollments AS e
        ON e.class_section_id = cs.id
    GROUP BY c.code, c.name
)
SELECT
    code,
    name,
    enrolled,
    DENSE_RANK() OVER (
        ORDER BY enrolled DESC
    ) AS enrollment_rank
FROM course_enrollment
ORDER BY enrollment_rank, code;