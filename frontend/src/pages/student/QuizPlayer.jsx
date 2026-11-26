import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle2,
  Clock,
  GraduationCap,
  Loader2,
  RotateCcw,
} from 'lucide-react';
import { quizzesAPI } from '../../api/services';
import { getErrorMessage } from '../../api/client';

const OPTION_KEYS = [
  { key: 'A', field: 'option_a' },
  { key: 'B', field: 'option_b' },
  { key: 'C', field: 'option_c' },
  { key: 'D', field: 'option_d' },
];

function formatTimer(seconds) {
  const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');
  return `${mins}:${secs}`;
}

export default function QuizPlayer() {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);

  useEffect(() => {
    let active = true;
    async function loadQuiz() {
      setLoading(true);
      try {
        const { data } = await quizzesAPI.getQuestions(quizId);
        if (!active) return;
        setQuiz(data?.quiz || null);
        setQuestions(data?.questions || []);
      } catch (err) {
        toast.error(getErrorMessage(err, 'Unable to load quiz questions'));
        navigate('/student/quizzes', { replace: true });
      } finally {
        if (active) setLoading(false);
      }
    }
    loadQuiz();
    return () => {
      active = false;
    };
  }, [quizId, navigate]);

  useEffect(() => {
    if (loading || submissionResult || questions.length === 0) return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [loading, submissionResult, questions.length]);

  const answeredCount = Object.keys(selectedAnswers).length;
  const allAnswered = questions.length > 0 && answeredCount === questions.length;
  const currentQuestion = questions[currentIndex];

  const handleSelectOption = (questionId, optionKey) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionKey,
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!allAnswered) {
      const firstUnansweredIdx = questions.findIndex((q) => !selectedAnswers[q.question_id]);
      if (firstUnansweredIdx !== -1) {
        setCurrentIndex(firstUnansweredIdx);
      }
      toast.error('Please answer all questions before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = questions.map((q) => ({
        question_id: q.question_id,
        selected_option: selectedAnswers[q.question_id],
      }));
      const { data } = await quizzesAPI.submit(quizId, payload);
      setSubmissionResult(data?.result);
      toast.success(data?.message || 'Quiz submitted!');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to submit quiz'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setCurrentIndex(0);
    setElapsedSeconds(0);
    setSubmissionResult(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F5FF] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#635BFF]" />
          <p className="text-sm font-medium text-[#13112B]/70">Preparing assessment...</p>
        </div>
      </div>
    );
  }

  if (submissionResult) {
    const total = submissionResult.total_questions || questions.length || 1;
    const score = submissionResult.score ?? 0;
    const pct = Math.round((score / total) * 100);

    return (
      <div className="min-h-screen bg-[#F6F5FF] flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white rounded-3xl border border-[#EBE9FE] shadow-card-hover p-8 sm:p-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-brand-gradient text-white flex items-center justify-center mx-auto mb-5 shadow-lg shadow-[#635BFF]/30">
            <Award className="w-8 h-8" />
          </div>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#D1FAE5] text-[#059669] mb-3">
            Assessment Complete
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#13112B] mb-1">
            {quiz?.title || 'Quiz Summary'}
          </h1>
          <p className="text-sm text-[#13112B]/60 mb-6">
            Completed in {formatTimer(elapsedSeconds)}
          </p>

          <div className="rounded-2xl bg-[#F8F7FF] border border-[#EBE9FE] p-6 mb-7">
            <p className="text-xs font-bold uppercase tracking-wider text-[#13112B]/50 mb-1">
              Your Score
            </p>
            <p className="text-5xl font-extrabold bg-gradient-to-r from-[#635BFF] to-[#7C3AED] bg-clip-text text-transparent">
              {pct}%
            </p>
            <p className="text-sm font-semibold text-[#13112B]/75 mt-2">
              {score} out of {total} questions answered correctly
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleRetake}
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#F6F5FF] hover:bg-[#EBE9FE] text-[#13112B] text-sm font-semibold border border-[#EBE9FE] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-[#635BFF]" />
              Retake Quiz
            </button>
            <Link
              to="/student/quizzes"
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-brand-gradient text-white text-sm font-semibold shadow-lg shadow-[#635BFF]/25 transition-all"
            >
              Back to Quiz Lobby
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F6F5FF]">
      {/* Dark Navy Left Sidebar */}
      <aside className="lg:w-[320px] bg-navy-sidebar text-white p-6 sm:p-8 flex flex-col justify-between shrink-0">
        <div>
          <div className="flex items-center justify-between mb-8">
            <Link
              to="/student/quizzes"
              className="inline-flex items-center gap-2 text-xs font-semibold text-white/70 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Exit Quiz
            </Link>
            <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
          </div>

          <span className="inline-block px-3 py-1 rounded-full text-[11px] font-semibold bg-white/10 text-[#C4B5FD] mb-3">
            {quiz?.subject || 'Assessment'}
          </span>
          <h1 className="text-xl font-extrabold text-white leading-snug mb-6">
            {quiz?.title || 'Quiz'}
          </h1>

          {/* Live Timer */}
          <div className="rounded-2xl bg-white/8 border border-white/10 p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-xs text-white/70">
              <Clock className="w-4 h-4 text-[#A59BFF]" />
              <span>Elapsed Time</span>
            </div>
            <span className="font-heading font-bold text-lg text-white tabular-nums">
              {formatTimer(elapsedSeconds)}
            </span>
          </div>

          {/* Question Progress Tracker */}
          <div>
            <div className="flex items-center justify-between text-xs text-white/65 mb-3">
              <span className="font-semibold uppercase tracking-wider">Question Tracker</span>
              <span>
                {answeredCount} / {questions.length} answered
              </span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                const isAnswered = Boolean(selectedAnswers[q.question_id]);
                return (
                  <button
                    key={q.question_id}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-10 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-brand-gradient text-white ring-2 ring-white/60 shadow-md'
                        : isAnswered
                        ? 'bg-emerald-500/25 text-emerald-200 border border-emerald-400/40'
                        : 'bg-white/8 text-white/70 hover:bg-white/15 border border-white/10'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 text-xs text-white/50">
          Answer all {questions.length} questions to unlock submission.
        </div>
      </aside>

      {/* White Right Panel */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-12">
        {questions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#EBE9FE] p-8 text-center max-w-md shadow-card">
            <p className="text-base font-bold text-[#13112B] mb-2">
              This quiz has no questions yet
            </p>
            <Link
              to="/student/quizzes"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#635BFF] hover:underline"
            >
              Return to Quiz Lobby
            </Link>
          </div>
        ) : (
          <div className="w-full max-w-2xl bg-white rounded-3xl border border-[#EBE9FE] shadow-card p-6 sm:p-10">
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-[#635BFF] bg-[#F6F5FF] px-3 py-1 rounded-full border border-[#EBE9FE]">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span className="text-xs font-medium text-[#13112B]/55">
                {selectedAnswers[currentQuestion.question_id]
                  ? `Selected: Option ${selectedAnswers[currentQuestion.question_id]}`
                  : 'Choose one option'}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-[#13112B] leading-snug mb-7">
              {currentQuestion.question_text}
            </h2>

            {/* Selectable Option Cards */}
            <div className="space-y-3.5 mb-8">
              {OPTION_KEYS.map(({ key, field }) => {
                const isSelected = selectedAnswers[currentQuestion.question_id] === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleSelectOption(currentQuestion.question_id, key)}
                    className={`w-full text-left p-4 sm:p-5 rounded-2xl border-2 transition-all duration-150 flex items-center gap-4 cursor-pointer ${
                      isSelected
                        ? 'border-[#635BFF] bg-[#F6F5FF] shadow-sm'
                        : 'border-[#EBE9FE] bg-white hover:border-[#C7C2FE] hover:bg-[#F8F7FF]'
                    }`}
                  >
                    <span
                      className={`w-9 h-9 rounded-xl text-sm font-bold flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-brand-gradient text-white'
                          : 'bg-[#F6F5FF] text-[#13112B]/70 border border-[#EBE9FE]'
                      }`}
                    >
                      {key}
                    </span>
                    <span className="text-sm sm:text-base font-medium text-[#13112B] flex-1">
                      {currentQuestion[field]}
                    </span>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-[#635BFF] shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Navigation Footer */}
            <div className="flex items-center justify-between gap-3 pt-5 border-t border-[#EBE9FE]">
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F6F5FF] text-[#13112B] text-sm font-semibold border border-[#EBE9FE] disabled:opacity-40 disabled:pointer-events-none hover:bg-[#EBE9FE] transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </button>

              <div className="flex items-center gap-3">
                {currentIndex < questions.length - 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))
                    }
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#13112B] text-white text-sm font-semibold hover:bg-[#1A173B] transition-colors cursor-pointer"
                  >
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}

                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleSubmitQuiz}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    allAnswered
                      ? 'bg-brand-gradient text-white shadow-lg shadow-[#635BFF]/25 hover:shadow-xl'
                      : 'bg-[#EBE9FE] text-[#13112B]/60 hover:bg-[#DDD6FE]'
                  }`}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Quiz'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
