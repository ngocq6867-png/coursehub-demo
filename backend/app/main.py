from fastapi import FastAPI, HTTPException, Query, Response
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from backend.app.database import engine
from backend.app.schemas import EnrollmentCreate

app = FastAPI(
    title="CourseHub API",
    description="API quản lý học phần và đăng ký học phần",
    version="1.0.0",
)


@app.get("/")
def root():
    return {"message": "Welcome to CourseHub API"}


@app.get("/health")
def health():
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"status": "ok", "database": "connected"}
    except SQLAlchemyError:
        raise HTTPException(
            status_code=503,
            detail="Database connection failed",
        )


@app.get("/courses")
def get_courses(q: str | None = Query(default=None)):
    sql = "SELECT code, name, credits FROM courses"
    params = {}

    if q:
        sql += " WHERE code ILIKE :q OR name ILIKE :q"
        params["q"] = f"%{q}%"

    sql += " ORDER BY code"

    try:
        with engine.connect() as conn:
            rows = conn.execute(text(sql), params).mappings().all()
            return [dict(row) for row in rows]
    except SQLAlchemyError as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/courses/{course_code}")
def get_course(course_code: str):
    try:
        with engine.connect() as conn:
            row = conn.execute(
                text("""
                    SELECT code, name, credits
                    FROM courses
                    WHERE code = :course_code
                """),
                {"course_code": course_code},
            ).mappings().first()

            if row is None:
                raise HTTPException(
                    status_code=404,
                    detail="Course not found",
                )

            return dict(row)

    except HTTPException:
        raise
    except SQLAlchemyError as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/sections")
def get_sections():
    try:
        with engine.connect() as conn:
            rows = conn.execute(
                text("SELECT * FROM v_section_summary")
            ).mappings().all()
            return [dict(row) for row in rows]
    except SQLAlchemyError as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/students/{student_id}/enrollments")
def get_student_enrollments(student_id: str):
    try:
        with engine.connect() as conn:
            rows = conn.execute(
                text("""
                    SELECT
                        e.student_id,
                        e.class_section_id,
                        e.registered_at,
                        cs.course_code,
                        c.name AS course_name,
                        cs.semester_code
                    FROM enrollments e
                    JOIN class_sections cs
                        ON e.class_section_id = cs.id
                    JOIN courses c
                        ON cs.course_code = c.code
                    WHERE e.student_id = :student_id
                    ORDER BY e.registered_at DESC
                """),
                {"student_id": student_id},
            ).mappings().all()

            return [dict(row) for row in rows]

    except SQLAlchemyError as exc:
        raise HTTPException(status_code=500, detail=str(exc))



@app.post("/enrollments", status_code=201)
def create_enrollment(enrollment: EnrollmentCreate):
    try:
        with engine.begin() as conn:
            student = conn.execute(
                text("""
                    SELECT 1
                    FROM students
                    WHERE id = :student_id
                """),
                {"student_id": enrollment.student_id},
            ).first()

            if student is None:
                raise HTTPException(
                    status_code=404,
                    detail="Student not found",
                )

            section = conn.execute(
                text("""
                    SELECT 1
                    FROM class_sections
                    WHERE id = :class_section_id
                """),
                {"class_section_id": enrollment.class_section_id},
            ).first()

            if section is None:
                raise HTTPException(
                    status_code=404,
                    detail="Class section not found",
                )

            existing = conn.execute(
                text("""
                    SELECT 1
                    FROM enrollments
                    WHERE student_id = :student_id
                      AND class_section_id = :class_section_id
                """),
                {
                    "student_id": enrollment.student_id,
                    "class_section_id": enrollment.class_section_id,
                },
            ).first()

            if existing:
                raise HTTPException(
                    status_code=409,
                    detail="Enrollment already exists",
                )

            conn.execute(
                text("""
                    INSERT INTO enrollments
                        (student_id, class_section_id)
                    VALUES
                        (:student_id, :class_section_id)
                """),
                {
                    "student_id": enrollment.student_id,
                    "class_section_id": enrollment.class_section_id,
                },
            )

        return {
            "message": "Enrollment created successfully",
            "student_id": enrollment.student_id,
            "class_section_id": enrollment.class_section_id,
        }

    except HTTPException:
        raise
    except SQLAlchemyError as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.delete("/enrollments/{student_id}/{class_section_id}", status_code=204)
def delete_enrollment(student_id: str, class_section_id: str):
    try:
        with engine.begin() as conn:
            result = conn.execute(
                text("""
                    DELETE FROM enrollments
                    WHERE student_id = :student_id
                      AND class_section_id = :class_section_id
                """),
                {
                    "student_id": student_id,
                    "class_section_id": class_section_id,
                },
            )

            if result.rowcount == 0:
                raise HTTPException(
                    status_code=404,
                    detail="Enrollment not found",
                )

        return Response(status_code=204)

    except HTTPException:
        raise
    except SQLAlchemyError as exc:
        raise HTTPException(status_code=500, detail=str(exc))
