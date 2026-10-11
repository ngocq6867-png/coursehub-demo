CREATE VIEW v_section_summary AS
SELECT
    cs.id AS class_id,
    cs.course_code,
    cs.capacity,
    COUNT(e.student_id) AS enrolled,
    cs.capacity - COUNT(e.student_id) AS remaining
FROM class_sections AS cs
LEFT JOIN enrollments AS e
    ON e.class_section_id = cs.id
GROUP BY
    cs.id,
    cs.course_code,
    cs.capacity;