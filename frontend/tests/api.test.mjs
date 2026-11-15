
import test, { mock } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const apiUrl = new URL("../src/api.js", import.meta.url);
let source = await readFile(apiUrl, "utf8");

// Mo phong bien moi truong do Vite cung cap.
const envExpression = "import.meta.env.VITE_API_BASE_URL";

assert.ok(
  source.includes(envExpression),
  "Khong tim thay bien VITE_API_BASE_URL trong api.js"
);

source = source.replace(
  envExpression,
  JSON.stringify("http://127.0.0.1:8000")
);

// Nap chinh code api.js sau khi thay bien moi truong.
const { api } = await import(
  `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`
);

// Test 1: GET thanh cong
test("GET /courses tra ve danh sach khoa hoc", async () => {
  const fetchMock = mock.method(globalThis, "fetch", async () => ({
    ok: true,
    status: 200,
    text: async () => JSON.stringify([{ id: 1, name: "CourseHub" }]),
  }));

  try {
    const result = await api("/courses");

    assert.equal(result.length, 1);
    assert.equal(result[0].name, "CourseHub");
    assert.equal(
      fetchMock.mock.calls[0].arguments[0],
      "http://127.0.0.1:8000/courses"
    );
  } finally {
    fetchMock.mock.restore();
  }
});

// Test 2: POST dang ky thanh cong
test("POST /enrollments gui JSON va nhan 201", async () => {
  const fetchMock = mock.method(globalThis, "fetch", async () => ({
    ok: true,
    status: 201,
    text: async () => JSON.stringify({ id: 10 }),
  }));

  try {
    const payload = {
      student_id: "22000004",
      class_section_id: 1,
    };

    const result = await api("/enrollments", {
      method: "POST",
      body: payload,
    });

    assert.equal(result.id, 10);

    const options = fetchMock.mock.calls[0].arguments[1];

    assert.equal(options.method, "POST");
    assert.equal(options.headers["Content-Type"], "application/json");
    assert.deepEqual(JSON.parse(options.body), payload);
  } finally {
    fetchMock.mock.restore();
  }
});

// Test 3: DELETE thanh cong
test("DELETE tra ve 204 thi api tra ve null", async () => {
  const fetchMock = mock.method(globalThis, "fetch", async () => ({
    ok: true,
    status: 204,
  }));

  try {
    const result = await api(
      "/enrollments/22000004/1",
      { method: "DELETE" }
    );

    assert.equal(result, null);
  } finally {
    fetchMock.mock.restore();
  }
});

// Test 4: Xu ly loi HTTP 409
test("HTTP 409 giu nguyen status va thong bao", async () => {
  const fetchMock = mock.method(globalThis, "fetch", async () => ({
    ok: false,
    status: 409,
    text: async () =>
      JSON.stringify({ detail: "Class is full" }),
  }));

  try {
    await assert.rejects(
      () => api("/enrollments", { method: "POST" }),
      (error) => {
        assert.equal(error.status, 409);
        assert.match(error.message, /Class is full/);
        return true;
      }
    );
  } finally {
    fetchMock.mock.restore();
  }
});

// Test 5: Xu ly loi HTTP 404
test("HTTP 404 duoc thong bao dung", async () => {
  const fetchMock = mock.method(globalThis, "fetch", async () => ({
    ok: false,
    status: 404,
    text: async () =>
      JSON.stringify({ detail: "Student not found" }),
  }));

  try {
    await assert.rejects(
      () => api("/students/999/enrollments"),
      (error) => {
        assert.equal(error.status, 404);
        return true;
      }
    );
  } finally {
    fetchMock.mock.restore();
  }
});

// Test 6: Phan hoi khong phai JSON
test("Phan hoi JSON khong hop le phai bao loi", async () => {
  const fetchMock = mock.method(globalThis, "fetch", async () => ({
    ok: true,
    status: 200,
    text: async () => "not valid json",
  }));

  try {
    await assert.rejects(
      () => api("/courses"),
      /HTTP 200/
    );
  } finally {
    fetchMock.mock.restore();
  }
});

// Test 7: Loi ket noi mang
test("Loi ket noi duoc chuyen thanh thong bao", async () => {
  const fetchMock = mock.method(globalThis, "fetch", async () => {
    throw new TypeError("Failed to fetch");
  });

  try {
    await assert.rejects(
      () => api("/courses"),
      /FastAPI/
    );
  } finally {
    fetchMock.mock.restore();
  }
});
