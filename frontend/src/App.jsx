import { useEffect, useState } from "react";
import { api } from "./api.js";
import Notice from "./components/Notice.jsx";
import StudentForm from "./components/StudentForm.jsx";
import SectionTable from "./components/SectionTable.jsx";
import EnrollmentList from "./components/EnrollmentList.jsx";

export default function App() {
  const [draftId, setDraftId] = useState("22000004");
  const [studentId, setStudentId] = useState("22000004");
  const [courses, setCourses] = useState([]);
  const [sections, setSections] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState({ kind: "info", text: "" });
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const opts = { signal: controller.signal };
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [courseData, sectionData, enrollmentData] = await Promise.all([
          api("/courses", opts), api("/sections", opts),
          api(`/students/${encodeURIComponent(studentId)}/enrollments`, opts),
        ]);
        if (controller.signal.aborted) return;
        if (![courseData, sectionData, enrollmentData].every(Array.isArray))
          throw new Error("API không trả về danh sách như mong đợi.");
        setCourses(courseData);
        setSections(sectionData);
        setEnrollments(enrollmentData);
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err.message);
        setCourses([]); setSections([]); setEnrollments([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, [studentId, refresh]);

  function chooseStudent(event) {
    event.preventDefault();
    const id = draftId.trim();
    if (!/^\d{8}$/.test(id)) {
      setNotice({ kind: "error", text: "Mã sinh viên demo phải gồm 8 chữ số." });
      return;
    }
    setNotice({ kind: "info", text: "" });
    setLoading(true);
    setStudentId(id);
    setRefresh((n) => n + 1);
  }

  async function changeEnrollment(sectionId, cancel = false) {
    if (busy || loading || error) return;
    if (cancel && !window.confirm(`Hủy đăng ký lớp ${sectionId}?`)) return;
    setBusy(true);
    setNotice({ kind: "info", text: "Đang gửi yêu cầu..." });
    try {
      if (cancel) {
        await api(`/enrollments/${encodeURIComponent(studentId)}/${encodeURIComponent(sectionId)}`, { method: "DELETE" });
      } else {
        await api("/enrollments", { method: "POST", body: { student_id: studentId, class_section_id: sectionId } });
      }
      setNotice({ kind: "success", text: cancel ? `Đã hủy đăng ký ${sectionId}.` : `Đăng ký ${sectionId} thành công.` });
    } catch (err) {
      setNotice({ kind: "error", text: err.message });
    } finally {
      setLoading(true);
      setRefresh((n) => n + 1);
      setBusy(false);
    }
  }

  const keyword = search.trim().toLowerCase();
  const courseName = (code) => courses.find((course) => course.code === code)?.name ?? code;
  const rows = sections.map((section) => ({
    ...section,
    course_name: courseName(section.course_code),
    registered: enrollments.some((item) => item.class_section_id === section.class_id),
  })).filter((row) =>
    `${row.class_id} ${row.course_code} ${row.course_name}`.toLowerCase().includes(keyword)
    && (!courseFilter || row.course_code === courseFilter)
    && (!onlyAvailable || row.remaining > 0)
  );
  const enrollmentRows = enrollments.map((row) => ({
    ...row,
    course_name: row.course_name ?? courseName(sections.find((s) => s.class_id === row.class_section_id)?.course_code),
  }));
  const disabled = loading || busy || Boolean(error);
  const available = sections.filter((section) => section.remaining > 0).length;

  return (
    <main className="container">
      <header className="hero">
        <div><p className="eyebrow">COURSEHUB · STUDENT PORTAL</p>
          <h1>Đăng ký học phần</h1>
          <p>Quản lý lớp học phần trực tiếp từ FastAPI và PostgreSQL</p></div>
        <span className="hero-label">WEEK 05 · REACT</span>
      </header>
      <p className="demo-note">Môi trường demo học tập · Không sử dụng dữ liệu người dùng thật.</p>

      <section className="panel">
        <div className="heading"><h2>Chọn sinh viên</h2><span className="muted">Đang xem: {studentId}</span></div>
        <StudentForm value={draftId} onChange={setDraftId} onSubmit={chooseStudent} disabled={busy} />
        <Notice kind={notice.kind}>{notice.text}</Notice>
        <Notice kind="error">{error}</Notice>
        {loading && <p className="muted" role="status">Đang tải dữ liệu mới từ máy chủ...</p>}
      </section>

      <div className="stats">
        <div className="stat"><span>Tổng số lớp</span><strong>{sections.length}</strong></div>
        <div className="stat"><span>Lớp còn chỗ</span><strong>{available}</strong></div>
        <div className="stat"><span>Đã đăng ký</span><strong>{enrollments.length}</strong></div>
      </div>

      <div className="workspace">
        <section className="panel">
          <div className="heading"><h2>Danh sách lớp học phần</h2>
            <button className="secondary" disabled={busy} onClick={() => { setLoading(true); setRefresh((n) => n + 1); }}>Tải lại dữ liệu</button>
          </div>
          <div className="filters">
            <input aria-label="Tìm lớp học phần" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm mã lớp hoặc tên học phần..." />
            <select aria-label="Lọc theo học phần" value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)}>
              <option value="">Tất cả học phần</option>
              {courses.map((course) => <option key={course.code} value={course.code}>{course.code} · {course.name}</option>)}
            </select>
            <label className="check"><input type="checkbox" checked={onlyAvailable} onChange={(e) => setOnlyAvailable(e.target.checked)} /> Chỉ lớp còn chỗ</label>
          </div>
          {loading ? <div className="empty">Đang tải lớp học phần...</div>
            : error ? <div className="empty">Không hiển thị dữ liệu cũ khi API lỗi.</div>
            : <SectionTable rows={rows} disabled={disabled} onEnroll={(id) => changeEnrollment(id)} />}
        </section>

        <section className="panel">
          <div className="heading"><h2>Lớp đã đăng ký</h2><span className="count">{enrollments.length}</span></div>
          <p className="muted">Danh sách thực tế của sinh viên {studentId}</p>
          {loading ? <div className="empty">Đang tải đăng ký...</div>
            : error ? <div className="empty">Chưa thể tải danh sách.</div>
            : <EnrollmentList rows={enrollmentRows} disabled={disabled} onCancel={(id) => changeEnrollment(id, true)} />}
        </section>
      </div>
      <footer>CourseHub · Thực hành Cơ sở dữ liệu Web · React ↔ FastAPI ↔ PostgreSQL</footer>
    </main>
  );
}
