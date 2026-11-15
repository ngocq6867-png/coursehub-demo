-- BUOI 4: ROW-LEVEL LOCKING DEMO
-- Chay hai khoi tren hai Query Tool doc lap.

-- ==========================================
-- TAB A: GIU KHOA 8 GIAY
-- ==========================================

BEGIN;

SELECT id, capacity
FROM class_sections
WHERE id = 'RACE-01'
FOR UPDATE;

SELECT pg_sleep(8);

COMMIT;


-- ==========================================
-- TAB B: DOI KHOA CUA TAB A
-- ==========================================

BEGIN;

SELECT id, capacity
FROM class_sections
WHERE id = 'RACE-01'
FOR UPDATE;

ROLLBACK;