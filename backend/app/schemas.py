from pydantic import BaseModel, Field


class EnrollmentCreate(BaseModel):
    student_id: str = Field(
        min_length=8,
        max_length=8,
        description="Student ID",
    )

    class_section_id: str = Field(
        min_length=1,
        max_length=20,
        description="Class section ID",
    )
