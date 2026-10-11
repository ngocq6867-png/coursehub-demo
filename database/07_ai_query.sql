-- Câu sai về mặt logic
SELECT
    cs.id AS class_id,
    COUNT(*) AS enrolled
FROM class_sections AS cs
LEFT JOIN enrollments AS e
    ON e.class_section_id = cs.id
GROUP BY cs.id
ORDER BY cs.id;