export function getStudentDoubts(userId) {
  if (!userId) return [];
  try {
    const raw = localStorage.getItem(`edubridge_student_doubts_${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStudentDoubts(userId, doubts) {
  if (!userId) return;
  localStorage.setItem(`edubridge_student_doubts_${userId}`, JSON.stringify(doubts));
}

export function getFacultyQuizzes(userId) {
  if (!userId) return [];
  try {
    const raw = localStorage.getItem(`edubridge_faculty_quizzes_${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveFacultyQuizzes(userId, quizzes) {
  if (!userId) return;
  localStorage.setItem(`edubridge_faculty_quizzes_${userId}`, JSON.stringify(quizzes));
}
