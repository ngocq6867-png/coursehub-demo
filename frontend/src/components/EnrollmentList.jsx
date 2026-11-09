export default function EnrollmentList({ rows, disabled, onCancel }) {
  if (!rows.length) return <div className="empty">Sinh viên chưa đăng ký lớp nào.</div>;
  return (
    <ul className="enrollments">{rows.map((row) => (
      <li key={row.class_section_id}>
        <div><strong>{row.class_section_id}</strong><span className="subtext">{row.course_name}</span></div>
        <button className="secondary" type="button" disabled={disabled}
          onClick={() => onCancel(row.class_section_id)}>Hủy đăng ký</button>
      </li>
    ))}</ul>
  );
}
