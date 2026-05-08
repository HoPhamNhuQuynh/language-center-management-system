import { useEffect, useState } from "react";
import ScoreEntryForm from "../../pages/Score/ScoreEntryForm";
import "../../styles/ScoreEntry.css";
import { isScoreInRange, isValidNumberInput } from "../../utils/validation";
import {
  getScoresApi,
  getScoreTypesApi,
  bulkSyncScoresApi,
  submitScoresApi,
  loadClassesApi,
} from "../../services/scoreService";

const transformScores = (scores) => {
  const studentMap = {};

  for (const score of scores) {
    const key = score.enrollment_id;

    if (!studentMap[key]) {
      studentMap[key] = {
        enrollmentId: score.enrollment_id,
        id: score.student.id,
        fullName: `${score.student.first_name} ${score.student.last_name}`,
        scores: {},
        remark: "",
      };
    }

    studentMap[key].scores[String(score.score_type_id)] = String(
      score.score_value,
    );
  }

  return Object.values(studentMap);
};

const calcAverage = (scores, scoreTypes) => {
  let totalWeight = 0;
  let weightedSum = 0;

  for (const st of scoreTypes) {
    const val = parseFloat(scores[String(st.id)]);
    if (isNaN(val)) return "";
    weightedSum += val * st.weight;
    totalWeight += st.weight;
  }

  if (totalWeight === 0) return "";
  return (weightedSum / totalWeight).toFixed(1);
};

function ScoreEntry() {
  const [classes, setClasses] = useState([]); 
  const [selectedClass, setSelectedClass] = useState("");
  const [scoreTypes, setScoreTypes] = useState([]);
  const [scoreRows, setScoreRows] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [focusedCell, setFocusedCell] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!selectedClass) return;

    const STORAGE_KEY = `temp_scores_class_${selectedClass}`;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const [types, scores] = await Promise.all([
          getScoreTypesApi(selectedClass),
          getScoresApi(selectedClass),
        ]);

        setScoreTypes(types);

        const serverRows = transformScores(scores).map((row) => ({
          ...row,
          average: calcAverage(row.scores, types),
        }));

        const saved = localStorage.getItem(STORAGE_KEY);

        if (saved) {
          const savedRows = JSON.parse(saved);
          const savedMap = Object.fromEntries(
            savedRows.map((r) => [r.enrollmentId, r]),
          );

          const merged = serverRows.map((row) => {
            const s = savedMap[row.enrollmentId];
            if (!s) return row;
            const mergedScores = { ...row.scores, ...s.scores };
            return {
              ...row,
              scores: mergedScores,
              remark: s.remark ?? row.remark,
              average: calcAverage(mergedScores, types),
            };
          });

          setScoreRows(merged);
        } else {
          setScoreRows(serverRows);
        }
      } catch (err) {
        console.error(err);
        setError("Không thể tải dữ liệu. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [selectedClass]);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      let res = await loadClassesApi();
      setClasses(res.results);
      console.info(res);
    } catch (ex) {
      console.error(ex);
    }
  }

  const handleClassChange = (classId) => {
    setSelectedClass(classId);

    const selectedClsData = classes.find(
      (c) => String(c.id) === String(classId),
    );

    if (selectedClsData && selectedClsData.grade_status === "SUBMITTED") {
      setIsSubmitted(true);
    } else {
      setIsSubmitted(false);
    }

    setScoreRows([]);
    setScoreTypes([]);
    setError(null);
  };

  const handleScoreChange = (enrollmentId, scoreTypeId, value) => {
    if (isSubmitted) return;

    if (scoreTypeId === "remark") {
      setScoreRows((prev) =>
        prev.map((row) =>
          row.enrollmentId === enrollmentId ? { ...row, remark: value } : row,
        ),
      );
      return;
    }

    if (value !== "" && value !== ".") {
      if (!isValidNumberInput(value) || !isScoreInRange(value)) return;
    }

    setScoreRows((prev) =>
      prev.map((row) =>
        row.enrollmentId === enrollmentId
          ? { ...row, scores: { ...row.scores, [String(scoreTypeId)]: value } }
          : row,
      ),
    );
  };

  const handleBlurFormat = (enrollmentId, scoreTypeId) => {
    setFocusedCell(null);
    setScoreRows((prev) =>
      prev.map((row) => {
        if (row.enrollmentId !== enrollmentId) return row;

        const updated = { ...row, scores: { ...row.scores } };
        const val = updated.scores[String(scoreTypeId)];

        if (val !== "" && !isNaN(val)) {
          updated.scores[String(scoreTypeId)] = parseFloat(val).toFixed(1);
        }

        updated.average = calcAverage(updated.scores, scoreTypes);
        return updated;
      }),
    );
  };

  const getDisplayValue = (row, scoreTypeId) => {
    const raw = row.scores[String(scoreTypeId)] ?? "";
    const isFocused =
      focusedCell?.enrollmentId === row.enrollmentId &&
      focusedCell?.scoreTypeId === String(scoreTypeId);

    if (isFocused || raw === "" || isNaN(raw)) return raw;
    return parseFloat(raw).toFixed(1);
  };

  const handleLocalSave = () => {
    if (!selectedClass) return;
    localStorage.setItem(
      `temp_scores_class_${selectedClass}`,
      JSON.stringify(scoreRows),
    );
    alert("Đã lưu tạm vào trình duyệt!");
  };

  const handleSaveToDB = async () => {
    try {
      const scores = scoreRows.flatMap((row) =>
        scoreTypes
          .filter(
            (st) =>
              row.scores[String(st.id)] !== "" &&
              row.scores[String(st.id)] !== undefined,
          )
          .map((st) => ({
            enrollment_id: row.enrollmentId,
            score_type_id: st.id,
            score_value: parseFloat(row.scores[String(st.id)]),
          })),
      );

      await bulkSyncScoresApi(selectedClass, scores);
      localStorage.removeItem(`temp_scores_class_${selectedClass}`);
      alert("Đã lưu bảng điểm!");
    } catch (err) {
      console.error(err.response?.data);
      alert("Lưu thất bại, vui lòng thử lại.");
    }
  };

  const handleSubmit = async () => {
    if (!window.confirm("Xác nhận nộp? Bảng điểm sẽ bị khóa.")) return;
    try {
      const remarks = scoreRows
        .filter((row) => row.remark && row.remark.trim() !== "")
        .map((row) => ({
          enrollment_id: row.enrollmentId,
          comment: row.remark.trim(),
        }));

      const res = await submitScoresApi(selectedClass, { remarks });
      localStorage.removeItem(`temp_scores_class_${selectedClass}`);
      setIsSubmitted(true);
      alert(res?.message || "Đã nộp thành công!");
    } catch (err) {
      const errorMsg =
        err.response?.data?.detail ||
        err.response?.data?.[0] ||
        "Nộp thất bại, vui lòng kiểm tra lại dữ liệu.";
      alert(errorMsg);
    }
  };
  
  return (
    <ScoreEntryForm
      classes={classes}
      selectedClass={selectedClass}
      onClassChange={handleClassChange}
      scoreRows={scoreRows}
      scoreTypes={scoreTypes}
      isSubmitted={isSubmitted}
      loading={loading}
      error={error}
      onScoreChange={handleScoreChange}
      onBlurFormat={handleBlurFormat}
      onFocus={(enrollmentId, scoreTypeId) =>
        setFocusedCell({ enrollmentId, scoreTypeId: String(scoreTypeId) })
      }
      getDisplayValue={getDisplayValue}
      onLocalSave={handleLocalSave}
      onSaveToDB={handleSaveToDB}
      onSubmit={handleSubmit}
    />
  );
}

export default ScoreEntry;
