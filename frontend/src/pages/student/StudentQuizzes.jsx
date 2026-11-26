import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Calendar,
  ClipboardCheck,
  History,
  Loader2,
  Play,
  Trophy,
  UserCheck,
} from 'lucide-react';
import { quizzesAPI } from '../../api/services';
import { getErrorMessage } from '../../api/client';
import { EmptyState, Modal, PageHeader, SkeletonCard } from '../../components/common/UI';

export default function StudentQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Results Modal state
  const [resultsModalQuiz, setResultsModalQuiz] = useState(null);
  const [resultsList, setResultsList] = useState([]);
  const [loadingResults, setLoadingResults] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadQuizzes() {
      setLoading(true);
      try {
        const { data } = await quizzesAPI.getAll();
        if (active) setQuizzes(data?.quizzes || []);
      } catch (err) {
        toast.error(getErrorMessage(err, 'Failed to fetch available quizzes'));
      } finally {
        if (active) setLoading(false);
      }
    }
    loadQuizzes();
    return () => {
      active = false;
    };
  }, []);

  const handleOpenResults = async (quiz) => {
    setResultsModalQuiz(quiz);
    setResultsList([]);
    setLoadingResults(true);
    try {
      const { data } = await quizzesAPI.getResults(quiz.quiz_id);
      setResultsList(data?.results || []);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to load past quiz results'));
    } finally {
      setLoadingResults(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Quiz Lobby"
        subtitle="Test your mastery with timed, distraction-free assessments created by faculty."
      />

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <SkeletonCard key={n} lines={2} />
          ))}
        </div>
      ) : quizzes.length === 0 ? (
        <EmptyState
          icon={ClipboardCheck}
          title="No quizzes available yet"
          description="Faculty haven’t published any assessments yet. Check back soon!"
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => {
            const hasQuestions = (quiz.total_questions || 0) > 0;
            return (
              <div
                key={quiz.quiz_id}
                className="bg-white rounded-2xl border border-[#EBE9FE] p-6 shadow-card hover:shadow-card-hover transition-all flex flex-col"
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#EEF2FF] text-[#635BFF] border border-[#C7D2FE]">
                    {quiz.subject}
                  </span>
                  <span className="text-xs font-semibold text-[#13112B]/60">
                    {quiz.total_questions || 0} Question{quiz.total_questions === 1 ? '' : 's'}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-[#13112B] mb-2">{quiz.title}</h3>

                <div className="flex items-center gap-4 text-xs text-[#13112B]/55 mb-6 flex-1">
                  <span className="inline-flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-[#635BFF]" />
                    {quiz.faculty_name || 'Faculty'}
                  </span>
                  {quiz.created_at && (
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(quiz.created_at).toLocaleDateString()}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-4 border-t border-[#EBE9FE]">
                  {hasQuestions ? (
                    <Link
                      to={`/student/quizzes/${quiz.quiz_id}`}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-gradient text-white text-xs font-semibold shadow-md shadow-[#635BFF]/20 hover:shadow-lg transition-all"
                    >
                      <Play className="w-3.5 h-3.5" />
                      Start Quiz
                    </Link>
                  ) : (
                    <button
                      type="button"
                      disabled
                      title="No questions added yet"
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#F6F5FF] text-[#13112B]/40 text-xs font-semibold border border-[#EBE9FE] cursor-not-allowed"
                    >
                      No Questions
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleOpenResults(quiz)}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#F6F5FF] hover:bg-[#EBE9FE]/80 text-[#13112B] text-xs font-semibold border border-[#EBE9FE] transition-colors cursor-pointer"
                  >
                    <History className="w-3.5 h-3.5 text-[#635BFF]" />
                    Past Results
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Past Results Modal */}
      <Modal
        open={Boolean(resultsModalQuiz)}
        onClose={() => setResultsModalQuiz(null)}
        title={resultsModalQuiz ? `Past Results — ${resultsModalQuiz.title}` : 'Past Results'}
        subtitle={resultsModalQuiz?.subject}
      >
        {loadingResults ? (
          <div className="flex items-center justify-center py-10 gap-2 text-sm text-[#13112B]/60">
            <Loader2 className="w-5 h-5 animate-spin text-[#635BFF]" />
            Loading attempt history...
          </div>
        ) : resultsList.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-2xl bg-[#F6F5FF] text-[#635BFF] flex items-center justify-center mx-auto mb-3">
              <Trophy className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-[#13112B]">No attempts recorded yet</p>
            <p className="text-xs text-[#13112B]/60 mt-1">
              Complete this quiz to view your score history here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {resultsList.map((attempt, index) => {
              const total = attempt.total_questions || 1;
              const pct = Math.round((attempt.score / total) * 100);
              return (
                <div
                  key={attempt.attempt_id}
                  className="flex items-center justify-between p-4 rounded-xl bg-[#F8F7FF] border border-[#EBE9FE]"
                >
                  <div>
                    <p className="text-sm font-bold text-[#13112B]">
                      Attempt #{resultsList.length - index}
                    </p>
                    <p className="text-xs text-[#13112B]/55 mt-0.5">
                      {new Date(attempt.attempted_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#D1FAE5] text-[#059669]">
                      {attempt.score} / {attempt.total_questions} ({pct}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Modal>
    </div>
  );
}
