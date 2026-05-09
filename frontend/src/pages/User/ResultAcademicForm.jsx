import { useNavigate } from "react-router-dom";

function ResultAcademicForm({ result, classInfo }) {
    const navigate = useNavigate();
    return (
        <div className="result-layout">
            <h1 style={{ textAlign: "center", marginBottom: "20px" }}>KẾT QUẢ HỌC TẬP</h1>
            <section className="result-class-info">
                <h3>THÔNG TIN LỚP HỌC:</h3>
                <div className="result-class-grid">
                    <p><strong>Khóa học:</strong> {classInfo?.course_name || "—"}</p>
                    <p><strong>Cấp độ:</strong> {classInfo?.course_level || "—"}</p>                    <p><strong>Lớp học:</strong> {classInfo?.name || "—"}</p>
                    <p><strong>Giáo viên chính:</strong> {classInfo?.main_teacher ? `${classInfo.main_teacher.first_name} ${classInfo.main_teacher.last_name}` : "—"}</p>
                    <p><strong>Thời gian:</strong> {classInfo ? `${classInfo.start_date} - ${classInfo.end_date}` : "—"}</p>                </div>
            </section>

            <section className="result-scores">
                <div className="result-scores-header">
                    <h3>KẾT QUẢ HỌC TẬP:</h3>
                    <span>
                        Chuyên cần: {result?.attendance_count}/{classInfo?.total_sessions ?? "—"} buổi
                    </span>
                </div>

                <table className="result-score-table">
                    <thead>
                        <tr>
                            {result?.scores?.map(s => <th key={s.id}>{s.score_type}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            {result?.scores?.map(s => <td key={s.id}>{s.score_value ?? "---"}</td>)}
                        </tr>
                    </tbody>
                </table>
            </section>

            <section className="result-summary">
                <p>Điểm tổng kết: {result?.average_score ?? "---"}</p>
                <p>Nhận xét của giáo viên: {result?.comment || "Chưa có nhận xét"}</p>
                <p>Lộ trình đề xuất tiếp theo:{" "}
                    <strong>{result?.next_course_suggestion || "Chưa cập nhật"}</strong>
                </p>
            </section>
        </div>
    );
}

export default ResultAcademicForm;