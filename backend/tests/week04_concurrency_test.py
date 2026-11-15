from __future__ import annotations

from concurrent.futures import ThreadPoolExecutor
import threading

import requests

# API dang chay tren cong 8001
BASE_URL = "http://127.0.0.1:8001"

SECTION_ID = "RACE-01"
STUDENT_IDS = ["22000002", "22000004"]


def reset_demo() -> None:
    """Xoa dang ky cu cua hai sinh vien."""
    for student_id in STUDENT_IDS:
        response = requests.delete(
            f"{BASE_URL}/enrollments/{student_id}/{SECTION_ID}",
            timeout=10,
        )

        if response.status_code not in (204, 404):
            raise RuntimeError(
                f"Reset failed: {student_id}: "
                f"{response.status_code} {response.text}"
            )


def enroll(
    student_id: str,
    barrier: threading.Barrier,
) -> tuple[str, int, object]:
    """Gui yeu cau dang ky dong thoi."""

    barrier.wait(timeout=5)

    response = requests.post(
        f"{BASE_URL}/enrollments",
        json={
            "student_id": student_id,
            "class_section_id": SECTION_ID,
        },
        timeout=15,
    )

    body = response.json() if response.content else None

    return student_id, response.status_code, body


def main() -> None:

    # 1. Kiem tra server
    health = requests.get(
        f"{BASE_URL}/health",
        timeout=5,
    )
    health.raise_for_status()

    # 2. Xoa dang ky cu
    reset_demo()

    # 3. Tao rao chan dong bo hai luong
    barrier = threading.Barrier(len(STUDENT_IDS))

    # 4. Gui hai request gan nhu dong thoi
    with ThreadPoolExecutor(max_workers=2) as executor:
        futures = [
            executor.submit(enroll, student_id, barrier)
            for student_id in STUDENT_IDS
        ]

        results = [future.result() for future in futures]

    # 5. Hien thi ket qua
    print("\n===== CONCURRENCY TEST RESULTS =====")

    for student_id, status_code, body in results:
        print(
            f"Student: {student_id} | "
            f"HTTP: {status_code} | "
            f"Response: {body}"
        )

    # 6. Kiem tra HTTP status
    statuses = sorted(
        status_code
        for _, status_code, _ in results
    )

    assert statuses == [201, 409], (
        f"Unexpected statuses: {statuses}"
    )

    # 7. Kiem tra so luong dang ky thuc te
    response = requests.get(
        f"{BASE_URL}/sections",
        timeout=5,
    )
    response.raise_for_status()

    sections = response.json()

    race_section = next(
        (
            section
            for section in sections
            if section["class_id"] == SECTION_ID
        ),
        None,
    )

    assert race_section is not None, "RACE-01 not found"

    assert int(race_section["enrolled"]) == 1, (
        f"Incorrect enrollment count: {race_section}"
    )

    assert int(race_section["remaining"]) == 0, (
        f"Incorrect remaining capacity: {race_section}"
    )

    print("\n===== FINAL RESULT =====")
    print("PASS: One 201, one 409")
    print("PASS: Enrolled = 1")
    print("PASS: Remaining = 0")
    print("CONCURRENCY TEST PASSED")


if __name__ == "__main__":
    main()