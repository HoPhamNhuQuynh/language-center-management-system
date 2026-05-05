import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { myClassResultApi } from "../../services/studentService";
import { classDetailApi } from "../../services/classService";
import ResultAcademicForm from "../../pages/User/ResultAcademicForm";
import "../../styles/ResultAcademic.css";


function ResultAcademic() {
    const { state } = useLocation();
    const enrollmentId = state?.enrollmentId;
    const classId = state?.classId;

    const [result, setResult] = useState(null);
    const [classInfo, setClassInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [all, classDetail] = await Promise.all([
                    myClassResultApi(),
                    classDetailApi(classId)
                ]);
                const found = all.find(r => String(r.enrollment_id) === String(enrollmentId));
                setResult(found || null);
                setClassInfo(classDetail);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [enrollmentId, classId]);

    if (loading) return <div>Loading...</div>;

    return (
        <div className="student-info-layout">
            <main className="student-info-main">
                <ResultAcademicForm result={result} classInfo={classInfo} />
            </main>
        </div>
    );
}

export default ResultAcademic;