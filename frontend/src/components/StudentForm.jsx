export default function StudentForm({ value, onChange, onSubmit, disabled }) {
  return (
    <form className="student-form" onSubmit={onSubmit}>
      <label htmlFor="student-id">Mã sinh viên</label>
      <input id="student-id" value={value} onChange={(event) => onChange(event.target.value)}
        placeholder="Ví dụ: 22000004" inputMode="numeric" maxLength={8} />
      <button disabled={disabled} type="submit">Xem đăng ký</button>
    </form>
  );
}
